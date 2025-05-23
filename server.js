const express = require('express')
const { connectDB } = require('./config/db')

const AuthRouter = require("./routes/auth.route")
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
const CommentRoute = require("./routes/comment.route")
const PasswordRoute = require("./routes/passwordReset.route")
const AdminRegister = require("./routes/add.route")
const Excel = require("./routes/excel.route")
const path = require("path")
const uploadRoute = require("./routes/upload.route")

const sendLog = require("./logger")

const setupSwagger = require("./swagger/swagger")
require('dotenv').config()
const app = express()

app.use(express.json())
const cors = require("cors");
app.use(cors({ origin: "*" })); 

connectDB()

setupSwagger(app)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/upload", uploadRoute);
app.use("/admin",AdminRegister)
app.use('/user', UserRoute)
app.use('/branch', BranchRoute)
app.use('/region', RegionRoute)
app.use('/center', CenterRoute)
app.use('/category', CategoryRoute)
app.use('/subject', SubjectRoute)
app.use('/resource', ResourceRoute)
app.use('/field', FieldRoute)
app.use('/enrolment', RegistrationsRoute)
app.use('/like', LikeRoute)
app.use('/rating', RatingRoute)
app.use("/search", SearchRoute)
app.use("/comment", CommentRoute)
app.use("/password", PasswordRoute)
app.use("/excel", Excel)
app.use("/auth", AuthRouter)

app.listen(3000, () =>
  console.log(`server started on port 3000`),
)