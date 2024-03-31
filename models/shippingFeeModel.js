const { Schema, model } = require("mongoose");

const shippingFeeSchema = new Schema(
  {
    shipping_fee: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("shippingFees", shippingFeeSchema);
