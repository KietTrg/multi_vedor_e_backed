const router = require("express").Router();
const cardControllers = require("../../controllers/home/cardControllers");
router.post("/home/product/add_to_card", cardControllers.add_to_card);
router.get("/home/product/get-card/:userId", cardControllers.get_card);
router.delete("/home/product/delete-card/:cardId", cardControllers.delete_card);
router.put("/home/product/quantity-inc/:cardId", cardControllers.quantity_inc);
router.put("/home/product/quantity-dec/:cardId", cardControllers.quantity_dec);

router.post("/home/product/add_to_wishlist", cardControllers.add_to_wishlist);
router.get("/home/product/get-wishlists/:userId", cardControllers.get_wishlist);
router.delete(
  "/home/product/delete-wishlists/:wishlistId",
  cardControllers.delete_wishlist
);

module.exports = router;
