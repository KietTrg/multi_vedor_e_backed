const { responseReturn } = require("../../utiles/response");
const authOrderModel = require("../../models/authOrderModel");
const customerOrderModel = require("../../models/customerOrderModel");
const cardModel = require("../../models/cardModel");

const {
  mongo: { ObjectId },
} = require("mongoose");

const monent = require("moment");

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
  console.log("req: ", req.body);
  const { price, product, shipping_fee, shippingInfo, userId } = req.body;
  let authorOrderData = [];
  let cardId = [];
  const tempDate = monent(Date.now()).format("DD/MM/YYYY, h:mm:ss a");

  let customerOrderProduct = [];

  for (let i = 0; i < product.length; i++) {
    const pro = product[i].products;
    // console.log("pro: ", pro);
    for (let j = 0; j < pro.length; j++) {
      let tempCusPro = pro[j].productInfo;
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
      price: price + shipping_fee,
      deliveryStatus: "pending",
      paymentStatus: "unpaid",
      date: tempDate,
    });
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
      orders = await customerOrderModel.find({
        customerId: new ObjectId(customerId),
        deliveryStatus: status,
      });
    } else {
      orders = await customerOrderModel.find({
        customerId: new ObjectId(customerId),
      });
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
module.exports = {
  place_order,
  paymentCheck,
  get_data,
  get_orders,
  get_order,
};
