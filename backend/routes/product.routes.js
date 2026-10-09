const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload"); // <-- add

const {
  getProducts,
  getProductById,
  getProductAsset,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

router.get("/", getProducts);
router.get("/:id/assets/:asset", getProductAsset);
router.get("/:id", getProductById);

router.post(
  "/",
  auth,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "productFile",
      maxCount: 1,
    },
  ]),
  createProduct
);

router.put(
  "/:id",
  auth,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "productFile",
      maxCount: 1,
    },
  ]),
  updateProduct
);

router.delete("/:id", auth, deleteProduct);

module.exports = router;