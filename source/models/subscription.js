// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const Subscription = sequelize.define("subscription",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id"
      }
    },
    author_id: {
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
    modelName: 'Subscription',
    tableName: 'subscription',
    timestamps: false,
  }
);

export default Subscription;