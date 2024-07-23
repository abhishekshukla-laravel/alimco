const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const aasra = require("../model/aasra");
const users = require("../model/users");

const ticket = sequelize.define('ticket', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    ticket_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        
    },
    aasra_id:{
        type: DataTypes.STRING,
        allowNull: true,
        
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: true,
        field:'itemName'
    },
    item_id:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'itemId'
    },
    itemExpiry:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    appointment_date:
    {
        type: DataTypes.STRING,
        allowNull: true
    },appointment_time:
    {
        type: DataTypes.STRING,
        allowNull: true
    },
    status:{
        type: DataTypes.STRING,
        allowNull:true
    },  
    
    
},{
    timestamps:false
});


// aasra.hasMany(ticket,{foreignKey:'aasra_id',as:'aasra_ticket'})
// sequelize.sync()

//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = ticket;
