const stripeModel = require("../../models/stripeModel");
const sellerModel = require("../../models/sellerModel");
const { responseReturn } = require("../../utiles/response");
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
module.exports = {
  create_stripe_connect_account,
  active_stripe_connect_account,
};
