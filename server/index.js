const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const massive = require('massive');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


require('dotenv').config();
const { CONNECTION_STRING, SERVER_PORT, SECRET} = process.env


//Controllers 

const Auth = require('./controllers/Auth')
const Channel = require('./controllers/Channels')
const Friend = require('./controllers/Friends')
const Private = require('./controllers/PrivateMessages')
const Profile = require('./controllers/Profile')
const Search = require('./controllers/Search')

massive(CONNECTION_STRING).then(db => {
    app.set('db', db)
    console.log('db connected!')
}) 

app.use(bodyParser.json());

const sessionMiddleware = session({
    secret: SECRET,
    resave: true,
    saveUninitialized: false
});

// io.use(sharedSession(sessionMiddleware), {autoSave: true})

app.use(sessionMiddleware);


io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
})


//Auth
    app.post('/auth/register', Auth.register)
    // Login to account
    app.post('/auth/login', Auth.login)
    // // Logout of account
    app.get('/auth/logout', Auth.logout)
    // // Get account information
    app.get('/auth/currentUser', Auth.getCurrentUser)
    // // Update account information
    app.put('/auth/update/:id', Auth.update)

//Friend Management
    // Send Friend Request
    app.post('/api/friend/request', Friend.requestFriend)
    // Get Friend Requests for user
    app.get('/api/friend/getRequests', Friend.getRequests)
    // Accept Friend Request
    app.post('/api/friend/acceptRequest', Friend.acceptRequest)
    // Get Friends for user
    // app.get('/api/friend/getUserFriends', Friend.getUserFriends)
    // Delete Friend (deactivate)

//Channel Actions
    // Get all Channels
    app.get('/api/channel/all', Channel.getAllChannels)
    // Get all subscribed channels for user
    app.get('/api/channel/all/subscribed', Channel.getAllSubscribedChannels)
    // Get all subscribed channels for user  and unseen message count
    app.get('/api/channel/all/subscribed/message/count', Channel.getAllSubscribedChannelMessageCount)
    // Create Channel
    app.post('/api/channel/new', Channel.createChannel)
    // Get Channel
    app.get('/api/channel', Channel.getChannel)
    // Get Channel and Messages
    app.get('/api/channel/messages', Channel.getChannelWithMessages)
    // Add Channel Message
    app.post('/api/channel/message/new', Channel.createMessage)
    // Follow Channel
    app.post('/api/channel/follow', Channel.followChannel)
    // Unfollow Channel
    app.delete('/api/channel/unfollow', Channel.unfollowChannel)
    // Edit Channel Message
    // Delete Channel Message
    // React to Channel Message

//Private Message Actions
    // Create Private Message
    // Get Private Messages (between users)
    // Get all Private Messages (for current user)

//Search

//Profile
    // Get profile
    app.get('/api/profile/:id', Profile.getUserProfile)
//Analytics


//Sockets

const sfc = require('./socket_controllers/friendsController');
const scc = require('./socket_controllers/channelController')

let connectedUsers = {};

io.on('connection', socket => {
    console.log('client connected');
    const db = app.get('db');
    if (socket.request.session.user) {
        connectedUsers[socket.request.session.user.id] = socket.id;
        sfc.comingOnline(db, io, connectedUsers, socket.request.session.user.id)
    }

    // friends listeners
    socket.on('get my friends', () => sfc.getMyFriends(db, socket, connectedUsers));
    socket.on('request friend', username => sfc.requestFriend(db, io, socket, connectedUsers, username));
    socket.on('get pending friend requests', () => sfc.getPendingFriendRequests(db, socket));
    socket.on('accept friend', requester => sfc.acceptFriend(db, io, socket, connectedUsers, requester));
    socket.on('reject friend', requester => sfc.rejectFriend(db, io, socket, connectedUsers, requester));
    socket.on('delete friend', friend => sfc.deleteFriend(db, io, socket, connectedUsers, friend));

    // channel listeners
    socket.on('join channel', channelName => scc.joinChannel(db, socket, connectedUsers, channelName));
    // socket.on('get channel users', )
    // socket.on('get channel messages', channel => scc.getChannel())
    socket.on('create message', message => scc.createMessage());
    socket.on('like message', message => scc.likeMessage());
    socket.on('unlike message', message => scc.likeMessage());

    // update last view time when channel component unmounts


    socket.on('disconnect', () => {
        if (socket.request.session.user) {
            sfc.goingOffline(db, io, connectedUsers, socket.request.session.user.id);
            // if user in channel updated last view time
            delete connectedUsers[socket.request.session.user.id];
        }
    })
});

http.listen(SERVER_PORT, () => {
    console.log(`listening on port: ${SERVER_PORT}`)
});
