const sellerModel = require("../../models/sellerModel");
const customerModel = require("../../models/customerModel");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const sellerCustomerMessageModel = require("../../models/chat/sellerCustomerMessageModel");
const adminSellerMessageModel = require("../../models/chat/adminSellerMessageModel");
const { responseReturn } = require("../../utiles/response");
const add_customer_friend = async (req, res) => {
  // console.log("req: ", req.body);
  const { sellerId, userId } = req.body;
  try {
    if (sellerId !== "") {
      const seller = await sellerModel.findById(sellerId);
      const user = await customerModel.findById(userId);
      const checkSeller = await sellerCustomerModel.findOne({
        $and: [
          {
            myId: {
              $eq: userId,
            },
          },
          {
            myFriends: {
              $elemMatch: {
                friendId: sellerId,
              },
            },
          },
        ],
      });
      // console.log("checkSeller: ", checkSeller);

      if (!checkSeller) {
        await sellerCustomerModel.updateOne(
          {
            myId: userId,
          },
          {
            $push: {
              myFriends: {
                friendId: sellerId,
                name: seller.shopInfo?.shopName,
                image: seller.image,
              },
            },
          }
        );
      }
      const checkCustomer = await sellerCustomerModel.findOne({
        $and: [
          {
            myId: {
              $eq: sellerId,
            },
          },
          {
            myFriends: {
              $elemMatch: {
                friendId: userId,
              },
            },
          },
        ],
      });
      // console.log("checkCustomer: ", checkCustomer);
      if (!checkCustomer) {
        await sellerCustomerModel.updateOne(
          {
            myId: sellerId,
          },
          {
            $push: {
              myFriends: {
                friendId: userId,
                name: user.name,
                image: " ",
              },
            },
          }
        );
      }
      const messages = await sellerCustomerMessageModel.find({
        $or: [
          {
            $and: [
              {
                receverId: { $eq: sellerId },
              },
              {
                senderId: {
                  $eq: userId,
                },
              },
            ],
          },
          {
            $and: [
              {
                receverId: { $eq: userId },
              },
              {
                senderId: {
                  $eq: sellerId,
                },
              },
            ],
          },
        ],
      });
      const MyFriends = await sellerCustomerModel.findOne({ myId: userId });
      // console.log("MyFriends: ", MyFriends);
      const currentFriend = MyFriends.myFriends.find(
        (e) => e.friendId === sellerId
      );
      responseReturn(res, 200, {
        myFriends: MyFriends.myFriends,
        currentFriend,
        messages,
      });
    } else {
      const MyFriends = await sellerCustomerModel.findOne({ myId: userId });
      responseReturn(res, 200, { myFriends: MyFriends.myFriends });
    }
  } catch (error) {
    console.log("error: ", error.messages);
  }
};
const send_message_customer = async (req, res) => {
  // console.log("req: ", req.body);
  const { userId, sellerId, text, name } = req.body;
  try {
    const message = await sellerCustomerMessageModel.create({
      senderId: userId,
      senderName: name,
      receverId: sellerId,
      message: text,
    });
    const data = await sellerCustomerModel.findOne({ myId: userId });
    console.log("data: ", data);
    let myFriends = data.myFriends;
    let index = myFriends.findIndex((e) => e.friendId === sellerId);
    while (index > 0) {
      let temp = myFriends[index];
      myFriends[index] = myFriends[index - 1];
      myFriends[index - 1] = temp;
      index--;
    }
    await sellerCustomerModel.updateOne(
      {
        myId: userId,
      },
      {
        myFriends,
      }
    );

    const dataSeller = await sellerCustomerModel.findOne({ myId: sellerId });
    console.log("dataSeller: ", dataSeller);
    let myFriendsSeller = dataSeller.myFriends;
    let indexSeller = myFriendsSeller.findIndex((e) => e.friendId === userId);
    while (indexSeller > 0) {
      let tempSeller = myFriendsSeller[indexSeller];
      myFriendsSeller[indexSeller] = myFriendsSeller[indexSeller - 1];
      myFriendsSeller[indexSeller - 1] = tempSeller;
      indexSeller--;
    }
    await sellerCustomerModel.updateOne(
      {
        myId: sellerId,
      },
      {
        myFriendsSeller,
      }
    );
    responseReturn(res, 200, { message });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_customers = async (req, res) => {
  const { sellerId } = req.params;
  // console.log("sellerId: ", sellerId);
  try {
    const data = await sellerCustomerModel.findOne({ myId: sellerId });
    // console.log("data: ", data);
    // console.log("data.myFriends: ", data.myFriends);
    responseReturn(res, 200, { customers: data.myFriends });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_customer_message = async (req, res) => {
  // console.log("req: ", req);
  const { customerId } = req.params;
  const { id } = req;
  // console.log("id: ", id);
  try {
    const messages = await sellerCustomerMessageModel.find({
      $or: [
        {
          $and: [
            {
              receverId: { $eq: customerId },
            },
            {
              senderId: {
                $eq: id,
              },
            },
          ],
        },
        {
          $and: [
            {
              receverId: { $eq: id },
            },
            {
              senderId: {
                $eq: customerId,
              },
            },
          ],
        },
      ],
    });
    const currentCustomer = await customerModel.findById(customerId);
    // console.log("message: ", messages);
    responseReturn(res, 200, { messages, currentCustomer });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const send_message_seller = async (req, res) => {
  // console.log("req: ", req.body);

  const { senderId, receverId, text, name } = req.body;
  try {
    const message = await sellerCustomerMessageModel.create({
      senderId: senderId,
      senderName: name,
      receverId: receverId,
      message: text,
    });
    const data = await sellerCustomerModel.findOne({ myId: senderId });
    console.log("data: ", data);
    let myFriends = data.myFriends;
    let index = myFriends.findIndex((e) => e.friendId === receverId);
    while (index > 0) {
      let temp = myFriends[index];
      myFriends[index] = myFriends[index - 1];
      myFriends[index - 1] = temp;
      index--;
    }
    await sellerCustomerModel.updateOne(
      {
        myId: senderId,
      },
      {
        myFriends,
      }
    );

    const dataSeller = await sellerCustomerModel.findOne({ myId: receverId });
    console.log("dataSeller: ", dataSeller);
    let myFriendsSeller = dataSeller.myFriends;
    let indexSeller = myFriendsSeller.findIndex((e) => e.friendId === senderId);
    while (indexSeller > 0) {
      let tempSeller = myFriendsSeller[indexSeller];
      myFriendsSeller[indexSeller] = myFriendsSeller[indexSeller - 1];
      myFriendsSeller[indexSeller - 1] = tempSeller;
      indexSeller--;
    }
    await sellerCustomerModel.updateOne(
      {
        myId: receverId,
      },
      {
        myFriendsSeller,
      }
    );
    responseReturn(res, 200, { message });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const get_sellers = async (req, res) => {
  try {
    const sellers = await sellerModel.find();
    responseReturn(res, 200, { sellers });
  } catch (error) {
    console.log("error: ", error.message);
  }
};
const send_message_seller_admin = async (req, res) => {
  const { senderId, receverId, message, senderName } = req.body;
  try {
    const textMessage = await adminSellerMessageModel.create({
      senderId,
      receverId,
      message,
      senderName,
    });
    responseReturn(res, 200, { textMessage });
  } catch (error) {
    console.log("error: ", error);
  }
};
const get_admin_message = async (req, res) => {
  const { receverId } = req.params;
  // console.log("req.params: ", req.params);
  const id = "";
  // if (req.role === "admin") id = "";
  // console.log("req: ", req.id);
  try {
    const message = await adminSellerMessageModel.find({
      $or: [
        {
          $and: [
            {
              receverId: { $eq: receverId },
            },
            {
              senderId: {
                $eq: id,
              },
            },
          ],
        },
        {
          $and: [
            {
              receverId: { $eq: id },
            },
            {
              senderId: {
                $eq: receverId,
              },
            },
          ],
        },
      ],
    });
    let currentSeller = {};
    if (receverId) {
      currentSeller = await sellerModel.findById(receverId);
    }
    // console.log('currentSeller: ', currentSeller);
    responseReturn(res, 200, { message, currentSeller });

    // console.log("message: ", message);
  } catch (error) {
    console.log("error: ", error);
  }
};
const get_seller_message = async (req, res) => {
  // console.log("req.params: ", req.params);
  const { id } = req;
  const receverId = "";
  // if (req.role === "admin") id = "";
  // console.log("req: ", req.id);
  try {
    const message = await adminSellerMessageModel.find({
      $or: [
        {
          $and: [
            {
              receverId: { $eq: receverId },
            },
            {
              senderId: {
                $eq: id,
              },
            },
          ],
        },
        {
          $and: [
            {
              receverId: { $eq: id },
            },
            {
              senderId: {
                $eq: receverId,
              },
            },
          ],
        },
      ],
    });

    responseReturn(res, 200, { message });

    // console.log("message: ", message);
  } catch (error) {
    console.log("error: ", error);
  }
};
module.exports = {
  add_customer_friend,
  send_message_customer,
  get_customers,
  get_customer_message,
  send_message_seller,
  get_sellers,
  send_message_seller_admin,
  get_admin_message,
  get_seller_message,
};
