const { Help } = require("../models/Help.js");

const get_related_help_requests = async (req, res, next) => {
    try {
        const helps = await Help.find({
            candidates: { $in: [req.query.user_id] },
        }).populate("user");

        res.status(200).json(helps);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

module.exports = { get_related_help_requests };
