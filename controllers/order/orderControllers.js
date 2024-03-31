const { responseReturn } = require("../../utiles/response");
const authOrderModel = require("../../models/authOrderModel");
const customerOrderModel = require("../../models/customerOrderModel");
const cardModel = require("../../models/cardModel");
const myShopWallet = require("../../models/myShopWallet");
const sellerWallet = require("../../models/sellerWallet");
const productModel = require("../../models/productModel");

const {
  mongo: { ObjectId },
} = require("mongoose");

const monent = require("moment");
const shippingFeeModel = require("../../models/shippingFeeModel");
const stripe = require("stripe")(
  "sk_test_51OlRpIHOujiWwT21J8lzcfW6kFa3GEei9V1TiZBvJ4Zc21AdhkIUzEIlf0Zv2x6CRmNm4YEGgkIenED4k7CrG4Nr00SDTEnGQL"
);

const create_shipping_fee = async (req, res) => {
  const { shippingFee } = req.body;
  try {
    const shipping_fee = await shippingFeeModel.create({
      shipping_fee: shippingFee,
    });
    responseReturn(res, 200, {
      shipping_fee,
      message: "Add shipping fee success",
    });
  } catch (error) {
    console.log("error: ", error.message);
    responseReturn(res, 500, { message: "Add shipping fee fail" });
  }
};

const paymentCheck = async (id) => {
  try {
    const order = await customerOrderModel.findById(id);
    if (order.paymentStatus === "unpaid") {
      await customerOrderModel.findByIdAndUpdate(id, {
        deliveryStatus: "cancelled",
      });
      await authOrderModel.updateMany(
        { orderId: id },
        {
          deliveryStatus: "cancelled",
        }
      );
    }
  } catch (error) {
    console.log("error: ", error.message);
  }
  return true;
};

const place_order = async (req, res) => {
  // console.log("req: ", req.body);
  const { price, product, shipping_fee, shippingInfo, userId } = req.body;
  let productQuantity = [];

  product.forEach((el) => {
    el.products.forEach((e) => {
      return productQuantity.push({
        quantity: e.quantity,
        productId: e.productInfo._id,
      });
    });
  });
  console.log("productQuantity: ", productQuantity);

  console.log("price: ", price);
  let authorOrderData = [];
  let cardId = [];
  const tempDate = monent(Date.now()).format("DD/MM/YYYY, h:mm:ss a");

  let customerOrderProduct = [];

  for (let i = 0; i < product.length; i++) {
    const pro = product[i].products;
    // console.log("pro: ", pro);
    for (let j = 0; j < pro.length; j++) {
      let tempCusPro = pro[j].productInfo;
      tempCusPro.quantity = pro[j].quantity;
      // console.log("tempCusPro: ", tempCusPro);
      customerOrderProduct.push(tempCusPro);
      if (pro[j]._id) {
        cardId.push(pro[j]._id);
      }
    }
  }
  // console.log("customerOrderProduct: ", customerOrderProduct);
  // console.log("cardId: ", cardId);
  try {
    const order = await customerOrderModel.create({
      customerId: userId,
      shippingInfo,
      products: customerOrderProduct,
      price: price,
      deliveryStatus: "pending",
      paymentStatus: "unpaid",
      date: tempDate,
    });
    for (let j = 0; j < productQuantity.length; j++) {
      const productCurrent = await productModel.findById(
        productQuantity[j].productId
      );
      // console.log("productCurrent: ", productCurrent);
      const updateQuantity = await productModel.findByIdAndUpdate(
        productQuantity[j].productId,
        {
          stock:
            +productQuantity[j].quantity < productCurrent.stock &&
            productCurrent.stock - +productQuantity[j].quantity,
        }
      );
      console.log("updateQuantity: ", updateQuantity);
    }
    for (let i = 0; i < product.length; i++) {
      const pro = product[i].products;
      const pri = product[i].price;
      const sellerId = product[i].sellerId;
      let storePro = [];
      for (let j = 0; j < pro.length; j++) {
        let tempPro = pro[j].productInfo;
        tempPro.quantity = pro[j].quantity;
        storePro.push(tempPro);
      }
      authorOrderData.push({
        orderId: order.id,
        sellerId,
        products: storePro,
        price: pri,
        paymentStatus: "unpaid",
        shippingInfo: "PlantGo",
        date: tempDate,
        deliveryStatus: " pending",
      });
    }
    // console.log("authorOrderData: ", authorOrderData);
    await authOrderModel.insertMany(authorOrderData);
    for (let k = 0; k < cardId.length; k++) {
      await cardModel.findByIdAndDelete(cardId[k]);
    }
    setTimeout(() => {
      paymentCheck(order.id);
    }, 15000);
    responseReturn(res, 200, {
      message: "order place success",
      orderId: order.id,
    });
  } catch (error) {
    console.log("error: ", error.message);
  }
};

