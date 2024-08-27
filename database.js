const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'chat.db')
});

const Message = sequelize.define('Message', {
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Synchronize the models with the database
sequelize.sync()
    .then(() => {
        console.log('Database & tables created!');
    });

module.exports = {
    sequelize,
    Message,
    User
};
