const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddlewares");
const authController = require("../controllers/authControllers");
router.post("/admin-login", authController.admin_login);
router.get("/get-user", authMiddleware, authController.getUser);
router.post("/seller-register", authController.seller_register);
router.post("/seller-login", authController.seller_login);
router.post(
  "/profile-image-upload",
  authMiddleware,
  authController.profile_image_upload
);
router.post(
  "/profile-info-add",
  authMiddleware,
  authController.profile_info_add
);
router.get("/seller-logout", authMiddleware, authController.seller_logout);
module.exports = router;
