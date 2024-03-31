const { Schema, model } = require("mongoose");

const couponCustomerSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    couponId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    expire: {
      type: Date,
      required: true,
    },
    percent: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("couponCustomers", couponCustomerSchema);
