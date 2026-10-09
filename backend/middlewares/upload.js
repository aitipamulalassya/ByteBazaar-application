
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!accountName || !containerName) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_CONTAINER_NAME must be configured"
  );
}

const credential = new DefaultAzureCredential();

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential
);

const containerClient =
  blobServiceClient.getContainerClient(containerName);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

upload.uploadToAzure = async (file) => {
  const safeName = file.originalname.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  const blobName = `${Date.now()}-${require("crypto").randomUUID()}-${safeName}`;

  const blobClient = containerClient.getBlockBlobClient(blobName);

  await blobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  });

  return {
    url: blobClient.url,
    blobName,
  };
};

// Used by the backend to read files from private Blob Storage.
upload.getBlobClient = (blobName) =>
  containerClient.getBlobClient(blobName);

module.exports = upload;
