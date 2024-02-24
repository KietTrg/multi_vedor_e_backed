const authorOrder = require("../../models/authOrderModel");
const customerOrderModel = require("../../models/customerOrderModel");
const sellerModel = require("../../models/sellerModel");
const sellerWallet = require("../../models/sellerWallet");
const myShopWallet = require("../../models/myShopWallet");
const sellerCustomerMessageModel = require("../../models/chat/sellerCustomerMessageModel");
const adminSellerMessageModel = require("../../models/chat/adminSellerMessageModel");
const productModel = require("../../models/productModel");
const {
  mongo: { ObjectId },
} = require("mongoose");
const { responseReturn } = require("../../utiles/response");
const moment = require("moment");
const get_seller_dashboard = async (req, res) => {
  const { id } = req;
  try {
    const totalSale = await sellerWallet.aggregate([
      {
        $match: {
          sellerId: {
            $eq: id,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalProduct = await productModel
      .find({ sellerId: new ObjectId(id) })
      .countDocuments();
    const totalOrder = await authorOrder
      .find({ sellerId: new ObjectId(id) })
      .countDocuments();
    const totalPendingOrder = await authorOrder
      .find({
        $and: [
          {
            sellerId: {
              $eq: new ObjectId(id),
            },
          },
          {
            deliveryStatus: {
              $eq: "pending",
            },
          },
        ],
      })
      .countDocuments();
    const message = await sellerCustomerMessageModel
      .find({
        $or: [
          {
            senderId: {
              $eq: id,
            },
          },
          {
            receverId: {
              $eq: id,
            },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(3);
    const recentOrders = await authorOrder
      .find({
        sellerId: new ObjectId(id),
      })
      .limit(5);
    const monthArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let result = [];
    let resultOrder = [];

    const year = new Date().getFullYear();

    for (let i = 0; i < monthArr.length; i++) {
      const amount = await sellerWallet.find({
        sellerId: id,
        month: monthArr[i],
        year,
      });
      let sum = 0;
      for (let j = 0; j < amount.length; j++) {
        sum = sum + amount[j].amount / 1000;
      }
      result.push(+sum.toFixed(2));
    }
    for (let i = 0; i < monthArr.length; i++) {
      const amount = await sellerWallet.find({
        sellerId: id,
        month: monthArr[i],
        year,
      });
      let sum = 0;
      for (let j = 0; j < amount.length; j++) {
        sum = sum + 1;
      }
      resultOrder.push(+sum);
    }
    responseReturn(res, 200, {
      totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
      totalProduct,
      totalOrder,
      totalPendingOrder,
      message,
      recentOrders,
      result,
      resultOrder,
    });
    // console.log("recentOrders: ", recentOrders);
    // console.log("message: ", message);
    // console.log("totalPendingOrder: ", totalPendingOrder);
    // console.log("totalOrder: ", totalOrder);
    // console.log("totalProduct: ", totalProduct);
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_admin_dashboard = async (req, res) => {
  const { id } = req;
  // console.log("id: ", id);
  try {
    const totalSale = await myShopWallet.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    // console.log("totalSale: ", totalSale);
    const totalProduct = await productModel.find().countDocuments();
    const totalOrder = await authorOrder.find().countDocuments();
    const totalSeller = await sellerModel.find().countDocuments();
    const message = await adminSellerMessageModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3);
    const recentOrders = await customerOrderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5);

    const monthArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let result = [];
    let resultOrder = [];
    let resultSeller = [];
    const year = new Date().getFullYear();

    for (let i = 0; i < monthArr.length; i++) {
      const amount = await myShopWallet.find({
        month: monthArr[i],
        year,
      });
      let sum = 0;
      for (let j = 0; j < amount.length; j++) {
        sum = sum + amount[j].amount / 1000;
      }
      result.push(+sum.toFixed(2));
    }
    for (let i = 0; i < monthArr.length; i++) {
      const amount = await myShopWallet.find({
        month: monthArr[i],
        year,
      });
      let sum = 0;
      for (let j = 0; j < amount.length; j++) {
        sum = sum + 1;
      }
      resultOrder.push(+sum);
    }

    const sellerArray = await sellerModel.find();
    const sellersTime = sellerArray.map((e) => ({
      month: +moment(e.createdAt).format("M"),
      year: +moment(e.createdAt).format("YYYY"),
    }));
    console.log("sellersTime: ", sellersTime);
    let resultSl = [];
    for (let i = 0; i < monthArr.length; i++) {
      resultSl = sellersTime.filter(
        ({ month, year: currentYear }) =>
          month === monthArr[i] && currentYear === year
      );
      // const amount = sellersTime.find(
      //   (el, i) => el.month === monthArr[i] && el.year === year
      // );

      let sum = 0;
      for (let j = 0; j < resultSl.length; j++) {
        sum = sum + 1;
      }
      resultSeller.push(+sum);
    }
    // console.log("resultSeller: ", resultSeller);

    responseReturn(res, 200, {
      totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
      totalProduct,
      totalOrder,
      totalSeller,
      message,
      recentOrders,
      result,
      resultOrder,
      resultSeller,
    });
    // console.log("recentOrders: ", recentOrders);
    // console.log("message: ", message);
    // console.log("totalSeller: ", totalSeller);
    // console.log("totalOrder: ", totalOrder);
    // console.log("totalProduct: ", totalProduct);
  } catch (error) {
    console.log("error: ", error.message);
  }
};

module.exports = {
  get_seller_dashboard,
  get_admin_dashboard,
};
