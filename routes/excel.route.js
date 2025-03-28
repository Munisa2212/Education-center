const ExcelJS = require('exceljs');
const { User, Center } = require('../models/index.module');
const express = require('express');
const app = express.Router();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { roleMiddleware } = require('../middleware/role.middleware');

/**
 * @swagger
 * /excel/excel-students:
 *   get:
 *     summary: Download students' data as an Excel file
 *     security:
 *       - BearerAuth: []
 *     description: Fetches all students from the database and generates an Excel file.
 *     tags:
 *       - Excel
 *     responses:
 *       200:
 *         description: Excel file containing students' data
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
app.get('/excel-students', roleMiddleware(["ADMIN", "CEO"]), async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('My Students Data');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Year', key: 'year', width: 10 },
    { header: 'Email', key: 'email', width: 50 },
    { header: 'Phone', key: 'phone', width: 50 },
    { header: 'Region_id', key: 'region_id', width: 10 }
  ];
  
  const data = await User.findAll();
  data.forEach((element) => {
    worksheet.addRow(element.get({ plain: true }));
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

/**
 * @swagger
 * /excel/excel-centers:
 *   get:
 *     summary: Download centers' data as an Excel file
 *     description: Fetches all centers from the database and generates an Excel file.
 *     tags:
 *       - Excel
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Excel file containing centers' data
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
app.get('/excel-centers',roleMiddleware(["ADMIN", "CEO"]), async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('My Centers Data');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Phone', key: 'phone', width: 30 },
    { header: 'Location', key: 'location', width: 50 },
    { header: 'Region_id', key: 'region_id', width: 10 },
    { header: 'Branch_number', key: 'branch_number', width: 10 },
    { header: 'CEO_id', key: 'ceo_id', width: 10 },
    { header: 'Description', key: 'description', width: 10 }
  ];

  const data = await Center.findAll();
  data.forEach((element) => {
    worksheet.addRow(element.get({ plain: true }));
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=centers.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Excel Download API',
      version: '1.0.0',
      description: 'API to download students and centers data in Excel format'
    }
  },
  apis: [__filename]
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = app;



