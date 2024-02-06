const customerModel = require("../../models/customerModel");
const bcrpty = require("bcrypt");
const jwt = require("jsonwebtoken");
const { responseReturn } = require("../../utiles/response");
const { createToken } = require("../../utiles/tokenCreate");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const customer_register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("req.body: ", req.body);
  try {
    const checkCustomer = await customerModel.findOne({ email });
    if (checkCustomer) {
      responseReturn(res, 404, { error: "Email already exits" });
    } else {
      const customer = await customerModel.create({
        name: name.trim(),
        email: email.trim(),
        password: await bcrpty.hash(password, 10),
        method: "menualy",
      });
      await sellerCustomerModel.create({
        myId: customer.id,
      });
      const token = await createToken({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        method: customer.method,
      });
      res.cookie("customerToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      responseReturn(res, 201, { token, message: "register success" });
    }
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const customer_login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await customerModel.findOne({ email }).select("+password");
    if (customer) {
      const match = await bcrpty.compare(password, customer.password);
      if (match) {
        const token = await createToken({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          method: customer.method,
        });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 200, { token, message: "Login success" });
      } else {
        responseReturn(res, 404, { error: "Password wrong" });
      }
    } else {
      responseReturn(res, 404, { error: "Email not found" });
    }
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};
module.exports = {
  customer_register,
  customer_login,
};
