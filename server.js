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

io.on("connection", (s) => {
  console.log("socket server is connected...");

  s.on("add_user", (customerId, userInfo) => {
    addUser(customerId, s.id, userInfo);
    // console.log("allCustomer: ", allCustomer);
  });
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api", require("./routes/chatRoutes"));

app.use("/api/home", require("./routes/home/homeRoutes"));
app.use("/api/home", require("./routes/order/orderRoutes"));
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
