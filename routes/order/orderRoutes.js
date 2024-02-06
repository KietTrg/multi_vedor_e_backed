const router = require("express").Router();
const orderControllers = require("../../controllers/order/orderControllers");
router.post("/order/place-order", orderControllers.place_order);
router.get("/customer/get-data/:userId", orderControllers.get_data);
router.get(
  "/customer/get-orders/:customerId/:status",
  orderControllers.get_orders
);
router.get("/customer/get-order/:orderId", orderControllers.get_order);

module.exports = router;
