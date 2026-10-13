// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const ConversationRole = sequelize.define("conv_role",
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(64),
        allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'ConversationRole',
    tableName: 'conv_role',
    timestamps: false,
  }
);

export default ConversationRole;