const Branch = require("./branch.module")
const Center = require("./center.module")
const Field = require("./field.module")
const Region = require("./region.module")
const Registeration = require("./registration.module")
const User = require("./user.module")
const Category = require("./category.module")
const Subject = require("./subject.module")
const Comment = require("./comment.module")
const Resource = require("./resource.module")

User.hasMany(Comment, { foreignKey: "user_id" }); 
Comment.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Resource, { foreignKey: "user_id" }); 
Resource.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Like, { foreignKey: "user_id" }); 
Like.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Registration, { foreignKey: "user_id" });
Registration.belongsTo(User, { foreignKey: "user_id" });

Region.hasMany(Centre, { foreignKey: "region_id" });
Centre.belongsTo(Region, { foreignKey: "region_id" });

Centre.hasMany(Branch, { foreignKey: "learningCentre_id" });
Branch.belongsTo(Centre, { foreignKey: "learningCentre_id" });

Centre.hasMany(Like, { foreignKey: "learningCentre_id" });
Like.belongsTo(Centre, { foreignKey: "learningCentre_id" });

Centre.hasMany(Comment, { foreignKey: "learningCentre_id" });
Comment.belongsTo(Centre, { foreignKey: "learningCentre_id" });

Centre.hasMany(Registeration, { foreignKey: "learningCentre_id" });
Registeration.belongsTo(Centre, { foreignKey: "learningCentre_id" });

Region.hasMany(Branch, { foreignKey: "region_id" });
Branch.belongsTo(Region, { foreignKey: "region_id" });

Branch.hasMany(Registeration, { foreignKey: "branch_id" });
Registeration.belongsTo(Branch, { foreignKey: "branch_id" });

Branch.belongsTo(Centre, { foreignKey: "learningCentre_id" });

Branch.belongsTo(Subject, { foreignKey: "subject_id" });
Branch.belongsTo(Field, { foreignKey: "field_id" });

Resource.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Resource, { foreignKey: "category_id" });
