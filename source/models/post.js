// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const Post = sequelize.define("post",
  {
    post_id: {
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
    created: {
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
    modelName: 'Post',
    tableName: 'post',
    timestamps: false,
  }
);

export default Post;