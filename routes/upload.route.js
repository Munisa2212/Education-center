const express = require("express");
const path = require("path");
const upload = require("../upload");
const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload file
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
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: File not provided
 */
router.post("/", upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "Fayl yuklanmadi!" });
        }
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        res.json({ imageUrl: fileUrl, filename: req.file.filename });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /upload:
 *   get:
 *     summary: Get uploaded file
 *     tags: [Upload]
 *     parameters:
 *       - name: filename
 *         in: query
 *         description: Uploaded filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File returned successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: filename not provided or file nor found
 */
router.get("/", (req, res) => {
    try {
        const { filename } = req.query;

        if (!filename) {
            return res.status(400).send({ message: "Filename is required!" });
        }

        const filePath = path.join(__dirname, "../uploads", filename);
        
        res.sendFile(filePath, (err) => {
            if (err) {
                return res.status(404).send({ message: "File not found!" });
            }
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;