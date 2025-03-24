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
const Like = require("./like.module")

User.hasMany(Comment, { foreignKey: "user_id" }); 
Comment.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Resource, { foreignKey: "user_id" }); 
Resource.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Like, { foreignKey: "user_id" }); 
Like.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Registeration, { foreignKey: "user_id" });
Registeration.belongsTo(User, { foreignKey: "user_id" });

Region.hasMany(Center, { foreignKey: "region_id" });
Center.belongsTo(Region, { foreignKey: "region_id" });

Center.hasMany(Branch, { foreignKey: "learningCentre_id" });
Branch.belongsTo(Center, { foreignKey: "learningCentre_id" });

Center.hasMany(Like, { foreignKey: "learningCentre_id" });
Like.belongsTo(Center, { foreignKey: "learningCentre_id" });

Center.hasMany(Comment, { foreignKey: "learningCentre_id" });
Comment.belongsTo(Center, { foreignKey: "learningCentre_id" });

Center.hasMany(Registeration, { foreignKey: "learningCentre_id" });
Registeration.belongsTo(Center, { foreignKey: "learningCentre_id" });

Region.hasMany(Branch, { foreignKey: "region_id" });
Branch.belongsTo(Region, { foreignKey: "region_id" });

Branch.hasMany(Registeration, { foreignKey: "branch_id" });
Registeration.belongsTo(Branch, { foreignKey: "branch_id" });

Branch.belongsTo(Center, { foreignKey: "learningCentre_id" });

Branch.belongsTo(Subject, { foreignKey: "subject_id" });
Branch.belongsTo(Field, { foreignKey: "field_id" });

Resource.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Resource, { foreignKey: "category_id" });


module.exports = {
    User,
    Comment,
    Resource,
    Like,
    Registeration,
    Branch,
    Center,
    Region,
    Field,
    Category,
    Subject,
};