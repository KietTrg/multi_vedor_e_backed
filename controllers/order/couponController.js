const couponModel = require("../../models/couponModel");
const { responseReturn } = require("../../utiles/response");

const add_coupon = async (req, res) => {
  const { couponName, couponTime, couponPercent } = req.body;

  try {
    const coupon = await couponModel.create({
      name: couponName.toUpperCase().replace(/\s/g, ""),
      expire: couponTime,
      percent: couponPercent,
    });
    responseReturn(res, 200, { coupon, message: "Add coupon success" });
  } catch (error) {
    console.log("error: ", error.message);
    responseReturn(res, 500, { message: "Add coupon fail" });
  }
};
const get_coupons = async (req, res) => {
  try {
    const coupons = await couponModel.find();
    // console.log("coupons: ", coupons);
    const totalCoupon = await couponModel.find().countDocuments();
    // console.log("totalCoupon: ", totalCoupon);
    responseReturn(res, 200, { coupons, totalCoupon });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const delete_coupon = async (req, res) => {
  const { cId } = req.params;
  //   console.log("cId: ", cId);
  try {
    const deleteCoupon = await couponModel.findByIdAndDelete(cId);

    responseReturn(res, 200, {
      deleteCoupon,
      message: "Delete coupon success",
    });
  } catch (error) {
    console.log("error: ", error.message);
    responseReturn(res, 500, { message: "Delete coupon fail" });
  }
};
const apply_coupon = async (req, res) => {
  const { info } = req.body;
  try {
    const checkCoupon = await couponModel.findOne({ name: info });
    const checkExpire = new Date(checkCoupon.expire).getTime() > Date.now();
    if (checkExpire) {
      const percentCoupon = checkCoupon.percent;
      responseReturn(res, 200, {
        percentCoupon,
        message: "Apply Voucher success",
      });
    } else {
      responseReturn(res, 404, {
        message: "Voucher not found or expired",
      });
    }
  } catch (error) {
    console.log("error: ", error.message);
  }
};
module.exports = {
  add_coupon,
  get_coupons,
  delete_coupon,
  apply_coupon,
};
