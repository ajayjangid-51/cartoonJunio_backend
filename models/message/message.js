const mongoose = require("mongoose");
// using camelCase_naming_convention
const messageSchema = mongoose.Schema(
	{
		message: {
			type: String,
		},
		chatRoomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "chatrooms",
		},
		postedByUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("messages", messageSchema);
