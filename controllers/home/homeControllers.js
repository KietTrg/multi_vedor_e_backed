const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const { responseReturn } = require("../../utiles/response");
const queryProducts = require("../../utiles/queryProducts");
const reviewModel = require("../../models/reviewModel");
const moment = require("moment");
const {
  mongo: { ObjectId },
} = require("mongoose");
const formateProduct = (products) => {
  const productArray = [];
  let i = 0;
  while (i < products.length) {
    let temp = [];
    let j = i;
    while (j < i + 3) {
      if (products[j]) {
        temp.push(products[j]);
      }
      j++;
    }
    productArray.push([...temp]);
    i = j;
  }
  return productArray;
};

const get_categorys = async (req, res) => {
  try {
    const categorys = await categoryModel.find({});
    responseReturn(res, 200, { categorys });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_products = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .limit(16)
      .sort({ createdAt: -1 });
    const allProducyLates = await productModel
      .find({})
      .limit(9)
      .sort({ createdAt: -1 });
    const latesProducts = formateProduct(allProducyLates);
    const allProducyTop = await productModel
      .find({})
      .limit(9)
      .sort({ rating: -1 });
    const topProducts = formateProduct(allProducyTop);
    const allProducySale = await productModel
      .find({})
      .limit(9)
      .sort({ discount: -1 });
    const saleProducts = formateProduct(allProducySale);
    responseReturn(res, 200, {
      products,
      latesProducts,
      topProducts,
      saleProducts,
    });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_product = async (req, res) => {
  console.log("req: ", req.params);
  const { pid } = req.params;
  try {
    const product = await productModel.findById(pid);
    const relatedProducts = await productModel
      .find({
        $and: [
          {
            _id: {
              $ne: product.id,
            },
          },
          {
            category: {
              $eq: product.category,
            },
          },
        ],
      })
      .limit(16);
    const moreProducts = await productModel
      .find({
        $and: [
          {
            _id: {
              $ne: product.id,
            },
          },
          {
            sellerId: {
              $eq: product.sellerId,
            },
          },
        ],
      })
      .limit(3);
    responseReturn(res, 200, { product, relatedProducts, moreProducts });
  } catch (error) {
    console.log("error: ", error);
  }
};
const price_range_product = async (req, res) => {
  try {
    const priceRange = {
      low: 0,
      high: 0,
    };
    const products = await productModel
      .find({})
      .limit(9)
      .sort({ createdAt: -1 });
    const latesProducts = formateProduct(products);
    const getForPrice = await productModel.find({}).sort({ price: 1 });
    if (getForPrice.length > 0) {
      priceRange.high = getForPrice[getForPrice.length - 1].price;
      priceRange.low = getForPrice[0].price;
    }
    responseReturn(res, 200, { priceRange, latesProducts });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const query_products = async (req, res) => {
  const parPage = 12;
  req.query.parPage = parPage;
  console.log(" req.query: ", req.query);
  try {
    const products = await productModel.find({}).sort({ createdAt: -1 });
    // console.log("products: ", products);

    const totalProduct = new queryProducts(products, req.query)
      .categoryQuery()
      .searchQuery()
      .priceQuery()
      .ratingQuery()
      .sortPrice()
      .countProducts();
    // console.log("totalProduct: ", totalProduct);

    const result = new queryProducts(products, req.query)
      .categoryQuery()
      .searchQuery()
      .ratingQuery()
      .priceQuery()
      .sortPrice()
      .skip()
      .limit()
      .getProducts();

    // console.log("result: ", result);
    responseReturn(res, 200, { products: result, totalProduct, parPage });
  } catch (error) {
    console.log(error);
  }
};
const customer_review = async (req, res) => {
  console.log("req: ", req);
  const { name, review, rating, productId } = req.body;
  try {
    await reviewModel.create({
      name: name,
      review: review,
      rating: rating,
      productId: productId,
      date: moment(Date.now()).format("DD/MM/YYYY, h:mm:ss a"),
    });
    let ratings = 0;
    const reviews = await reviewModel.find({ productId });
    for (let i = 0; i < reviews.length; i++) {
      ratings = ratings + reviews[i].rating;
    }
    let productRating = 0;
    if (reviews.length !== 0) {
      productRating = (ratings / reviews.length).toFixed(1);
    }
    await productModel.findByIdAndUpdate(productId, {
      rating: productRating,
    });
    responseReturn(res, 201, { message: "Review success" });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_review = async (req, res) => {
  const { productId } = req.params;

  let { pageNo } = req.query;
  pageNo = parseInt(pageNo);
  const limit = 5;
  const skipPage = limit * (pageNo - 1);
  try {
    let getRating = await reviewModel.aggregate([
      {
        $match: {
          productId: {
            $eq: new ObjectId(productId),
          },
          rating: {
            $not: {
              $size: 0,
            },
          },
        },
      },
      {
        $unwind: "$rating",
      },
      {
        $group: {
          _id: "$rating",
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    const ratingReview = [
      {
        rating: 5,
        sum: 0,
      },
      {
        rating: 4,
        sum: 0,
      },
      {
        rating: 3,
        sum: 0,
      },
      {
        rating: 2,
        sum: 0,
      },
      {
        rating: 1,
        sum: 0,
      },
    ];
    for (let i = 0; i < ratingReview.length; i++) {
      for (let j = 0; j < getRating.length; j++) {
        if (ratingReview[i].rating === getRating[j]._id) {
          ratingReview[i].sum = getRating[j].count;
          break;
        }
      }
    }
    const getAll = await reviewModel.find({
      productId,
    });
    const reviews = await reviewModel
      .find({ productId })
      .skip(skipPage)
      .limit(limit)
      .sort({ createdAt: -1 });
    responseReturn(res, 200, {
      reviews,
      totalReview: getAll.length,
      ratingReview,
    });
  } catch (error) {
    console.log("error: ", error);
  }
};
module.exports = {
  get_categorys,
  get_products,
  get_product,
  formateProduct,
  price_range_product,
  query_products,
  customer_review,
  get_review,
};
