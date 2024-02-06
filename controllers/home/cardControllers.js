const cardModel = require("../../models/cardModel");
const wishlistModel = require("../../models/wishlistModel");
const { responseReturn } = require("../../utiles/response");
const {
  mongo: { ObjectId },
} = require("mongoose");
const add_to_card = async (req, res) => {
  const { userId, quantity, productId } = req.body;
  try {
    const product = await cardModel.findOne({
      $and: [
        {
          productId: {
            $eq: productId,
          },
        },
        {
          userId: {
            $eq: userId,
          },
        },
      ],
    });
    if (product) {
      responseReturn(res, 404, { error: "Product already added to card" });
    } else {
      const product = await cardModel.create({
        userId,
        productId,
        quantity,
      });
      responseReturn(res, 201, { message: "Add to card success", product });
    }
  } catch (error) {
    console.log("error: ", error);
  }
};
const get_card = async (req, res) => {
  const co = 5;
  const { userId } = req.params;

  try {
    const card_products = await cardModel.aggregate([
      {
        $match: {
          userId: {
            $eq: new ObjectId(userId),
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "products",
        },
      },
    ]);
    // console.log("card_products: ", card_products);
    let buyProductItem = 0;
    let calculatePrice = 0;
    let count = 0;
    const outOfStockProduct = card_products.filter(
      (e) => e.products[0].stock < e.quantity
    );
    // console.log("outOfStockProduct: ", outOfStockProduct);
    for (let i = 0; i < outOfStockProduct.length; i++) {
      count = count + outOfStockProduct[i].quantity;
    }
    // console.log("count: ", count);

    const stockProduct = card_products.filter(
      (e) => e.products[0].stock >= e.quantity
    );
    // console.log("stockProduct: ", stockProduct);
    for (let i = 0; i < stockProduct.length; i++) {
      const { quantity } = stockProduct[i];
      // console.log("quantity: ", quantity);
      count = count + 1;
      // count = count + quantity;
      buyProductItem = buyProductItem + quantity;

      const { price, discount } = stockProduct[i].products[0];
      // console.log("discount: ", discount);
      // console.log("price: ", price);
      if (discount !== 0) {
        calculatePrice =
          calculatePrice +
          quantity * (price - Math.floor((price * discount) / 100));
      } else {
        calculatePrice = calculatePrice + quantity * price;
      }
    }
    // console.log("calculatePrice: ", calculatePrice);
    // console.log("count: ", count);

    let p = [];
    let unique = [
      ...new Set(stockProduct.map((el) => el.products[0].sellerId.toString())),
    ];
    // console.log("stockProduct: ", stockProduct.length);
    // console.log("unique: ", unique);
    for (let i = 0; i < unique.length; i++) {
      let price = 0;
      for (let j = 0; j < stockProduct.length; j++) {
        const tempProduct = stockProduct[j].products[0];
        if (unique[i] === tempProduct.sellerId.toString()) {
          let pri = 0;
          if (tempProduct.discount !== 0) {
            pri =
              tempProduct.price -
              Math.floor((tempProduct.price * tempProduct.discount) / 100);
          } else {
            pri = tempProduct.price;
          }
          pri = pri - Math.floor((pri * co) / 100);
          price = price + pri * stockProduct[j].quantity;
          p[i] = {
            sellerId: unique[i],
            shopName: tempProduct.shopName,
            price,
            products: p[i]
              ? [
                  ...p[i].products,
                  {
                    _id: stockProduct[j]._id,
                    quantity: stockProduct[j].quantity,
                    productInfo: tempProduct,
                  },
                ]
              : [
                  {
                    _id: stockProduct[j]._id,
                    quantity: stockProduct[j].quantity,
                    productInfo: tempProduct,
                  },
                ],
          };
        }
      }
    }
    responseReturn(res, 200, {
      // card_products,
      card_products: p,
      price: calculatePrice,
      count,
      shipping_fee: 50000 * p.length,
      outOfStockProduct,
      buyProductItem,
    });
  } catch (error) {
    console.log("error: ", error);
  }
};
const delete_card = async (req, res) => {
  const { cardId } = req.params;
  try {
    await cardModel.findByIdAndDelete(cardId);
    responseReturn(res, 200, { message: "delete card success" });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const quantity_inc = async (req, res) => {
  const { cardId } = req.params;
  // console.log("req.params: ", req);
  try {
    const card = await cardModel.findById(cardId);
    // console.log("card: ", card);
    const { quantity } = card;
    await cardModel.findByIdAndUpdate(cardId, {
      quantity: quantity + 1,
    });
    responseReturn(res, 200, { message: "success" });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const quantity_dec = async (req, res) => {
  const { cardId } = req.params;
  // console.log("req.params: ", req);
  try {
    const card = await cardModel.findById(cardId);
    // console.log("card: ", card);
    const { quantity } = card;
    await cardModel.findByIdAndUpdate(cardId, {
      quantity: quantity - 1,
    });
    responseReturn(res, 200, { message: "success" });
  } catch (error) {
    console.log("error: ", error.message);
  }
};

const add_to_wishlist = async (req, res) => {
  const { userId, name, productId, price, image, discount, slug } = req.body;
  // console.log("req.body: ", req.body);
  try {
    const product = await wishlistModel.findOne({
      productId,
    });
    if (product) {
      responseReturn(res, 404, { error: "Product already added to card" });
    } else {
      const product = await wishlistModel.create({
        userId,
        name,
        productId,
        price,
        image,
        discount,
        slug,
      });
      responseReturn(res, 200, { message: "Add to wishlist success", product });
    }
  } catch (error) {
    console.log("error: ", error);
  }
};
const get_wishlist = async (req, res) => {
  const { userId } = req.params;
  try {
    const wishlistCount = await wishlistModel.find({ userId }).countDocuments();
    const wishlist = await wishlistModel.find({ userId });
    // console.log("wishlist: ", wishlist);
    responseReturn(res, 200, { wishlist, wishlistCount });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const delete_wishlist = async (req, res) => {
  const { wishlistId } = req.params;
  try {
    await wishlistModel.findByIdAndDelete(wishlistId);
    responseReturn(res, 200, {
      message: "delete wishlist success",
      wishlistId,
    });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
module.exports = {
  add_to_card,
  get_card,
  delete_card,
  quantity_inc,
  quantity_dec,
  add_to_wishlist,
  get_wishlist,
  delete_wishlist,
};
