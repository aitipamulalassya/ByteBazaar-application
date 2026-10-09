
exports.getProductAsset = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const assetType = req.params.asset;

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !["thumbnail", "file"].includes(assetType)
    ) {
      return res.status(400).json({
        message: "Invalid product or asset",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, productId)
      .query(`
        SELECT
          id,
          thumbnail_public_id,
          file_public_id,
          thumbnail_url,
          file_url,
          file_type
        FROM products
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = result.recordset[0];

    const blobName =
      assetType === "thumbnail"
        ? product.thumbnail_public_id
        : product.file_public_id;

    if (!blobName) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const blobClient = upload.getBlobClient(blobName);
    const downloadResponse = await blobClient.download();

    const contentType =
      assetType === "thumbnail"
        ? downloadResponse.contentType || "application/octet-stream"
        : product.file_type || downloadResponse.contentType ||
          "application/octet-stream";

    const isDownload = req.query.download === "1";

    const disposition = isDownload ? "attachment" : "inline";

    const safeFilename = blobName
      .split("/")
      .pop()
      .replace(/["\r\n]/g, "_");

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${safeFilename}"`
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");

    if (!downloadResponse.readableStreamBody) {
      return res.status(502).json({
        message: "Unable to read file from storage",
      });
    }

    downloadResponse.readableStreamBody.on("error", (err) => {
      console.error("Blob stream error:", err.message);

      if (!res.headersSent) {
        res.status(502).end("Unable to retrieve file");
      } else {
        res.destroy(err);
      }
    });

    downloadResponse.readableStreamBody.pipe(res);
  } catch (err) {
    console.error("Product asset error:", err.message);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Unable to retrieve product file",
      });
    } else {
      res.destroy(err);
    }
  }
};
