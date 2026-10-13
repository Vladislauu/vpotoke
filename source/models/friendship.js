// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const Friendship = sequelize.define("friendship",
  {
    first_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id"
      }
    },
    second_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id"
      }
    },
  },
  {
    sequelize,
    modelName: 'Friendship',
    tableName: 'friendship',
    timestamps: false,
  }
);

export default Friendship;