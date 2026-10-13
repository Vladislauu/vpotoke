// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const Conversation = sequelize.define("conv",
  {
    conv_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    conv_name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        len: [3, 128]
      }
    },
    conv_created: {
      type: DataTypes.DATE,
      allowNull: false
    },
    conv_avatar: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
  },
  {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conv',
    timestamps: false,
  }
);

export default Conversation;