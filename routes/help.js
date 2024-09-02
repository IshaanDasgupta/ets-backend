const { Router } = require("express");
const {
    get_related_help_requests,
    reject_help,
} = require("../controllers/help.js");

const router = Router();

router.get("/", get_related_help_requests);
router.delete("/", reject_help);

module.exports = router;
