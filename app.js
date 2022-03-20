const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const passport = require("passport");
const path = require("path");
const cors = require("cors");
const util = require("util");
const chatrooms = require("./models/message/chatroom");
const messages = require("./models/message/message");
const users = require("./models/login/users");
const Users = require("./utils/all_users_in_socket");

const currentUsers = new Users();

const checkIfAuthenticated = require("./middleware/firebase_auth");
const admin = require("./config/firebase");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use(checkIfAuthenticated);

app.use(passport.initialize());
require("dotenv").config({
	path: path.join(__dirname, ".env"),
});

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});

// io-middleware
io.use(async (socket, next) => {
	console.log("validating token");
	// console.log(socket);
	if (
		socket.handshake.headers.authorization &&
		socket.handshake.headers.authorization.split(" ")[0] === "Bearer"
	) {
		// socket.handshake.authToken = socket.handshake.authorization.split(' ')[1];

		try {
			const authToken = socket.handshake.headers.authorization.split(" ")[1];
			console.log("found token: "); // , authToken);

			const userInfo = await admin.auth().verifyIdToken(authToken);

			// console.log(userInfo);
			// req.authId = userInfo;
			console.log("correct token, you are authorized");
			next();
		} catch (e) {
			console.log("wrong token", e);
			next(
				new Error("You are not authorized to make this request, wrong token")
			);
			// return res.status(401).send({ error: 'You are not authorized to make this request' });
		}
	} else {
		// socket.handshake.authToken = null;
		next(new Error("You are not authorized to make this request"));
	}
});

io.on("connection", (socket) => {
	console.log("New client connected");

	socket.on("join", async (payload) => {
		// where payload is logged_in_user's details.
		let roomId = payload.roomId;
		let userName = payload.userName;
		let userEmail = payload.userEmail;

		currentUsers.removeUser(userEmail);
		currentUsers.addUser(socket.id, userName, userEmail, roomId);
		console.log(
			`Okay the new currentUserList of this roomId:${roomId} is this:- ${currentUsers.getUserList(
				roomId
			)}`
		);
		io.sockets
			.in(roomId)
			.emit(
				"take_updateUserList_of_your_Room",
				currentUsers.getUserList(roomID)
			);
		socket.join(roomId);
		let chatRoom = await chatrooms.findOne({ roomId: roomId });
		if (chatRoom) {
			let oldMessages = await messages
				.find({ chatRoomId: chatRoom._id })
				.populate("postedByUser", "userName");
			let oldMessagesModified = oldMessages.map((e) => {
				return { msg: e.message, postedbyusername: e.postedByUser.userName };
			});
			socket.emit("take_old_messages", oldMessagesModified);
		}
		// now if chatroom doesn't- exits:-
		// so create new ChatRoom but before that get all users for that room.
		let all_users_of_room = [];
		currentUsers.all_users_in_socket.map(async (e) => {
			let userr = await users.findOne({ email: e.userEmail });
			if (userr) all_users_of_room.push(userr._id);
			if (e.roomId == roomId) {
				let Croom = await chatrooms.findOne({ roomId: roomId });
				if (!Croom) {
					let newCroom = new chatrooms({
						roomId: roomId,
						userIds: all_users_of_room,
					});
					await newCroom.save();
				} else {
					if (Croom.userIds.includes(userr._id)) {
					} else {
						Croom.userIds.push(userr._id);
					}
					await Croom.save();
				}
			}
		});
		socket.broadcast
			.to(roomId)
			.emit("new_user_joined", "Hey, New User Joined this chat.");

		socket.on("createNewMessage", (message) => {
			let userr = currentUsers.getUser(payload.userEmail);
			if (userr && payload.message.length > 0) {
				const croom = chatrooms.findOne({ roomId: roomId });
				const user1 = users.findOne({ email: userr.userEmail });
				const newmessage = new messages({
					message: message,
					chatRoomId: croom._id,
					postedByUser: user1._id,
				});
				await newmessage.save();
				socket.broadcast.to(roomId).emit("takeNewMessage", newmessage);
			}
		});
	});

	socket.on("error", console.error);

	socket.on("update_location", (data) => {
		console.log(JSON.stringify(data));
		socket.emit("updated", JSON.stringify(JSON.stringify(data)));
	});

	socket.on("disconnect", () => {
		console.log("Client disconnected");
		let user = currentUsers.removeUserBySocketId(socket.id);

		if (user) {
			io.to(user.roomId).emit("updateUsersList", users.getUserList(user.room));
			io.to(user.roomId).emit("newMessage", {
				name: "server",
				message: `${user.name} has left chat.`,
			});
		}
	});
});

//user routes
const userRouter = require("./routes/users");
app.use("/api", userRouter);

//admin routes
const adminRouter = require("./routes/admin");
app.use("/api", adminRouter);

// app.use('/Images', express.static('Images'));
// app.use('/3dimages',express.static('3dimages'));

server.listen(process.env.PORT, () => {
	console.log(`server is running at port ${process.env.PORT}`);
});
