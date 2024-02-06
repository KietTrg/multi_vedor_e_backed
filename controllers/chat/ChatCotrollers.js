const sellerModel = require("../../models/sellerModel");
const customerModel = require("../../models/customerModel");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const sellerCustomerMessageModel = require("../../models/chat/sellerCustomerMessageModel");
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
module.exports = {
  add_customer_friend,
};
