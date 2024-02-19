const router = require("express").Router();
const ChatCotrollers = require("../controllers/chat/ChatCotrollers");
const { authMiddleware } = require("../middlewares/authMiddlewares");

router.post(
  "/chat/customer/add-customer-friend",
  ChatCotrollers.add_customer_friend
);
router.post(
  "/chat/customer/send-message-to-seller",
  ChatCotrollers.send_message_customer
);
router.get(
  "/chat/seller/get-customers/:sellerId",
  ChatCotrollers.get_customers
);
router.get(
  "/chat/seller/get_customer_message/:customerId",
  authMiddleware,
  ChatCotrollers.get_customer_message
);

router.post(
  "/chat/seller/send-message-to-customer",
  authMiddleware,
  ChatCotrollers.send_message_seller
);

router.get(
  "/chat/admin/get-sellers",
  authMiddleware,
  ChatCotrollers.get_sellers
);

router.post(
  "/chat/send-message-seller-admin",
  authMiddleware,
  ChatCotrollers.send_message_seller_admin
);
router.get(
  "/chat/get-admin-message/:receverId",
  authMiddleware,
  ChatCotrollers.get_admin_message
);
router.get(
  "/chat/get-seller-message",
  authMiddleware,
  ChatCotrollers.get_seller_message
);
module.exports = router;
