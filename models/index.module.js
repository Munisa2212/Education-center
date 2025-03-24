const Branch = require("./branch.module")
const Center = require("./center.module")
const Field = require("./field.module")
const Region = require("./region.module")
const Registration = require("./registration.module")
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

User.hasMany(Registration, { foreignKey: "user_id" });
Registration.belongsTo(User, { foreignKey: "user_id" });

Region.hasMany(Center, { foreignKey: "region_id" });
Center.belongsTo(Region, { foreignKey: "region_id" });

Center.hasMany(Branch, { foreignKey: "learningCenter_id" });
Branch.belongsTo(Center, { foreignKey: "learningCenter_id" });

Center.hasMany(Like, { foreignKey: "learningCenter_id" });
Like.belongsTo(Center, { foreignKey: "learningCenter_id" });

Center.hasMany(Comment, { foreignKey: "learningCenter_id" });
Comment.belongsTo(Center, { foreignKey: "learningCenter_id" });

Center.hasMany(Registration, { foreignKey: "learningCenter_id" });
Registration.belongsTo(Center, { foreignKey: "learningCenter_id" });

Region.hasMany(Branch, { foreignKey: "region_id" });
Branch.belongsTo(Region, { foreignKey: "region_id" });

Branch.hasMany(Registration, { foreignKey: "branch_id" });
Registration.belongsTo(Branch, { foreignKey: "branch_id" });

Branch.belongsTo(Center, { foreignKey: "learningCenter_id" });

Branch.belongsTo(Subject, { foreignKey: "subject_id" });
Branch.belongsTo(Field, { foreignKey: "field_id" });

Resource.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Resource, { foreignKey: "category_id" });


module.exports = {
    User,
    Comment,
    Resource,
    Like,
    Registration,
    Branch,
    Center,
    Region,
    Field,
    Category,
    Subject,
};