const router = require("express").Router();
const { authMiddleware } = require("../middlewares/authMiddlewares");
const authController = require("../controllers/authControllers");
router.post("/admin-login", authController.admin_login);
router.get("/get-user", authMiddleware, authController.getUser);
router.post("/seller-register", authController.seller_register);
router.post("/seller-login", authController.seller_login);
module.exports = router;
