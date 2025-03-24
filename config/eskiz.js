const axios = require("axios")
const api = axios.create({
    baseURL: "https://notify.eskiz.uz/api/",
    headers: {
        Authorization: `Bearer ${process.env.ESKIZ_TOKEN}`
    }
})

async function sendSMS(tel, otp) {
    try {
        api.post("message/sms/send", {
            mobile_phone: tel,
            message: "Bu Eskiz dan test"
        })
        console.log("sended", otp, tel);
    } catch (error) {
        res.send(error)
    }
}

module.exports = sendSMS