const get_data = async (req, res) => {
  const { userId } = req.params;

  try {
    const recentOrder = await customerOrderModel
      .find({
        customerId: new ObjectId(userId),
      })
      .limit(5);
    const pendingOrder = await customerOrderModel
      .find({
        customerId: new ObjectId(userId),
        deliveryStatus: "pending",
      })
      .countDocuments();
    const totalOrder = await customerOrderModel
      .find({
        customerId: new ObjectId(userId),
      })
      .countDocuments();
    const cancelledOrder = await customerOrderModel
      .find({
        customerId: new ObjectId(userId),
        deliveryStatus: "cancelled",
      })
      .countDocuments();
    responseReturn(res, 200, {
      recentOrder,
      totalOrder,
      pendingOrder,
      cancelledOrder,
    });
    // console.log("pendingOrder: ", pendingOrder);
    // console.log("recentOrder: ", recentOrder);
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_orders = async (req, res) => {
  const { customerId, status } = req.params;
  try {
    let orders = [];
    if (status !== "all") {
      orders = await customerOrderModel
        .find({
          customerId: new ObjectId(customerId),
          deliveryStatus: status,
        })
        .sort({ createdAt: -1 });
    } else {
      orders = await customerOrderModel
        .find({
          customerId: new ObjectId(customerId),
        })
        .sort({ createdAt: -1 });
    }
    responseReturn(res, 200, { orders });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_order = async (req, res) => {
  console.log("req: ", req.params);
  const { orderId } = req.params;
  try {
    const order = await customerOrderModel.findById(orderId);
    responseReturn(res, 200, { order });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_admin_orders = async (req, res) => {
  let { page, parPage, searchValue } = req.query;

  page = parseInt(page);
  console.log("page: ", page);
  parPage = parseInt(parPage);
  console.log("parPage: ", parPage);
  const skipPage = parPage * (page - 1);
  console.log("skipPage: ", skipPage);
  try {
    if (searchValue) {
    } else {
      const fee = await shippingFeeModel.findOne({}).sort({ createdAt: -1 });
      const orders = await customerOrderModel
        .aggregate([
          {
            $lookup: {
              from: "authororders",
              localField: "_id",
              foreignField: "orderId",
              as: "subOrder",
            },
          },
        ])
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });
      const totalOrders = await customerOrderModel.aggregate([
        {
          $lookup: {
            from: "authororders",
            localField: "_id",
            foreignField: "orderId",
            as: "subOrder",
          },
        },
      ]);

      console.log("totalOrders: ", totalOrders.length);

      responseReturn(res, 200, {
        fee: fee.shipping_fee,
        orders,
        totalOrders: totalOrders.length,
      });
    }
  } catch (error) {
    console.log("error: ", error);
  }
};
const get_admin_order = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await customerOrderModel.aggregate([
      {
        $match: {
          _id: new ObjectId(orderId),
        },
      },
      {
        $lookup: {
          from: "authororders",
          localField: "_id",
          foreignField: "orderId",
          as: "subOrder",
        },
      },
    ]);
    responseReturn(res, 200, { order: order[0] });
  } catch (error) {
    console.log("error: ", error);
  }
};
const admin_order_update_status = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    await customerOrderModel.findByIdAndUpdate(orderId, {
      deliveryStatus: status,
    });
    responseReturn(res, 200, { message: "update status success" });
  } catch (error) {
    console.log("error: ", error.message);
    responseReturn(res, 500, { message: "interval server error" });
  }
};

