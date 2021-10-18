const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize('leadqart', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, //sql query logging in console
    pool: { max: 5, min: 0, idle: 10000 }
})
// const sequelize = new Sequelize('a5inepro_leadqart', 'a5inepro_a5ineprojects9', '%JdE89iD$Jov',{
//     host:'209.99.16.221',
//     dialect: 'mysql',
//     logging: false, //sql query logging in console
//     pool:{max:5,min:0,idle:10000}
// })

sequelize.authenticate()
    .then(() => {
        console.log("database connected");
    })
    .catch((err) => {
        console.log('error: ', err);
    })

const db = {};
db.sequelize = Sequelize;
db.sequelize = sequelize;

db.sequelize.sync({ force: false })
    .then(() => {
        console.log("synced")
    })
    .catch((err) => {
        console.log('error: ', err);
    })

//usermodel
const User = require('./users')(sequelize, DataTypes);
//facebookmodel
const Facebook = require('./facebook')(sequelize, DataTypes);
//leadmodel
const Lead = require('./leads')(sequelize, DataTypes);
//groupmodel
const Group = require('./groups')(sequelize, DataTypes);
//lead-groupmodel
const LeadGroup = require('./leadsGroups')(sequelize, DataTypes);

//user-lead relationships
User.hasMany(Lead, { as: "leads" });
Lead.belongsTo(User, {
    through: 'ProductOrders',
    foreignKey: "userId",
});
//user-group relationships
User.hasMany(Group, { as: "groups" });
Group.belongsTo(User, {
    foreignKey: "userId",
});
//lead-group relationships
Lead.belongsToMany(Group, {
    through: "leads_groups",
    as: "groups",
    foreignKey: "lead_id",
});
Group.belongsToMany(Lead, {
    through: "leads_groups",
    as: "leads",
    foreignKey: "group_id",
});
// LeadGroup.associate = (models) => {
//     LeadGroup.belongsTo(models.Lead, { foreignKey: 'lead_id', targetKey: 'lead_id', as: 'Leads' });
//     LeadGroup.belongsTo(models.Group, { foreignKey: 'group_id', targetKey: 'group_id', as: 'Groups' });
//   }
//   Group.associate = (models) => {
//     Group.belongsToMany(models.Lead, { as: 'LeadsInGroup', through: models.LeadGroup, foreignKey: 'group_id'});
//   }
//   Lead.associate = (models) => {
//     Lead.belongsToMany(models.Group, { as: 'GroupForLead', through: models.LeadGroup, foreignKey: 'lead_id'});
//   }

db.users = User;
db.facebook = Facebook;
db.leads = Lead;
db.groups = Group;
db.leadsGroups = LeadGroup;

module.exports = db;