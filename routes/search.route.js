const router = require("express").Router();
const AuthMiddleware = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const { Op } = require("sequelize");
const { Comment, User, Center, Branch, Category, Field, Subject, Region, Resource, Registration } = require("../models/index.module");
const sendLog = require("../logger")


router.get("/comment", async (req, res) => {
    try {
        let { user_id, comment, star, learningCenter_id, take, page, sortBy, sortOrder } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /comment | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (user_id) where.user_id = user_id;
        if (comment) where.comment = { [Op.like]: `%${comment}%` };
        if (star) where.star = star;
        if (learningCenter_id) where.learningCenter_id = learningCenter_id;

        const limit = parseInt(take) || 10;
        const offset = (parseInt(page) - 1) * limit;
        const order = [[sortBy || "id", (sortOrder || "ASC").toUpperCase()]];

        sendLog(`🔄 Filtirlangan ma'lumotlar | 📌 Filter: ${JSON.stringify(where)} | 📊 Limit: ${limit} | 📍 Page: ${page} | 📌 Sort: ${JSON.stringify(order)}`);

        const comments = await Comment.findAll({
            where,
            limit,
            offset,
            order,
            include: [
                { model: User, attributes: ["id", "name", "email"] },
                { model: Center, attributes: ["id", "name"] },
            ],
        });

        if(!comments.length) return res.status(404).send({message: "Comments not found"})

        sendLog(`✅ ${comments.length} ta izoh topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(comments);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /comment | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.get("/user", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let { name, email, phone, role } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /user | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.username = { [Op.like]: `%${name}%` };
        if (email) where.email = { [Op.like]: `%${email}%` };
        if (phone) where.phone = { [Op.like]: `%${phone}%` };
        if (role) where.role = role;

        sendLog(`🔄 Filtirlangan ma'lumotlar | 📌 Filter: ${JSON.stringify(where)}`);

        const users = await User.findAll({ where });
        
        if(!users.length) return res.status(404).send({message: "Users not found"})

        sendLog(`✅ ${users.length} ta user topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(users);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /user | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.get("/center", async (req, res) => {
    try {
        let { name, region_id, ceo_id, branch_name, subject_id, student_count = 0, field_id, branch_id, limit = 10, page = 1, order = "ASC", sortBy = "id" } = req.query;
        const where = {};
        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /center | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (region_id) where.region_id = region_id;
        if (ceo_id) where.ceo_id = ceo_id;

        const include = [
            { model: Region, attributes: ["id", "name"] },
            { model: User, attributes: ["id", "email", "name"] },
            { model: Branch, attributes: ["id", "name", "location"], ...(branch_id ? { where: { id: branch_id } } : {}), ...(branch_name ? { where: {name: { [Op.like]: `%${branch_name}%` }}} : { }) },
            { model: Comment, attributes: ["id", "star", "comment"] },
            { model: Subject, through: { attributes: [] }, ...(subject_id ? { where: { id: subject_id } } : {}) },
            { model: Field, through: { attributes: [] }, ...(field_id ? { where: { id: field_id } } : {}) },
            {model: Registration}
        ];

        sendLog(`🔄 Filtirlangan ma'lumotlar | 📌 Filter: ${JSON.stringify(where)}`);

        const centers = await Center.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include
        });

        if(!centers.length) return res.status(404).send({message: "Centers not found"})

            let withStudentCount = centers.filter(e => e.Registrations.length >= student_count);

            let arr = withStudentCount.map(e => {
                const center = e.get({ plain: true }); 
                center.student_count = center.Registrations.length; 
                delete center.Registrations;
                return center;
            });
        
        sendLog(`✅ ${centers.length} ta oquv markazi topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(arr);
    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /center | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.get("/branch", async (req, res) => {
    try {
        let { name, location, center_id, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /branch | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (location) where.location = { [Op.like]: `%${location}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const branches = await Branch.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [
                {model: Center, attributes: ["id", "name", "location"], ...(center_id ? { where: { id: center_id } } : {})}
            ]
        });

        if(!branches.length) return res.status(404).send({message: "Branches not found"}) 

        sendLog(`✅ ${branches.length} ta filial topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(branches);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /branch | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.get("/category", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /category | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const categories = await Category.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [{ model: Resource, attributes: ["name", "description"] }],
        });

        if(!categories.length) return res.status(404).send({message: "Categories not found"})


        sendLog(`✅ ${categories.length} ta kategoriya topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(categories);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /category | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


router.get("/field", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /field | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const fields = await Field.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if(!fields.length) return res.status(404).send({message: "Fields not found"})

        sendLog(`✅ ${fields.length} ta maydon topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(fields);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /field | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


router.get("/subject", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /subject | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const subjects = await Subject.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if(!subjects.length) return res.status(404).send({message: "Subjects not found"})

        sendLog(`✅ ${subjects.length} ta fan topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(subjects);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /subject | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


router.get("/region", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /region | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const regions = await Region.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if(!regions) return res.status(404).send({message: "Regions not found"})

        sendLog(`✅ ${regions.length} ta hudud topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(regions);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /region | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


module.exports = router;