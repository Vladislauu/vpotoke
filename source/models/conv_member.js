// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const ConversationMember = sequelize.define("conv_member",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id"
      }
    },
    conv_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "conv",
        key: "conv_id"
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conv_role",
        key: "role_id"
      }
    },
  },
  {
    sequelize,
    modelName: 'ConversationMember',
    tableName: 'conv_member',
    timestamps: false,
  }
);

export default ConversationMember;