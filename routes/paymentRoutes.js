const router = require("express").Router();
const paymentController = require("../controllers/payment/paymentController");
const { authMiddleware } = require("../middlewares/authMiddlewares");

router.get(
  "/payment/create-stripe-connect-account",
  authMiddleware,
  paymentController.create_stripe_connect_account
);
router.put(
  "/payment/active-stripe-connect-account/:activeCode",
  authMiddleware,
  paymentController.active_stripe_connect_account
);
router.get(
  "/payment/seller-payment-details/:sellerId",
  authMiddleware,
  paymentController.get_seller_payment_details
);
router.post(
  "/payment/send-withdrawal-request",
  authMiddleware,
  paymentController.send_withdrawal_request
);
router.get(
  "/payment/gets-payment-request",
  authMiddleware,
  paymentController.get_payment_request
);
router.post(
  "/payment/confirm-payment-request",
  authMiddleware,
  paymentController.confirm_payment_request
);
module.exports = router;
