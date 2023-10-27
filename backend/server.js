import express from "express";
import dotenv from "dotenv";
dotenv.config();
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import messageRoutes from "./routes/messageRoute.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import Chat from "./model/chatSchema.js";
import connectDB from "./config/db.js";
import { Server as SocketServer } from "socket.io";
import http from "http";
import bodyParser from "body-parser";
const PORT = process.env.PORT || 5000;

// Connecting to MongoDB
connectDB();

const app = express();
console.log(process.env.CLIENT_URL);
const server = http.createServer(app); // Create an HTTP server
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
}); // Initialize Socket.IO on the server

const allowedOrigins = [process.env.CLIENT_URL];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
// Adjusting the request size limit
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.json("server is running");
});

app.use(notFound);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`server is started @${PORT}`);
});

// Socket.IO
io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} connected`);

  socket.on("sendMessage", async (message) => {
    try {
      console.log(message, socket.id);
      const responseMessage = Chat({
        user: message.userId,
        message: message.message,
      });
      await responseMessage.save();

      io.emit("message", message);
    } catch (error) {
      console.log(error.message);
    }
  });
});
