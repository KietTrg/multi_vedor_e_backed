const router = require("express").Router();
const ChatCotrollers = require("../controllers/chat/ChatCotrollers");

router.post(
  "/chat/customer/add-customer-friend",
  ChatCotrollers.add_customer_friend
);
module.exports = router;
