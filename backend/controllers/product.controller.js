const db = require("../config/db");

exports.getProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT
        p.*,
        u.username
      FROM products p
      JOIN users u
      ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getProductById = async (
  req,
  res
) => {
  try {
    const [products] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );

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

exports.createProduct = async (
  req,
  res
) => {
   console.log("=== CREATE PRODUCT CONTROLLER ===");
  try {
    const { name, description } =
      req.body;

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

    const sql = `
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] =
      await db.query(sql, [
        name,
        description,
        0,

        thumbnail.path,
        thumbnail.filename,

        productFile.path,
        productFile.filename,

        productFile.mimetype,
        productFile.size,

        req.user.id,
      ]);

    const [products] =
      await db.query(
        "SELECT * FROM products WHERE id = ?",
        [result.insertId]
      );

    res.status(201).json(
      products[0]
    );
  } catch (err) {
  console.error("Create Product Error:", err);
  console.error("Body:", req.body);
  console.error("Files:", req.files);

  res.status(500).json({
    message: err.message,
    error: err,
  });
}
};

exports.updateProduct = async (
  req,
  res
) => {
  try {
    const id = req.params.id;

    const { name, description } =
      req.body;

    const thumbnail =
      req.files?.thumbnail?.[0];

    const productFile =
      req.files?.productFile?.[0];

    const [existing] =
      await db.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );

    if (
      existing.length === 0
    ) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    const current =
      existing[0];

    await db.query(
      `
      UPDATE products
      SET
        name = ?,
        description = ?,

        thumbnail_url = ?,
        thumbnail_public_id = ?,

        file_url = ?,
        file_public_id = ?,

        file_type = ?,
        file_size = ?

      WHERE id = ?
    `,
      [
        name ??
          current.name,

        description ??
          current.description,

        thumbnail?.path ??
          current.thumbnail_url,

        thumbnail?.filename ??
          current.thumbnail_public_id,

        productFile?.path ??
          current.file_url,

        productFile?.filename ??
          current.file_public_id,

        productFile?.mimetype ??
          current.file_type,

        productFile?.size ??
          current.file_size,

        id,
      ]
    );

    const [updated] =
      await db.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteProduct = async (
  req,
  res
) => {
  try {
    await db.query(
      "DELETE FROM products WHERE id = ?",
      [req.params.id]
    );

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