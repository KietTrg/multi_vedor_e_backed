const router = require("express").Router();
const orderControllers = require("../../controllers/order/orderControllers");
router.post("/home/order/place-order", orderControllers.place_order);
router.get("/home/customer/get-data/:userId", orderControllers.get_data);
router.get(
  "/home/customer/get-orders/:customerId/:status",
  orderControllers.get_orders
);
router.get("/home/customer/get-order/:orderId", orderControllers.get_order);
//admin
router.get("/admin/orders", orderControllers.get_admin_orders);
router.get("/admin/order/:orderId", orderControllers.get_admin_order);
router.put(
  "/admin/order-status/update/:orderId",
  orderControllers.admin_order_update_status
);
//seller
router.get("/seller/orders/:sellerId", orderControllers.get_seller_orders);
router.get("/seller/order/:orderId", orderControllers.get_seller_order);
router.put(
  "/seller/order-status/update/:orderId",
  orderControllers.seller_order_update_status
);
module.exports = router;
