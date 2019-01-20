module.exports = {
    async joinChannel(db, io, socket, connectedUsers, clientLookupDictionary, channelName) {
        try {
            let response = await db.channels.getChannelIdByName(channelName);
            if (!response[0])
                return console.log('channel doesn\'t exist');
            let initialChannelResponse = {};
            const channelId = response[0].id;
            const name = response[0].channel_name
            if (socket.request.session.user) {
                const { id: myId } = socket.request.session.user;
                const time = Date.now()
                const lastViewTime = await db.channels.getUpdateLastViewTime(myId, channelId, time);
                initialChannelResponse.lastViewTime = lastViewTime[0] ? lastViewTime[0].last_view_time : Date.now();
            }
            socket.request.session.currentRoom = channelName;
            initialChannelResponse.existingMessages = await db.channels.getChannelMessages(channelId);
            initialChannelResponse.existingMessageReactions = await db.channels.getChannelMessageReactions(channelId);
            initialChannelResponse.channelId = channelId;
            initialChannelResponse.channelName = name;
            socket.join(channelName);
            let usersInChannel;
            io.in(channelName).clients(async (err, clients) => {
                // get list of online users in the channel, filter out ones who are not in clientDictionary, and therefore are guests and won't be displayed
                usersInChannel = clients.map(client => clientLookupDictionary[client])
                usersInChannel = usersInChannel.filter(user => user);
                // get user data for them, filtering out everything except username and id
                if (usersInChannel[0]) {
                    let userList = await db.users.find({ id: usersInChannel })
                    onlineUsers = userList.map(user => { return { id: user.id, username: user.username } }).sort((a, b) => a.username < b.username ? -1 : 1)
                } else {
                    onlineUsers = [];
                }
                // get user data for all channel subscribers
                let subbedUsers = await db.channels.getChannelUsers(channelId);
                // console.log(subbedUsers);
                // set subbed status to true on return object, and online status by reconciling with usersInChannel
                let users = subbedUsers.map(user => {
                    user.subbed = true;
                    user.online = usersInChannel.indexOf(user.id) === -1 ? false : true;
                    return user;
                });
                // push online users into array if they aren't there already, setting subbed status to false since they weren't in the previous block
                for (let i = 0; i < onlineUsers.length; i++) {
                    if (users.findIndex(user => user.id === onlineUsers[i].id) === -1)
                        users.push({ ...onlineUsers[i], online: true, subbed: false })
                }
                initialChannelResponse.users = users;
                socket.emit('send initial response', initialChannelResponse);
                if (socket.request.session.user) {
                    const mySubStatus = subbedUsers.findIndex(user => user.id === socket.request.session.user.id) === -1 ? false : true;
                    socket.to(channelName).emit('user joined channel', {
                        username: socket.request.session.user.username,
                        id: socket.request.session.user.id,
                        subbed: mySubStatus,
                        online: true
                    });
                }
            });

        } catch (err) {
            console.log(err);
        }
    },
    async createMessage(db, socket, io, message) {
        try {
            if (!socket.request.session.user)
                return;
            const { id: myId, username: myUsername } = socket.request.session.user;
            const { currentRoom } = socket.request.session;
            const timestamp = Date.now();
            const messageResponse = await db.channels.createMessage(message.channelId, myId, message.contentText.trim(), null, timestamp);
            let newMessage = messageResponse[0];
            delete newMessage.user_id;
            delete newMessage.channel_id;
            newMessage.username = myUsername;
            io.in(currentRoom).emit('new message', newMessage);
        } catch(err) {
            console.log(err);
        }
    },
    async leaveChannel(socket) {
        const { currentRoom } = socket.request.session;
        if (socket.request.session.user) {
            const { username } = socket.request.session.user;
            socket.to(currentRoom).emit('user left channel', username);
        }
        socket.leave(currentRoom);
        delete socket.request.session.currentRoom;
    },
    async isTyping(socket) {
        const { currentRoom } = socket.request.session;
        if (socket.request.session.user) {
            const { username } = socket.request.session.user;
            socket.to(currentRoom).emit('is typing', username);
        }
    },
    async stoppedTyping(socket) {
        const { currentRoom } = socket.request.session;
        if (socket.request.session.user) {
            const { username } = socket.request.session.user;
            // console.log(username, '- stopped typing -', currentRoom);
            socket.to(currentRoom).emit('stopped typing', username);
        }
    },
    async subscribeToChannel(db, socket, io, channelId) {
        try {
            if (!socket.request.session.user)
                return;
            const { id: myId, username: myUsername } = socket.request.session.user;
            const timeStamp = Date.now();
            const response = await db.channels.subAndGetName(channelId, myId, timeStamp);
            const roomName = response[0].channel_url;
            const user = {
                username: myUsername,
                id: myId,
                subbed: true,
                online: false
            }
            io.in(roomName).emit('user subbed to channel', user);
            socket.emit('successfully subbed to channel', response[0].id);
        } catch(err) {
            console.log(err);
        }
    },
    async unsubscribeFromChannel(db, socket, io, channelId) {
        try {
            if (!socket.request.session.user)
                return;
            const { id: myId } = socket.request.session.user;
            const response = await db.channels.unsubAndGetName(channelId, myId);
            const roomName = response[0].channel_url;
            io.in(roomName).emit('user unsubbed from channel', myId);
            socket.emit('successfully unsubbed to channel', channelId);
        } catch(err) {
            console.log(err);
        }
    },
    async createNewChannel(db, socket, io, newChannel) {
        try {
            if (!socket.request.session.user)
                return;
            const { id: creator_id } = socket.request.session.user;
            const { channel_name, channel_description } = newChannel;
            const reg = /[^a-zA-Z0-9\_\ \|]+/;
            if (reg.test(channel_name)) {
                return socket.emit('channel creation error', 'Channel name must have only alphanumeric characters and spaces');
            }
            const channel_url = channel_name.toLowerCase().replace(/ /g, '_');
            if (channel_name.length < 4 || channel_name.length > 20)
                return socket.emit('channel creation error', 'Channel names must be between 4 and 20 characters in length');
            let channelResponse = await db.channels.checkChannelNameAndUrl(channel_name, channel_url);
            if (channelResponse[0])
                return socket.emit('channel creation error', 'Channel name or channel url already in use');
            // console.log('channel passed valication checks');
            let response = await db.createChannel({ channel_name, creator_id, channel_description, channel_url })
            newChannel = response[0];
            return io.emit('new channel created', newChannel);
        } catch(err) {
            console.log(err);
        }
    },
    async reactToMessage(db, socket, io, messageId, channelId, reactionName) {
        try {
            if (!socket.request.session.user)
                return;
            const { id: myId, username: myUsername } = socket.request.session.user;
            const existingReaction = await db.channels.getExistingUserReaction(messageId, myId, reactionName);
            if (!existingReaction[0])
                db.channels.addReaction(messageId, channelId, myId, reactionName)
            else
                db.channels.removeReaction(messageId, myId, reactionName);
            io.to(socket.request.session.currentRoom).emit('message was reacted to', messageId, reactionName, myUsername);
        } catch(err) {
            console.log(err);
        }
    }
}