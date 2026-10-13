// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define("user",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nickname: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        len: [3, 128]
      }
    },
    
    password: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING(64),
      allowNull: false
    },

    avatar_path: {
      type: DataTypes.STRING(256),
    },
    status: {
      type: DataTypes.STRING(256),
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false,
  }
);

export default User;