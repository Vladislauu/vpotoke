// source/models/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

const PostSeen = sequelize.define("post_seen",
  {
    post_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "post",
        key: "post_id"
      }
    },
    user_id: {
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
    modelName: 'PostSeen',
    tableName: 'post_seen',
    timestamps: false,
  }
);

export default PostSeen;