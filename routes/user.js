const { Router } = require("express");
const { get_user, send_otp, verify_otp } = require("../controllers/user.js");

const router = Router();

router.get("/", get_user);
router.post("/send-otp", send_otp);
//sign in
router.post("/verify-otp", verify_otp)
module.exports = router;