const get_seller_orders = async (req, res) => {
  let { page, parPage, searchValue } = req.query;
  let { sellerId } = req.params;
  // console.log("sellerId: ", sellerId);

  page = parseInt(page);
  // console.log("page: ", page);
  parPage = parseInt(parPage);
  // searchValue = parseInt(searchValue);
  console.log("searchValue: ", searchValue);

  // console.log("parPage: ", parPage);
  const skipPage = parPage * (page - 1);
  // console.log("skipPage: ", skipPage);
  try {
    if (searchValue) {
      const orders = await authOrderModel
        .find({
          price: searchValue,
          sellerId,
        })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });
      // console.log("orders: ", orders);
      console.log("orders: ", orders);
      const totalOrders = orders.length;
      // console.log("totalOrders: ", totalOrders);
      responseReturn(res, 200, { orders, totalOrders });
    } else {
      const orders = await authOrderModel
        .find({ sellerId })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });
      // console.log("orders: ", orders);

      const totalOrders = orders.length;

      // console.log("totalOrders: ", totalOrders);

      responseReturn(res, 200, { orders, totalOrders });
    }
  } catch (error) {
    console.log("error: ", error);
  }
};
const get_seller_order = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await authOrderModel.findById(orderId);
    // console.log("order: ", order);
    responseReturn(res, 200, { order });
  } catch (error) {
    console.log("error: ", error);
  }
};
const seller_order_update_status = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    await authOrderModel.findByIdAndUpdate(orderId, {
      deliveryStatus: status,
    });
    responseReturn(res, 200, { message: "update status success" });
  } catch (error) {
    console.log("error: ", error.message);
    responseReturn(res, 500, { message: "interval server error" });
  }
};
const create_payment = async (req, res) => {
  const { price } = req.body;
  console.log("price: ", price);
  try {
    const payment = await stripe.paymentIntents.create({
      amount: Math.round(price / 23000) * 100,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    responseReturn(res, 200, { clientSecret: payment.client_secret });
  } catch (error) {
    console.log("error: ", error);
  }
};
const order_confirm = async (req, res) => {
  const { orderId } = req.params;
  try {
    await customerOrderModel.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      deliveryStatus: "pending",
    });
    await authOrderModel.updateMany(
      {
        orderId: new ObjectId(orderId),
      },
      {
        paymentStatus: "paid",
        deliveryStatus: "pending",
      }
    );
    const customerOrder = await customerOrderModel.findById(orderId);
    const authOrder = await authOrderModel.find({
      orderId: new ObjectId(orderId),
    });
    const time = monent(Date.now()).format("DD/MM/YYYY");

    // console.log("time: ", time);

    const splitTime = time.split("/");

    // console.log("splitTime: ", splitTime);
    // console.log("splitTime: ", splitTime[1]);
    await myShopWallet.create({
      amount: customerOrder.price,
      month: splitTime[1],

      year: splitTime[2],
    });
    for (let i = 0; i < authOrder.length; i++) {
      await sellerWallet.create({
        sellerId: authOrder[i].sellerId.toString(),
        amount: authOrder[i].price,
        month: splitTime[1],
        year: splitTime[2],
      });
    }
    responseReturn(res, 200, { message: "success" });
  } catch (error) {
    console.log("error: ", error);
  }
};
module.exports = {
  place_order,
  paymentCheck,
  get_data,
  get_orders,
  get_order,
  get_admin_orders,
  get_admin_order,
  admin_order_update_status,
  get_seller_orders,
  get_seller_order,
  seller_order_update_status,
  create_payment,
  order_confirm,
  create_shipping_fee,
};
