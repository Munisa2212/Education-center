const express = require("express");
const upload = require("../upload")
const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Rasm yuklash
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Rasm muvaffaqiyatli yuklandi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: Fayl yuklanmadi
 *       500:
 *         description: Server xatosi
 */
router.post("/", upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "Fayl yuklanmadi!" });
        }
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        res.json({ imageUrl: fileUrl });
    } catch (err) {
        res.status(500).json({ msg: "Server xatosi", error: err.message });
    }
});

module.exports = router;