module.exports = {
    async getChannels(req, res) {
        try {
            const db = req.app.get('db');
            let id;
            if (req.session.user)
                id = req.session.user.id;
            else
                id = -1;
            let channels = await db.channels.getChannels(id);
            res.send(channels);
        } catch(err) {
            console.log(err);
        }
    }
}