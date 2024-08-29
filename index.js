const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Help } = require("./models/Help");
const { User } = require("./models/User");
const userRouter = require("./routes/user");
const helpRouter = require("./routes/help");

const app = express();
dotenv.config();

const connect = async () => {
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB database");
    } catch (err) {
        throw err;
    }
};

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*" }));

app.use("/api/user", userRouter);
app.use("/api/help", helpRouter);

app.use((err, req, res, next) => {
    const errStatus = err.status || 500;
    const errMessage = err.message || "something went worng!";
    return res.status(errStatus).json({
        sucess: false,
        status: errStatus,
        message: errMessage,
        stack: err.stack,
    });
});

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    connect();
    console.log(`server running on port : ${port}`);
});

//socket logics

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});

let user_locations = {};
const socket_id_to_mongo_id = {};

io.on("connection", (socket) => {
    console.log(`connect: ${socket.id}`);

    socket.on("send_message", (message) => {
        io.broadcast.emit("recieved_message", {
            chatID: message.chatID,
            senderID: message.senderID,
            text: message.text,
            createdAt: message.createdAt,
        });
    });

    socket.on("disconnect", () => {
        delete user_locations[socket.id];
        delete socket_id_to_mongo_id[socket.id];
        console.log(`disconnect: ${socket.id}`);
    });

    socket.on("force_disconnect", (socketID) => {
        delete user_locations[socket.id];
        delete socket_id_to_mongo_id[socket.id];
        socket.disconnect();
    });

    socket.on("register", (mongo_id) => {
        socket_id_to_mongo_id[socket.id] = mongo_id;
    });

    socket.on("update_location", (location_info) => {
        user_locations[socket.id] = location_info;
        console.log(user_locations);
    });

    socket.on("request_nearby_users", async (help_info) => {
        const users = [];
        Object.keys(user_locations).forEach((user_id) => {
            let dist = 0;
            if (user_locations[user_id].latitude * help_info.latitude > 0) {
                dist += Math.pow(
                    Math.abs(
                        user_locations[user_id].latitude - help_info.latitude
                    ),
                    2
                );
            } else {
                dist +=
                    Math.pow(user_locations[user_id].latitude, 2) +
                    Math.pow(help_info.latitude, 2);
            }

            if (user_locations[user_id].longitude * help_info.longitude > 0) {
                dist += Math.pow(
                    Math.abs(
                        user_locations[user_id].longitude - help_info.longitude
                    ),
                    2
                );
            } else {
                dist +=
                    Math.pow(user_locations[user_id].longitude, 2) +
                    Math.pow(help_info.longitude, 2);
            }

            users.push({ user_id, dist });
        });

        users.sort((a, b) => {
            if (a.dist == b.dist) {
                return 0;
            }

            if (a.dist < b.dist) {
                return 1;
            }

            return -1;
        });

        console.log(users.length);
        const candidates_users = [];

        if (users.length === 1) {
            io.to(socket.id).emit("request_response", "no users nearby");
        } else {
            let help = await Help.save({
                user: socket_id_to_mongo_id[socket.id],
                ...help_info,
            });

            for (let i = 0; i < Math.min(6, users.length); i++) {
                io.to(users[i].user_id).emit("requesting_help", {
                    help: help,
                    dist: users[i].dist,
                    sender: socket.id,
                });

                candidates_users.push(users[i].user_id);
            }

            help.candidates = candidates_users;
            await help.save();

            io.to(socket.id).emit(
                "request_response",
                "request sent to nearby users"
            );
        }
    });

    socket.on("help_accepted", async (help_info) => {
        const help = await Help.findById(help_info.help._id).populate("user");

        if (help.helper) {
            socket
                .to(socket.id)
                .emit(
                    "help_accepted_failed",
                    "the user has already been assgined a helper"
                );

            return;
        }

        const helper = await User.findById(socket_id_to_mongo_id(socket.id));

        socket.to(help_info.sender).emit("help_accepted", {
            helper: helper,
            latitude: user_locations[socket.id].latitude,
            longitude: user_locations[socket.id].longitude,
        });

        socket.to(socket.id).emit("help_accepted_succesfully", {
            help: help,
        });

        help.helper = socket_id_to_mongo_id(socket.id);
        await help.save();
    });
});
