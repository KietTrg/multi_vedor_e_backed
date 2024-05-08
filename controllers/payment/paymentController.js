const stripeModel = require("../../models/stripeModel");
const sellerModel = require("../../models/sellerModel");
const sellerWallet = require("../../models/sellerWallet");
const withdrawalRequest = require("../../models/withdrawalRequest");
const { responseReturn } = require("../../utiles/response");
const {
  mongo: { ObjectId },
} = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(
  "sk_test_51OlRpIHOujiWwT21J8lzcfW6kFa3GEei9V1TiZBvJ4Zc21AdhkIUzEIlf0Zv2x6CRmNm4YEGgkIenED4k7CrG4Nr00SDTEnGQL"
);
const create_stripe_connect_account = async (req, res) => {
  const { id } = req;
  const uid = uuidv4();

  try {
    const stripInfo = await stripeModel.findOne({
      sellerId: id,
    });
    if (stripInfo) {
      await stripeModel.deleteOne({ sellerId: id });
      const account = await stripe.account.create({ type: "express" });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: "http://localhost:3000/refresh",
        return_url: `http://localhost:3000/success?activeCode=${uid}`,
        type: "account_onboarding",
      });
      await stripeModel.create({
        sellerId: id,
        stripeId: account.id,
        code: uid,
      });
      responseReturn(res, 200, { url: accountLink.url });
    } else {
      const account = await stripe.account.create({ type: "express" });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: "http://localhost:3000/refresh",
        return_url: `http://localhost:3000/success?activeCode=${uid}`,
        type: "account_onboarding",
      });
      await stripeModel.create({
        sellerId: id,
        stripeId: account.id,
        code: uid,
      });
      responseReturn(res, 200, { url: accountLink.url });
    }
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const active_stripe_connect_account = async (req, res) => {
  const { activeCode } = req.params;
  const { id } = req;
  try {
    const userStripeInfo = await stripeModel.findOne({ code: activeCode });
    if (userStripeInfo) {
      await sellerModel.findByIdAndUpdate(id, {
        payment: "active",
      });
      responseReturn(res, 200, { message: "Payment active success" });
    } else {
      responseReturn(res, 404, { message: "Payment active fail" });
    }
  } catch (error) {
    responseReturn(res, 500, { message: "Interval server error" });
  }
};
const sumAmount = (data) => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = sum + data[i].amount;
  }
  return sum;
};
const get_seller_payment_details = async (req, res) => {
  const { sellerId } = req.params;
  try {
    const payments = await sellerWallet.find({ sellerId });
    const pending_withdrawals = await withdrawalRequest.find({
      $and: [
        {
          sellerId: {
            $eq: sellerId,
          },
        },
        {
          status: {
            $eq: "pending",
          },
        },
      ],
    });
    console.log("pending_withdrawals: ", pending_withdrawals);

    const success_withdrawals = await withdrawalRequest.find({
      $and: [
        {
          sellerId: {
            $eq: sellerId,
          },
        },
        {
          status: {
            $eq: "success",
          },
        },
      ],
    });
    const pending_amount = sumAmount(pending_withdrawals);
    const withdrawal_amount = sumAmount(success_withdrawals);
    const total_sale = sumAmount(payments);
    // console.log("total_sale: ", total_sale);
    let available_amount = 0;
    if (total_sale > 0) {
      available_amount = total_sale - (pending_amount + withdrawal_amount);
    }
    console.log("available_amount: ", available_amount);
    // console.log("amount: ", amount);
    responseReturn(res, 200, {
      total_sale,
      pending_amount,
      withdrawal_amount,
      available_amount,
      success_withdrawals,
      pending_withdrawals,
    });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const send_withdrawal_request = async (req, res) => {
  const { sellerId, amount } = req.body;
  try {
    const withdrawal = await withdrawalRequest.create({
      sellerId,
      amount: parseInt(amount),
    });
    responseReturn(res, 200, { withdrawal, message: "request success" });
  } catch (error) {
    console.log("error: ", error.message);
    responseReturn(res, 500, { message: "Interval server error" });
  }
};
const get_payment_request = async (req, res) => {
  try {
    const request = await withdrawalRequest.find({
      status: "pending",
    });
    // console.log("request: ", request);
    responseReturn(res, 200, { request });
  } catch (error) {
    console.log("error: ", error.message);
    responseReturn(res, 500, { message: "Interval server error" });
  }
};
const confirm_payment_request = async (req, res) => {
  const { id } = req.body;
  try {
    const payment = await withdrawalRequest.findById(id);
    const { stripeId } = await stripeModel.findOne({
      sellerId: new ObjectId(payment.sellerId),
    });
    // const test = Math.round(payment.amount / 23000) * 100;
    // console.log("test: ", test);

    await stripe.transfers.create({
      amount: Math.round(payment.amount / 23000) * 100,
      currency: "usd",
      destination: stripeId,
    });
    await withdrawalRequest.findByIdAndUpdate(id, { status: "success" });
    responseReturn(res, 200, { payment, message: "Confirm success" });
  } catch (error) {
    console.log("error: ", error.message);
    responseReturn(res, 500, { message: "Interval server error" });
  }
};
module.exports = {
  create_stripe_connect_account,
  active_stripe_connect_account,
  get_seller_payment_details,
  sumAmount,
  send_withdrawal_request,
  get_payment_request,
  confirm_payment_request,
};
