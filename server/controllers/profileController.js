module.exports={
    getUserProfile: async (req, res) => {
        try{
            const db = req.app.get('db')
            const {id} = req.params
            //USER DATA
            let userData = await db.user.getUserById(id)
            //SUBBED CHANNELS
            let userSubChannels = await db.getAllSubscibedChannels(id)
            //FRIENDS
            let userFriends = await db.getUserFriends(id)
            // POST META DATA
            let postMeta = await db.profile.getPostMeta(id)
            // RECENT MESSAGES
            let profileRecentMessages = await db.profile.getProfileRecentMessages(id)
            // create new object for frontend
            function buildJSON(userData, userSubChannels, userFriends,postMeta, profileRecentMessages){
                let obj = {}
                obj.user = userData[0];
                obj.userSubChannels = userSubChannels;
                obj.userFriends = userFriends;
                obj.postMeta = postMeta[0];
                obj.profileRecentMessages = profileRecentMessages;
                res.status(200).send(obj)
            }

            buildJSON(userData, userSubChannels, userFriends,postMeta, profileRecentMessages)



                // probably going to need to assemble the object before returning
            }catch (error){
            console.log('error getting user profile:', error)
            res.status(500).send(error)   
        }
    }
}