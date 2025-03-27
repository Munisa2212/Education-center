const { Op } = require('sequelize')
const { Branch, Center, Region, Field, Subject } = require('../models/index.module')
const Branch_validation = require('../validation/branch.validation')
const express = require('express')
const { roleMiddleware } = require('../middleware/role.middleware')
const BranchSubject = require('../models/branchSubject.module')
const BranchField = require('../models/branchField.module')
const route = express.Router()

/**
 * @swagger
 * tags:
 *   name: Branch 🏢
 *   description: Branch management API
 */

/**
 * @swagger
 * /branch:
 *   get:
 *     summary: Get all branches
 *     tags: [Branch 🏢]
 *     security: 
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all branches
 *       400:
 *         description: Bad request
 */
route.get('/', async (req, res) => {
  try {
    const branches = await Branch.findAll()
    res.json(branches)
  } catch (error) {
    console.error("Error in GET /branch:", error)
    res.status(400).send({ message: error.message })
  }
})

route.get("/:id", async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id)
    if (!branch) return res.status(404).send({ message: 'Branch not found' })
    res.json(branch)
  } catch (error) {
    console.error("Error in GET /branch/:id:", error)
    res.status(400).send({ message: error.message })
  }
})

/**
 * @swagger
 * /branch:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branch 🏢]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - location
 *               - region_id
 *               - learningCenter_id
 *               - field_id
 *               - subject_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Central Branch"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               location:
 *                 type: string
 *                 example: "Tashkent, Uzbekistan"
 *               region_id:
 *                 type: integer
 *                 example: 2
 *               learningCenter_id:
 *                 type: integer
 *                 example: 1
 *               field_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               subject_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [4, 5]
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Bad request
 */
route.post('/', roleMiddleware(["ADMIN", "CEO"]),async (req, res) => {
  try {
    const { region_id, learningCenter_id, field_id, subject_id, ...rest} = req.body

    const { error } = Branch_validation.validate(req.body)
    if (error) return res.status(400).send({ message: error.details[0].message })
    
    const existingBranches = await Branch.findOne({where: {learningCenter_id: learningCenter_id, name: rest.name}})
    if(existingBranches) return res.status(400).send({message: "This learning center already has a Branch with such a name!"})

    let center = await Center.findByPk(learningCenter_id)
    if (!center) return res.status(404).send({ message: 'Center not found' })

    let region = await Region.findByPk(region_id)
    if (!region) return res.status(404).send({ message: 'Region not found' })

      const subjects = await Subject.findAll({ where: { id: subject_id } });
      if (subjects.length !== subject_id.length) {
          return res.status(404).send({ message: 'One or more subjects not found' });
      }
      
      const fields = await Field.findAll({ where: { id: field_id } });
      if (fields.length !== field_id.length) {
          return res.status(404).send({ message: 'One or more fields not found' });
      }
    
      
      await center.update({ branch_number: center.branch_number + 1 });

      const newBranch = await Branch.create({
        ...rest,
        region_id: region_id,
        learningCenter_id: learningCenter_id
      })

      await BranchSubject.bulkCreate(
        subject_id.map((subject_id) => ({
            BranchId: newBranch.id,
            SubjectId: subject_id,
        }))
    );
    console.log("Subjects added to BranchSubject:", subject_id);
    
    await BranchField.bulkCreate(
        field_id.map((field_id) => ({
            BranchId: newBranch.id,
            FieldId: field_id,
        }))
    );  
      
    res.status(201).send({ newBranch })
    } catch (err) {
      console.error("Error in POST /branch:", err);
    return res.status(400).json({ message: err.message })
  }
})

route.patch('/:id', async (req, res) => {
  try {
    let one = await Branch.findByPk(req.params.id)
    if (!one) return res.status(404).send({ message: 'Not found' })

    await one.update(req.body)
    res.send({ message: 'Updated successfully' })
  } catch (err) {
    console.error("Error in PATCH /branch:", err)
    return res.status(400).json({ message: err.message })
  }
})

/**
 * @swagger
 * /branch/{id}:
 *   patch:
 *     summary: Update a branch
 *     tags: [Branch 🏢]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Branch Name"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               location:
 *                 type: string
 *                 example: "Updated Location"
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Branch not found
 */

route.patch("/:id", async(req, res)=>{
  const {id} = req.params
  try {
      if(!id){
        return res.status(400).send({message: "Wrong id"})
      }

      const data = await Branch.findByPk(id)
      if(!data){
          return res.status(404).send("Branch not found")
      }
        
      await data.update(req.body)
      res.status(200).send(data)
  } catch (error) {
      console.log(error)
      res.status(400).send({message: error})
  }
})

/**
 * @swagger
 * /branch/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branch 🏢]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 */
route.delete('/:id', async (req, res) => {
  try {
    let one = await Branch.findByPk(req.params.id)
    if (!one) return res.status(404).send({ message: 'Not found' })
    
    await one.destroy()
    res.send({ message: 'Deleted successfully' })
  } catch (err) {
    console.error("Error in DELETE /branch:", err)
    return res.status(400).json({ message: 'Cannot delete this branch, it may be linked to other records' })
  }
})


module.exports = route