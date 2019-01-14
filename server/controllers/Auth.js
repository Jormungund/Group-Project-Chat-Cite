const bcrypt = require('bcryptjs');

module.exports = {
    register: async (req,res) => {
        try {
        const db = req.app.get('db')
        // console.log('registering user')
        //get info from req body
        const {registerUsername: username, registerEmail: email, registerPassword: pw, user_image, about_text} =req.body
        // see if email is already in use
        let userResponse = await db.getUserByEmail(email)
        //if anything is returned email is already in use
        if (userResponse[0]) {
            return res.status(409).send('this email is already registered')
        }
        let userName = await db.getUserByUsername(username)
        //if anything is returned username is already in use
        if (userName[0]) {
            return res.status(409).send('this username is already registered')
            console.log('attemping to register with existing username')
        }
        // generate salt and apply to password then hash
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(pw, salt)
        // console.log(hash)
        //send user info and new hash to the database
        let response = await db.createUser( {username, email, hash, user_image, about_text} )
        // database will return the newly created user
        let newUser = response[0]
        // remove users hash before saving to session
        delete newUser.hash
        // add user info to the session rather than making them log in after registration
        req.session.user = newUser
        //send user info back to client
        res.status(200).send(newUser)

        } catch (error) {
            console.log('error registering account:', error)
            res.status(500).send(error)
        }
    },
    login: async (req,res) =>{
        try {
            // console.log('attempting to login in user')
        const db = req.app.get('db')
        // get info from req body
        const {loginEmail: email,loginPassword: pw} = req.body
        // make sure email exists on database
        let userResponse = await db.getUserByEmail(email)
        // console.log("userResponse",userResponse)
        //if email exists user object should be returned
        let user = userResponse[0]
        //if not send an error
        if (!user) {
            return res.status(401).send('Email not found')
        }
        //compare the password entered hashed to the stored hash
        const isAuthenticated = bcrypt.compareSync(pw,user.pw)
        // console.log("found user", userResponse)
        //if hashes don't match send error
        if(!isAuthenticated) {
            return res.status(403).send('Password does not match')
        }
        // remove user hash before storing to session
        delete user.pw
        // console.log(user.pw)
        req.session.user = user

        //SUBBED CHANNELS
        let userSubChannels = await db.getAllSubscibedChannels(userResponse[0].id)
        //FRIENDS
        let userFriends = await db.getUserFriends(userResponse[0].id)

        function buildJSON(userData){
            let obj = {}
            obj.user = userData[0];
            obj.userSubChannels = userSubChannels;
            obj.userFriends = userFriends;
            res.status(200).send(obj)
        }

        buildJSON(userResponse,userSubChannels,userFriends)

        } catch (error) {
            console.log('error logging into account:', error)
            res.status(500).send(error)
        }
    },
    getCurrentUser: async (req,res) => {
        try {
            const db = req.app.get('db')
            //SUBBED CHANNELS
            let userSubChannels = await db.getAllSubscibedChannels(req.session.user.id)
            //FRIENDS
            let userFriends = await db.getUserFriends(req.session.user.id)
    
            function buildJSON(userData,userSubChannels,userFriends){
                let obj = {}
                obj.user =userData;
                obj.userSubChannels = userSubChannels;
                obj.userFriends = userFriends;
                res.status(200).send(obj)
            }
    
            buildJSON(req.session.user,userSubChannels,userFriends)
        }catch(error){

        }
    },
    logout: (req,res) =>{
        // console.log('destorying session')
        req.session.destroy()
        // console.log('session destroyed')
        res.sendStatus(200)
    },
    update: async (req,res) =>{
        try {
        const db = req.app.get('db')
        // console.log("right here------",req.body)
        const { id } = req.params
        const { username, email, user_image, about_text} = req.body
        // console.log(id, username, email, user_image, about_text)
        let updateUser = await db.updateUser({id, username, email, user_image, about_text})
        // console.log(99999999,updateUser)
        res.status(200).send(updateUser[0])

        } catch (error) {
            console.log('error updating account:', error)
            res.status(500).send(error)
        }
    },
    // deactivate: (req,res) =>{

    // }
}