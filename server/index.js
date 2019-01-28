const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const massive = require('massive');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { pingTimeout: 15000, rejectUnauthorized: false });
require('dotenv').config();

const { CONNECTION_STRING, SERVER_PORT, SECRET } = process.env

const ac = require('./controllers/authController')
const cc = require('./controllers/channelController')
const dmc = require('./controllers/dmController')
const pc = require('./controllers/profileController')

massive(CONNECTION_STRING).then(db => {
    app.set('db', db)
    console.log('db connected')
})

app.use(express.static(`${__dirname}/../build`));

app.use(bodyParser.json());

const sessionMiddleware = session({
    secret: SECRET,
    resave: true,
    saveUninitialized: false
});

app.use(sessionMiddleware);


io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
})

//Auth

app.post('/auth/register', ac.register)
app.post('/auth/login', ac.login)
app.get('/auth/logout', ac.logout)
app.get('/auth/currentUser', ac.getCurrentUser)
app.put('/auth/update/:id', ac.update)


//Channel Actions

app.get('/api/channel/getChannels', cc.getChannels);

//Private Message Actions

app.get('/api/dm/getActiveDms', dmc.getActiveDms)
app.delete('/api/dm/hideDm/:dmPartnerId', dmc.hideDm);

app.get('/api/profile/:id', pc.getUserProfile)

//Sockets

const sfc = require('./socketControllers/friendsController');
const scc = require('./socketControllers/channelController');
const sdmc = require('./socketControllers/directMessageController');

let connectedUsers = {};
let clientLookupDictionary = {};

io.on('connection', socket => {

    const db = app.get('db');
    if (socket.request.session.user) {
        connectedUsers[socket.request.session.user.id] = socket.id;
        clientLookupDictionary[socket.id] = socket.request.session.user.id
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
    socket.on('join channel', channelName => scc.joinChannel(db, io, socket, clientLookupDictionary, channelName));
    socket.on('leave channel', () => scc.leaveChannel(socket));
    socket.on('create message', message => scc.createMessage(db, socket, io, connectedUsers, message));
    socket.on('subscribe to channel', channelId => scc.subscribeToChannel(db, socket, io, channelId));
    socket.on('unsubscribe from channel', channelId => scc.unsubscribeFromChannel(db, socket, io, channelId));
    socket.on('create new channel', newChannel => scc.createNewChannel(db, socket, io, newChannel));
    socket.on('react to message', (messageId, channelId, reactionName) => scc.reactToMessage(db, socket, io, messageId, channelId, reactionName));

    //typing listeners
    socket.on('is typing', () => scc.isTyping(socket));
    socket.on('stopped typing', () => scc.stoppedTyping(socket));

    // private message listeners
    socket.on('join direct message', username => sdmc.joinDm(db, io, socket, connectedUsers, username));
    socket.on('send direct message', (message, receiverId) => sdmc.sendDm(db, io, socket, message, receiverId, connectedUsers));

    // update last view time when channel component unmounts


    socket.on('disconnect', () => {
        if (socket.request.session.user) {
            sfc.goingOffline(db, io, connectedUsers, socket.request.session.user.id);
            if (socket.request.session.currentRoom) {
                socket.to(socket.request.session.currentRoom).emit('user left channel', socket.request.session.user.username);
                socket.leave(socket.request.session.currentRoom);
            }
            delete connectedUsers[socket.request.session.user.id];
            delete clientLookupDictionary[socket.id];
        }
    })
});

http.listen(SERVER_PORT, () => {
    console.log(`listening on port: ${SERVER_PORT}`)
});
