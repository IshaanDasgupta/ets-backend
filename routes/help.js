const { Router } = require("express");
const { get_related_help_requests } = require("../controllers/help.js");

const router = Router();

router.get("/", get_related_help_requests);

module.exports = router;
