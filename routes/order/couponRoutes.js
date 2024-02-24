const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/authMiddlewares");
const couponController = require("../../controllers/order/couponController");

router.post("/coupon", authMiddleware, couponController.add_coupon);
router.get("/get-coupons", authMiddleware, couponController.get_coupons);
router.delete(
  "/delete-coupons/:cId",
  authMiddleware,
  couponController.delete_coupon
);
router.post("/apply-coupon", authMiddleware, couponController.apply_coupon);
module.exports = router;
