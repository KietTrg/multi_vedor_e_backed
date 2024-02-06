const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddlewares");
const categoryController = require("../../controllers/dashboard/categoryController");
router.post("/category-add", authMiddleware, categoryController.add_category);
router.post(
  "/category-delete",
  authMiddleware,
  categoryController.delete_category
);
router.get("/categorys-get", authMiddleware, categoryController.get_categorys);
router.get(
  "/category-get/:categoryId",
  authMiddleware,
  categoryController.get_category
);

module.exports = router;
