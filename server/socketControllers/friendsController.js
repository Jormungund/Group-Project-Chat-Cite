module.exports = {
    async getMyFriends(db, socket, connectedUsers) {
        try {
            const friends = await db.friends.getMyFriends(socket.request.session.user.id);
            if (friends[0]) {
                friends.forEach(friend => {
                    if (connectedUsers[friend.id])
                        friend.online = true;
                    else
                        friend.online = false;
                });
                socket.emit('send your friends', friends);
            } else {
                socket.emit('send your friends', []);
            }
        } catch (err) {
            console.log(err);
        }
    },
    async goingOffline(db, io, connectedUsers, id) {
        try {
            const friends = await db.friends.getMyFriends(id);
            if (friends[0]) {
                const onlineFriends = friends.filter(friend => connectedUsers[friend.id]);
                onlineFriends.forEach(friend => {
                    io.to(connectedUsers[friend.id]).emit('friend went offline', id);
                });
            }
        } catch (err) {
            console.log(err);
        }
    },
    async comingOnline(db, io, connectedUsers, id) {
        try {
            let friends = await db.friends.getMyFriends(id);
            if (friends[0]) {
                const onlineFriends = friends.filter(friend => connectedUsers[friend.id]);
                onlineFriends.forEach(friend => {
                    io.to(connectedUsers[friend.id]).emit('friend came online', id);
                });
            }
        } catch (err) {
            console.log(err);
        }
    },
    async requestFriend(db, io, socket, connectedUsers, username) {
        try {
            const { id: myId, username: myUsername } = socket.request.session.user;
            const response = await db.user.getUserByUsername(username);
            const requestee = response[0];
            if (!requestee)
                return socket.emit('confirm friend request', 'User not found.');
            if (requestee.id === myId)
                return socket.emit('confirm friend request', 'You can\'t be friends with yourself.');
            const existingFriendRelationship = await db.friends.getFriendRelationship([myId, requestee.id]);
            if (existingFriendRelationship[0])
                return socket.emit('confirm friend request', username + ' is already your friend.');
            const existingRequest = await db.friends.getFriendRequestById([myId, requestee.id]);
            if (existingRequest[0])
                return socket.emit('confirm friend request', 'You\'ve already sent a friend request to ' + username + '.');
            await db.friends.createFriendRequest([myId, requestee.id]);
            if (connectedUsers[requestee.id])
                io.to(connectedUsers[requestee.id]).emit('new friend request', {username: myUsername, id: myId});
            return socket.emit('confirm friend request', 'Friend request submitted.');
        } catch (err) {
            console.log(err);
        }
    },
    async getPendingFriendRequests(db, socket) {
        try {
            const { id: myId, username: myUsername } = socket.request.session.user;
            const pendingRequests = await db.friends.getPendingFriendRequests(myId);
            if (!pendingRequests[0])
                return socket.emit('send pending requests', 'no requests pending');
            else {
                return socket.emit('send pending requests', pendingRequests);
            }
        } catch(err) {
            console.log(err);
        }
    },
    async acceptFriend(db, io, socket, connectedUsers, requester) {
        try {
            const { id: requesteeId } = socket.request.session.user;
            await db.friends.acceptFriend(requester.id, requesteeId);
            io.to(connectedUsers[requesteeId]).emit('friend update complete');
            if (connectedUsers[requester.id])
                io.to(connectedUsers[requester.id]).emit('friend update complete');
        } catch(err) {
            console.log(err);
        }
    },
    async rejectFriend(db, io, socket, connectedUsers, requester) {
        try {
            const { id: requesteeId } = socket.request.session.user;
            await db.friends.rejectFriend(requester.id, requesteeId);
            io.to(connectedUsers[requesteeId]).emit('friend update complete');
        } catch(err) {
            console.log(err);
        }
},
    async deleteFriend(db, io, socket, connectedUsers, friend) {
        try {
            const { id: myId } = socket.request.session.user;
            await db.friends.deleteFriend(myId, friend.id);
            io.to(connectedUsers[myId]).emit('friend update complete');
            if (connectedUsers[friend.id])
                io.to(connectedUsers[friend.id]).emit('friend update complete');
        } catch(err) {
            console.log(err);
        }
    }
}