const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddlewares");
const dashboardController = require("../../controllers/dashboard/dashboardController");

router.get(
  "/seller/get-seller-dashboard",
  authMiddleware,
  dashboardController.get_seller_dashboard
);
router.get(
  "/admin/get-admin-dashboard",
  authMiddleware,
  dashboardController.get_admin_dashboard
);

module.exports = router;
