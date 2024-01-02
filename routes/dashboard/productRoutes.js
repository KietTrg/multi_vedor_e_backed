const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddlewares");
const productController = require("../../controllers/dashboard/productController");

router.post("/product-add", authMiddleware, productController.add_product);
router.post(
  "/product-update",
  authMiddleware,
  productController.update_product
);
router.get("/products-get", authMiddleware, productController.products_get);
router.get(
  "/product-get/:productId",
  authMiddleware,
  productController.product_get
);

module.exports = router;
