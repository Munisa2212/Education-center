const {User} = require("../models/index.module")
const {Region} = require("../models/index.module")
const UserValidation = require("../validation/user.validation")
const LoginValidation = require("../validation/user.validation")
const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {AuthMiddleware} = require("../middleware/auth.middleware")
const {roleMiddleware} = require("../middleware/role.middleware")
const { totp, authenticator } = require("otplib");
const { sendEmail } = require("../config/transporter");
const { Op } = require("sequelize");
const DeviceDetector = require("device-detector-js");
const deviceDetector = new DeviceDetector()

totp.options = { step: 300, digits: 5 };

router.post("/register", async (req, res) => {
    try {
        let { error } = UserValidation.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { username, password, email, phone,region_id, ...rest } = req.body;
        let region_one = await Region.findByPk(region_id)
        if(!region_one){
          return res.status(404).send({ message: "Region not found" });
        }
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            return res.status(400).send({ message: "User already exists, email exists" });
        }
        let hash = bcrypt.hashSync(password, 10);
        let newUser = await User.create({
            ...rest,
            region_id: region_id,
            username: username,
            phone: phone,
            email: email,
            password: hash
        });
        let otp = totp.generate(email + "email");
        console.log(otp);
        sendEmail(email, otp);
        res.send({user_data: newUser, message: "User created successfully otp is sended to email and phone"});
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/verify", async (req, res) => {
    let { email, otp } = req.body;
    try {
        let user = await User.findOne({ where: { email: email } });
        if (!user) return res.status(404).send({ message: "User not found" });

        let match = totp.verify({ token: otp, secret: email + "email" });
        if (!match) return res.status(404).send({ message: "Otp is not valid" });

        await user.update({ status: "ACTIVE" });
        res.send({ message: "Email successfully verified! You can now log in." });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/resend-otp", async (req, res) => {
    let { email } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        console.log(email);
        const token = totp.generate(email + "email");
        console.log("OTP: ", token);
        sendEmail(email, token);
        res.send({ message: `Token sent to ${email}` });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        let { error } = LoginValidation.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let { password, email } = req.body;
        let user = await User.findOne({ where: { email: email } });
        if (!user) return res.status(404).send({ message: "User not found" });
        let match = bcrypt.compareSync(password, user.password);
        if (!match) return res.status(400).send({ message: "Wrong password" });

        if (user.status != "ACTIVE") return res.status(400).send({ message: "Verify your email first!" });

        let refresh_token = jwt.sign({ id: user.id, role: user.role }, "sekret",{expiresIn: "1d"});
        let access_token = jwt.sign({ id: user.id, role: user.role }, "sekret", { expiresIn: "15m" });
        res.send({ refresh_token: refresh_token, access_token: access_token });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get("/", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let users = await User.findAll();
        res.send(users);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/:id", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found" });
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/:id", AuthMiddleware(), async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found" });

        if(req.user.role !== "ADMIN" && req.user.id != user.id){
          return res.status(400).send({ message: `You are not allowed to delete this user. ${req.user.role} can delete only his own account` });
        }
        let deleted = await user.destroy();
        res.send({deleted_data:  deleted, message: "User deleted successfully" });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/me", AuthMiddleware(), async(req, res)=>{
    try {
        let data = deviceDetector.parse(req.headers["user-agent"])
        let user = await User.findByPk(req.user.id)
        res.send({user: user, device: data})
    } catch (error) {
        res.status(404).send(error)
    }
})


router.get("/refresh", AuthMiddleware(), async(req,res)=>{
    try {
        let id = req.user.id
        let role = req.user.role
        let access_token = jwt.sign({id: id,role: role},"sekret",{expiresIn: "15m"})
        res.send({access_token: access_token})
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;