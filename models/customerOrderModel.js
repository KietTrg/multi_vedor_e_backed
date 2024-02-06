const { Schema, model } = require("mongoose");

const customerOrderSchema = new Schema(
  {
    customerId: {
      type: Schema.ObjectId,
      required: true,
    },
    products: {
      type: Array,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    shippingInfo: {
      type: Object,
      required: true,
    },
    deliveryStatus: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = model("customerOrders", customerOrderSchema);
