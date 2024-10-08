const { User } = require("../models/User.js");
// const twilio = require('twilio')
const dotenv = require('dotenv')
dotenv.config();

const {TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID} = process.env;
console.log(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
const twilio_client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

const get_user = async (req, res, next) => {
    try {
        const user = await User.findById(req.query.user_id);
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

const send_otp = async(req, res, next) => {
    const country_code = "+91";
    const {phone_number} = req.body;
    try {
        const otp_response = await twilio_client.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
            to: `${country_code}${phone_number}`,
            channel: 'sms'
        })
        res.status(200).send('otp sent succesfully')
    } catch (error) {
        next(error);
    }
}

const verify_otp = async(req, res, next) =>{
    const {otp_code, phone_number, is_sign_up, first_name, last_name} = req.body;
    const country_code = "+91"
    try {
        const new_user = new User({first_name, last_name, phone_no: phone_number})

        const verificationCheck = await twilio_client.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verificationChecks.create({
        code: otp_code,
        to: `${country_code}${phone_number}`,
        });

        if(verificationCheck.status != "approved"){
            res.status(401).send('unauthorized');
        }

        if(!is_sign_up){
            const user = await User.findOne({phone_no : phone_number});
            res.status(200).json(user._id)
        }
        else{
            await new_user.save();
            res.status(200).json(new_user._id)
        }
    } catch (error) {
        next(error);
    }
}

module.exports = { get_user, send_otp, verify_otp };
