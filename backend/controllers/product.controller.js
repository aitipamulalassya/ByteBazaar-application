
const { sql, poolPromise } = require("../config/db");
const upload = require("../middlewares/upload");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT p.*, u.username
      FROM products p
      JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Get Products Error:", err.message);
    res.status(500).json({ message: "Failed to retrieve products" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM products WHERE id = @id");

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Get Product Error:", err.message);
    res.status(500).json({ message: "Failed to retrieve product" });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description } = req.body;
    const thumbnail = req.files?.thumbnail?.[0];
    const productFile = req.files?.productFile?.[0];

    if (!thumbnail || !productFile) {
      return res.status(400).json({
        message: "Thumbnail and product file are required",
      });
    }

    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required",
      });
    }

    const thumbnailUpload = await upload.uploadToAzure(thumbnail);
    const fileUpload = await upload.uploadToAzure(productFile);

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("description", sql.VarChar, description)
      .input("price", sql.Decimal(10, 2), 0)
      .input("thumbnail_url", sql.VarChar, thumbnailUpload.url)
      .input("thumbnail_public_id", sql.VarChar, thumbnailUpload.blobName)
      .input("file_url", sql.VarChar, fileUpload.url)
      .input("file_public_id", sql.VarChar, fileUpload.blobName)
      .input("file_type", sql.VarChar, productFile.mimetype)
      .input("file_size", sql.Int, productFile.size)
      .input("created_by", sql.Int, req.user.id)
      .query(`
        INSERT INTO products (
          name, description, price,
          thumbnail_url, thumbnail_public_id,
          file_url, file_public_id, file_type, file_size, created_by
        )
        OUTPUT INSERTED.id
        VALUES (
          @name, @description, @price,
          @thumbnail_url, @thumbnail_public_id,
          @file_url, @file_public_id, @file_type, @file_size, @created_by
        )
      `);

    const productResult = await pool
      .request()
      .input("id", sql.Int, result.recordset[0].id)
      .query("SELECT * FROM products WHERE id = @id");

    res.status(201).json(productResult.recordset[0]);
  } catch (err) {
    console.error("Create Product Error:", err.message);
    res.status(500).json({ message: "Failed to create product" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    const thumbnail = req.files?.thumbnail?.[0];
    const productFile = req.files?.productFile?.[0];

    const pool = await poolPromise;

    const existingResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM products WHERE id = @id");

    if (!existingResult.recordset.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    const current = existingResult.recordset[0];

    const thumbnailUpload = thumbnail
      ? await upload.uploadToAzure(thumbnail)
      : null;

    const fileUpload = productFile
      ? await upload.uploadToAzure(productFile)
      : null;

    await pool
      .request()
      .input("name", sql.VarChar, name ?? current.name)
      .input("description", sql.VarChar, description ?? current.description)
      .input(
        "thumbnail_url",
        sql.VarChar,
        thumbnailUpload?.url ?? current.thumbnail_url
      )
      .input(
        "thumbnail_public_id",
        sql.VarChar,
        thumbnailUpload?.blobName ?? current.thumbnail_public_id
      )
      .input("file_url", sql.VarChar, fileUpload?.url ?? current.file_url)
      .input(
        "file_public_id",
        sql.VarChar,
        fileUpload?.blobName ?? current.file_public_id
      )
      .input("file_type", sql.VarChar, productFile?.mimetype ?? current.file_type)
      .input("file_size", sql.Int, productFile?.size ?? current.file_size)
      .input("id", sql.Int, id)
      .query(`
        UPDATE products SET
          name = @name,
          description = @description,
          thumbnail_url = @thumbnail_url,
          thumbnail_public_id = @thumbnail_public_id,
          file_url = @file_url,
          file_public_id = @file_public_id,
          file_type = @file_type,
          file_size = @file_size
        WHERE id = @id
      `);

    const updated = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM products WHERE id = @id");

    res.json(updated.recordset[0]);
  } catch (err) {
    console.error("Update Product Error:", err.message);
    res.status(500).json({ message: "Failed to update product" });
  }
};

// Delete product record
exports.deleteProduct = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM products WHERE id = @id");

    res.json({ success: true });
  } catch (err) {
    console.error("Delete Product Error:", err.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// Stream a private Blob Storage asset
exports.getProductAsset = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const assetType = req.params.asset;

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !["thumbnail", "file"].includes(assetType)
    ) {
      return res.status(400).json({ message: "Invalid product or asset" });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, productId)
      .query(`
        SELECT thumbnail_public_id, file_public_id, file_type
        FROM products WHERE id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = result.recordset[0];
    const blobName =
      assetType === "thumbnail"
        ? product.thumbnail_public_id
        : product.file_public_id;

    if (!blobName) {
      return res.status(404).json({ message: "File not found" });
    }

    const blobClient = upload.getBlobClient(blobName);
    const blob = await blobClient.download();

    if (!blob.readableStreamBody) {
      return res.status(502).json({ message: "Unable to read file" });
    }

    const contentType =
      assetType === "thumbnail"
        ? blob.contentType || "application/octet-stream"
        : product.file_type || blob.contentType || "application/octet-stream";

    const filename = blobName.split("/").pop().replace(/["\r\n]/g, "_");

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `${req.query.download === "1" ? "attachment" : "inline"}; filename="${filename}"`
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");

    blob.readableStreamBody.on("error", (err) => {
      console.error("Blob stream error:", err.message);
      if (!res.headersSent) res.status(502).end("Unable to retrieve file");
      else res.destroy(err);
    });

    blob.readableStreamBody.pipe(res);
  } catch (err) {
    console.error("Product asset error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "Unable to retrieve product file" });
    } else {
      res.destroy(err);
    }
  }
};
