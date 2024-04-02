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
      index: { expires: 0 },
    },
    status: {
      type: String,
      require: true,
      default: "active",
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
couponCustomerSchema.index({ expire: 1 }, { expireAfterSeconds: null });
module.exports = model("couponCustomers", couponCustomerSchema);
