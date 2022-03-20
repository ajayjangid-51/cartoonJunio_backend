const mongoose = require("mongoose");

const chatRoomSchema = mongoose.Schema(
	{
		roomId: String,
		userIds: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "users",
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("chatrooms", chatRoomSchema);
