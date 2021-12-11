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
//followupmodel
const followUp = require('./follow')(sequelize, DataTypes);
//contentmessagemodel
const contentMessage = require('./contentMessage')(sequelize, DataTypes);
//contentfilemodel
const contentFile = require('./contentFile')(sequelize, DataTypes);
//contentpagemodel
const contentPage = require('./contentPage')(sequelize, DataTypes);
//leadmodel
const Lead = require('./leads')(sequelize, DataTypes);
//groupmodel
const Group = require('./groups')(sequelize, DataTypes);
//lead-groupmodel
const LeadGroup = require('./leadsGroups')(sequelize, DataTypes);
//contentmessagemodel
const Activity = require('./activity')(sequelize, DataTypes);
//webhook
const Webhook = require('./webhook')(sequelize, DataTypes);

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

//user-lead-followup relationships
User.hasMany(followUp, { as: "followUps" });
Lead.hasMany(followUp, { as: "followUps" });
followUp.belongsTo(User, {
    foreignKey: "userId",
});
followUp.belongsTo(Lead, {
    foreignKey: "leadId",
});

//lead-Activity relationships
Lead.hasMany(Activity, { as: "activity" });
Activity.belongsTo(Lead, {
    foreignKey: "leadId",
});
//user-Activity relationships
User.hasMany(Activity, { as: "activity" });
Activity.belongsTo(User, {
    foreignKey: "userId",
});

//user-contentMessage relationships
User.hasMany(contentMessage, { as: "contentMessage" });
contentMessage.belongsTo(User, {
    foreignKey: "userId",
});

//user-contentFile relationships
User.hasMany(contentFile, { as: "contentFile" });
contentFile.belongsTo(User, {
    foreignKey: "userId",
});

//user-contentPage relationships
User.hasMany(contentPage, { as: "contentPage" });
contentPage.belongsTo(User, {
    foreignKey: "userId",
});

db.users = User;
db.facebook = Facebook;
db.leads = Lead;
db.groups = Group;
db.leadsGroups = LeadGroup;
db.followUp = followUp;
db.contentMessage = contentMessage;
db.contentFile = contentFile;
db.contentPage = contentPage;
db.Activity = Activity;
db.Webhook = Webhook;

module.exports = db;
