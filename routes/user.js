const { Router } = require("express");
const {
    get_user,
    send_otp,
    verify_otp,
    get_user_by_phone_number,
    create_user,
} = require("../controllers/user.js");

const router = Router();

router.get("/", get_user);
router.post("/", create_user);
router.get("/phone", get_user_by_phone_number);
router.post("/send-otp", send_otp);
//sign in
router.post("/verify-otp", verify_otp);
module.exports = router;
