const { Schema, model } = require("mongoose");

const couponSchema = new Schema(
  {
    name: {
      unique: true,
      upperCase: true,
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

module.exports = model("coupons", couponSchema);
