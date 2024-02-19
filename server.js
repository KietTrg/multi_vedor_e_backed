const express = require("express");
const { dbConnect } = require("./utiles/db");
const app = express();
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const socket = require("socket.io");

const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

var allCustomer = [];
var allSeller = [];

const addUser = (customerId, socketId, userInfo) => {
  const checkUser = allCustomer.some((e) => e.customerId === customerId);
  if (!checkUser) {
    allCustomer.push({
      customerId,
      socketId,
      userInfo,
    });
  }
};
const addSeller = (sellerId, socketId, userInfo) => {
  const checkSeller = allSeller.some((e) => e.sellerId === sellerId);
  if (!checkSeller) {
    allSeller.push({
      sellerId,
      socketId,
      userInfo,
    });
  }
};

const findCustomer = (customerId) => {
  return allCustomer.find((e) => e.customerId === customerId);
};
const findSeller = (sellerId) => {
  return allSeller.find((e) => e.sellerId === sellerId);
};
const remove = (socketId) => {
  allCustomer = allCustomer.filter((e) => e.socketId !== socketId);
  allSeller = allSeller.filter((e) => e.socketId !== socketId);
};

let admin = {};
const removeAdmin = (socketId) => {
  if (admin.socketId === socketId) {
    admin = {};
  }
};

io.on("connection", (s) => {
  console.log("socket server is connected...");

  s.on("add_user", (customerId, userInfo) => {
    // console.log("userInfo: ", userInfo);
    addUser(customerId, s.id, userInfo);
    io.emit("activeCustomer", allCustomer);
    io.emit("activeSeller", allSeller);

    // console.log("allCustomer: ", allCustomer);
  });
  s.on("add_seller", (sellerId, userInfo) => {
    addSeller(sellerId, s.id, userInfo);
    io.emit("activeSeller", allSeller);
    io.emit("activeCustomer", allCustomer);
    io.emit("activeAdmin", { status: true });
  });
  s.on("add_admin", (adminInfo) => {
    delete adminInfo.email;
    admin = adminInfo;
    admin.socketId = s.id;
    io.emit("activeSeller", allSeller);
    io.emit("activeAdmin", { status: true });
  });
  s.on("send_seller_message", (message) => {
    // console.log("message: ", message);
    const customer = findCustomer(message.receverId);
    console.log("customer: ", customer);
    if (customer !== undefined) {
      s.to(customer.socketId).emit("seller_message", message);
    }
  });
  s.on("send_customer_message", (message) => {
    // console.log("message: ", message);
    const seller = findSeller(message.receverId);
    // console.log("seller: ", seller);
    if (seller !== undefined) {
      s.to(seller.socketId).emit("customer_message", message);
    }
  });
  s.on("send_message_admin_to_seller", (message) => {
    const seller = findSeller(message.receverId);
    console.log("seller: ", seller);
    if (seller !== undefined) {
      s.to(seller.socketId).emit("receved_admin_message", message);
    }
  });
  s.on("send_message_seller_to_admin", (message) => {
    if (admin.socketId) {
      s.to(admin.socketId).emit("receved_seller_message", message);
    }
  });
  s.on("disconnect", () => {
    console.log("user disconnect");
    remove(s.id);
    removeAdmin(s.id);
    io.emit("activeAdmin", { status: false });
    io.emit("activeSeller", allSeller);
    io.emit("activeCustomer", allCustomer);
  });
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", require("./routes/chatRoutes"));

app.use("/api/home", require("./routes/home/homeRoutes"));
app.use("/api", require("./routes/order/orderRoutes"));
app.use("/api", require("./routes/home/cardRoutes"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/home/customerAuthRoutes"));
app.use("/api", require("./routes/dashboard/sellerRoutes"));
app.use("/api", require("./routes/dashboard/categoryRoutes"));
app.use("/api", require("./routes/dashboard/productRoutes"));
app.get("/", (req, res) => res.send("hello word"));
const port = process.env.PORT;
dbConnect();
server.listen(port, () => console.log(`Server is running on port ${port}!`));
