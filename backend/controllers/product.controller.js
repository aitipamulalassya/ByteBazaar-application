const { sql, poolPromise } = require("../config/db");

exports.getProducts = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .query(`
        SELECT
          p.*,
          u.username
        FROM products p
        JOIN users u
          ON p.created_by = u.id
        ORDER BY p.created_at DESC
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT *
        FROM products
        WHERE id = @id
      `);

    const products = result.recordset;

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(products[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};


exports.createProduct = async (req, res) => {
  console.log("=== CREATE PRODUCT CONTROLLER ===");

  try {
    const { name, description } = req.body;

    const thumbnail =
      req.files?.thumbnail?.[0];

    const productFile =
      req.files?.productFile?.[0];

    if (!thumbnail || !productFile) {
      return res.status(400).json({
        message:
          "Thumbnail and product file are required",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("description", sql.VarChar, description)
      .input("price", sql.Decimal(10, 2), 0)
      .input(
        "thumbnail_url",
        sql.VarChar,
        thumbnail.path
      )
      .input(
        "thumbnail_public_id",
        sql.VarChar,
        thumbnail.filename
      )
      .input(
        "file_url",
        sql.VarChar,
        productFile.path
      )
      .input(
        "file_public_id",
        sql.VarChar,
        productFile.filename
      )
      .input(
        "file_type",
        sql.VarChar,
        productFile.mimetype
      )
      .input(
        "file_size",
        sql.Int,
        productFile.size
      )
      .input(
        "created_by",
        sql.Int,
        req.user.id
      )
      .query(`
        INSERT INTO products (
          name,
          description,
          price,
          thumbnail_url,
          thumbnail_public_id,
          file_url,
          file_public_id,
          file_type,
          file_size,
          created_by
        )
        OUTPUT INSERTED.id
        VALUES (
          @name,
          @description,
          @price,
          @thumbnail_url,
          @thumbnail_public_id,
          @file_url,
          @file_public_id,
          @file_type,
          @file_size,
          @created_by
        )
      `);

    const productId = result.recordset[0].id;

    const productResult = await pool
      .request()
      .input("id", sql.Int, productId)
      .query(`
        SELECT *
        FROM products
        WHERE id = @id
      `);

    res.status(201).json(
      productResult.recordset[0]
    );

  } catch (err) {
    console.error("Create Product Error:", err);
    console.error("Body:", req.body);
    console.error("Files:", req.files);

    res.status(500).json({
      message: err.message,
    });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const { name, description } = req.body;

    const thumbnail =
      req.files?.thumbnail?.[0];

    const productFile =
      req.files?.productFile?.[0];

    const pool = await poolPromise;

    const existingResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT *
        FROM products
        WHERE id = @id
      `);

    const existing = existingResult.recordset;

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const current = existing[0];

    await pool
      .request()
      .input(
        "name",
        sql.VarChar,
        name ?? current.name
      )
      .input(
        "description",
        sql.VarChar,
        description ?? current.description
      )
      .input(
        "thumbnail_url",
        sql.VarChar,
        thumbnail?.path ?? current.thumbnail_url
      )
      .input(
        "thumbnail_public_id",
        sql.VarChar,
        thumbnail?.filename ??
          current.thumbnail_public_id
      )
      .input(
        "file_url",
        sql.VarChar,
        productFile?.path ??
          current.file_url
      )
      .input(
        "file_public_id",
        sql.VarChar,
        productFile?.filename ??
          current.file_public_id
      )
      .input(
        "file_type",
        sql.VarChar,
        productFile?.mimetype ??
          current.file_type
      )
      .input(
        "file_size",
        sql.Int,
        productFile?.size ??
          current.file_size
      )
      .input("id", sql.Int, id)
      .query(`
        UPDATE products
        SET
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

    const updatedResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT *
        FROM products
        WHERE id = @id
      `);

    res.json(updatedResult.recordset[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        DELETE FROM products
        WHERE id = @id
      `);

    res.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};