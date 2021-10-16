const {Sequelize, DataTypes}  = require("sequelize");

// const sequelize = new Sequelize('leadqart', 'root', '',{
//     host:'localhost',
//     dialect: 'mysql',
//     logging: false, //sql query logging in console
//     pool:{max:5,min:0,idle:10000}
// })
const sequelize = new Sequelize('a5inepro_leadqart', 'a5inepro_a5ineprojects9', '%JdE89iD$Jov',{
    host:'209.99.16.221',
    dialect: 'mysql',
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