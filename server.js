const express = require('express')
const { connectDB } = require('./config/db')
const UserRoute = require('./routes/user.route')
const BranchRoute = require('./routes/branch.route')
const RegionRoute = require('./routes/region.route')
const CenterRoute = require('./routes/center.route')
const CategoryRoute = require('./routes/category.route')
const SubjectRoute = require('./routes/subject.route')
const ResourceRoute = require('./routes/resource.route')
const FieldRoute = require('./routes/field.route')
const RegistrationsRoute = require('./routes/registration.route')
const LikeRoute = require('./routes/like.route')
const RatingRoute = require('./routes/rating.route')
const SearchRoute = require("./routes/search.route")

const setupSwagger = require("./swagger/swagger")
require('dotenv').config()
const app = express()

app.use(express.json())
connectDB()

setupSwagger(app)

app.use('/user', UserRoute)
app.use('/branch', BranchRoute)
app.use('/region', RegionRoute)
app.use('/center', CenterRoute)
app.use('/category', CategoryRoute)
app.use('/subject', SubjectRoute)
app.use('/resource', ResourceRoute)
app.use('/field', FieldRoute)
app.use('/registration', RegistrationsRoute)
app.use('/like', LikeRoute)
app.use('/rating', RatingRoute)
app.use("/search", SearchRoute)

app.listen(process.env.PORT, () =>
  console.log(`server started on port ${process.env.PORT}`),
)

