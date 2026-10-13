// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define("message",
  {
    msg_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "user_id"
      }
    },
    conv_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: "conv",
        key: "conv_id"
      }
    },
    sent: {
        type: DataTypes.DATE,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'message',
    timestamps: false,
  }
);

export default Message;