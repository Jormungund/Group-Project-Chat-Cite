const bcrypt = require('bcryptjs');

module.exports = {
    async register(req, res) {
        try {
            const { registerUsername: username, registerEmail: email, registerPassword: pw, user_image, about_text } = req.body;
            var reg = /[^a-zA-Z0-9\_\|]+/;
            if (reg.test(username)) {
                return res.status(408).send("Usernames must have only alphanumeric characters and underscores.");
            }
            if (username.length < 4 || username.length > 16) {
                return res.status(409).send("Usernames must be between 4 and 16 characters long.");
            }
            const db = req.app.get('db')
            const emailCheck = await db.user.getUserByEmail(email)
            if (emailCheck[0])
                return res.status(409).send('This email address is already registered.')
            const usernameCheck = await db.user.getUserByUsername(username)
            if (usernameCheck[0])
                return res.status(409).send('That username is taken');
            if (pw.length < 4)
                return res.status(409).send('Passwords must be at least 4 characters long');
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(pw, salt)
            let response = await db.auth.createUser({ username, email, hash, user_image, about_text })
            let newUser = response[0]
            delete newUser.pw
            req.session.user = newUser

            //SUBBED CHANNELS
            let userSubChannels = await db.getAllSubscibedChannels(newUser.id)
            //FRIENDS
            let userFriends = await db.getUserFriends(newUser.id)

            function buildJSON() {
                let obj = {}
                obj.user = newUser;
                obj.userSubChannels = userSubChannels;
                obj.userFriends = userFriends;
                res.status(200).send(obj)
            }

            buildJSON()

        } catch (err) {
            console.log('error registering account:', err)
        }
    },
    async login(req, res) {
        try {
            const db = req.app.get('db')
            const { loginEmail: email, loginPassword: pw } = req.body
            let userResponse = await db.user.getUserByEmail(email)
            let user = userResponse[0]
            if (!user) {
                return res.status(401).send('Email not found')
            }
            const isAuthenticated = bcrypt.compareSync(pw, user.pw)
            if (!isAuthenticated) {
                return res.status(403).send('Incorrect Password')
            }
            delete user.pw
            req.session.user = user

            //SUBBED CHANNELS
            let userSubChannels = await db.getAllSubscibedChannels(userResponse[0].id)
            //FRIENDS
            let userFriends = await db.getUserFriends(userResponse[0].id)

            function buildJSON(userData) {
                let obj = {}
                obj.user = userData[0];
                obj.userSubChannels = userSubChannels;
                obj.userFriends = userFriends;
                res.status(200).send(obj)
            }

            buildJSON(userResponse, userSubChannels, userFriends)

        } catch (error) {
            console.log('error logging into account:', error)
            res.status(500).send(error)
        }
    },
    async getCurrentUser(req, res) {
        try {
            if (!req.session.user)
                return;
            const db = req.app.get('db')
            //SUBBED CHANNELS
            let userSubChannels = await db.getAllSubscibedChannels(req.session.user.id)
            //FRIENDS
            let userFriends = await db.getUserFriends(req.session.user.id)

            function buildJSON(userData, userSubChannels, userFriends) {
                let obj = {}
                obj.user = userData;
                obj.userSubChannels = userSubChannels;
                obj.userFriends = userFriends;
                res.status(200).send(obj)
            }

            buildJSON(req.session.user, userSubChannels, userFriends)
        } catch (err) {
            console.log(err);
        }
    },
    logout(req, res) {
        try {
            req.session.destroy()
            res.sendStatus(200)
        } catch(err) {
            console.log(err);
        }
    },
    async update(req, res) {
        try {
            const db = req.app.get('db')
            const { id } = req.params
            const { username, email, user_image, about_text } = req.body
            let updateUser = await db.user.updateUser({ id, username, email, user_image, about_text })

            req.session.user = updateUser[0]

            //SUBBED CHANNELS
            let userSubChannels = await db.getAllSubscibedChannels(req.session.user.id)
            //FRIENDS
            let userFriends = await db.getUserFriends(req.session.user.id)

            function buildJSON(userData, userSubChannels, userFriends) {
                let obj = {}
                obj.user = userData;
                obj.userSubChannels = userSubChannels;
                obj.userFriends = userFriends;
                res.status(200).send(obj)
            }

            buildJSON(updateUser[0], userSubChannels, userFriends)

        } catch (err) {
            console.log('error updating account:', err)
        }
    },
}