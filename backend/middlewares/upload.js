
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

const containerClient = blobServiceClient.getContainerClient(containerName);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB maximum
  },
});

upload.uploadToAzure = async (file) => {
  const blobName = `${Date.now()}-${file.originalname.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  )}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  });

  return {
    url: blockBlobClient.url,
    blobName,
  };
};

module.exports = upload;
