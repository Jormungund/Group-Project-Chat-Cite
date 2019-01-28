module.exports = {
    async getActiveDms(req, res) {
        try {
            if (!req.session.user)
                return res.send([]);
            const db = req.app.get('db');
            const { id } = req.session.user;
            const myDms = await db.dm.getActiveDms(id);
            res.send(myDms);
        } catch(err) {
            console.log(err);
        }
    },
    async hideDm(req, res) {
        try {
            const db = req.app.get('db');
            const { id: myId } = req.session.user;
            let { dmPartnerId } = req.params;
            dmPartnerId = Number(dmPartnerId);
            await db.dm.hideDm(myId, dmPartnerId);
            res.sendStatus(200);
        } catch(err) {
            console.log(err);
        }
    }
}