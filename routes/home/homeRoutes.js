const router = require("express").Router();
const homeControllers = require("../../controllers/home/homeControllers");
router.get("/get-categorys", homeControllers.get_categorys);

router.get("/getAll-coupon", homeControllers.getAll_coupon);
router.get(
  "/get-voucher-customer/:userId",
  homeControllers.get_voucher_customer
);
router.post("/add-to-voucher", homeControllers.add_to_voucher);
// router.post("/update-expire-voucher", homeControllers.update_expire_voucher);

router.get("/get-products", homeControllers.get_products);
router.get("/get-product/:pid", homeControllers.get_product);
router.get("/price-range-latest-product", homeControllers.price_range_product);
router.get("/query-products", homeControllers.query_products);

router.post("/customer/submit-review", homeControllers.customer_review);
router.get("/customer/get-review/:productId", homeControllers.get_review);
module.exports = router;
