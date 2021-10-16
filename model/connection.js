const {Sequelize, DataTypes}  = require("sequelize");

// const sequelize = new Sequelize('leadqart', 'root', '',{
//     host:'localhost',
//     dialect: 'mysql',
//     logging: false, //sql query logging in console
//     pool:{max:5,min:0,idle:10000}
// })
const sequelize = new Sequelize('db2jg6l5rf2i2r', 'pwkhgbxuhsxxok', 'fb595eb184d77bf050ba080355c39e63791c5b9999ff59a970d96f1a1a756db1',{
    host:'ec2-3-222-235-188.compute-1.amazonaws.com',
    dialect: 'postgres',
    logging: false, //sql query logging in console
    pool:{max:5,min:0,idle:10000}
})

sequelize.authenticate()
.then(()=>{
    console.log("database connected");
})
.catch((err)=>{
    console.log('error: ',err);
})

const db = {};
db.sequelize = Sequelize;
db.sequelize = sequelize;

db.sequelize.sync({force:false})
.then(()=>{
    console.log("synced")
})
.catch((err)=>{
    console.log('error: ',err);
})

db.users = require('./users')(sequelize, DataTypes);

module.exports = db;