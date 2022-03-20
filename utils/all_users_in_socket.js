class Users {
	constructor() {
		this.all_users_in_socket = [];
	}
	addUser(socketId, userName, userEmail, roomId) {
		let user = { socketId, userName, userEmail, roomId };
		this.all_users_in_socket.push(user);
		return user;
	}
	// getting userList of any particular-room.
	getUserList(roomId) {
		let users = this.all_users_in_socket.filter(
			(user) => user.roomId === roomId
		);
		let namesArray = users.map((user) => user.userName);

		return namesArray;
	}

	getUser(email) {
		return this.all_users_in_socket.filter(
			(user) => user.userEmail === email
		)[0];
	}

	getUserBySocketId(socketid) {
		return this.all_users_in_socket.filter(
			(user) => user.socketId === socketid
		)[0];
	}
	removeUser(email) {
		let user = this.getUser(email);

		if (user) {
			this.all_users_in_socket = this.all_users_in_socket.filter(
				(user) => user.userEmail !== email
			);
		}

		return user;
	}

	removeUserBySocketId(socketid) {
		let user = this.getUserBySocketId(socketid);

		if (user) {
			this.all_users_in_socket = this.all_users_in_socket.filter(
				(user) => user.socketId !== socketid
			);
		}

		return user;
	}
}
module.exports = Users;
