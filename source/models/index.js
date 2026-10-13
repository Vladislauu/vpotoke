import sequelize from '../config/database.js';

import User from './user.js';
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Message, { foreignKey: 'user_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(PostSeen, { foreignKey: 'user_id', as: 'seenPosts' });
PostSeen.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

import Conversation from './conv.js';
Conversation.hasMany(ConversationMember, { foreignKey: 'conv_id', as: 'members' });
ConversationMember.belongsTo(Conversation, { foreignKey: 'conv_id', as: 'conversation' });

import ConversationMember from './conv_member.js';
User.hasMany(ConversationMember, { foreignKey: 'user_id', as: 'conversations' });
ConversationMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

import ConversationRole from './conv_role.js';
ConversationRole.hasMany(ConversationMember, { foreignKey: 'role_id', as: 'members' });
ConversationMember.belongsTo(ConversationRole, { foreignKey: 'role_id', as: 'role' });

import Message from './message.js';
Conversation.hasMany(Message, { foreignKey: 'conv_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conv_id', as: 'conversation' });

import Post from './post.js';
Post.hasMany(PostSeen, { foreignKey: 'post_id', as: 'seens' });
PostSeen.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

import PostSeen from './post_seen.js';

import Subscription from './subscription.js';
User.hasMany(Subscription, { foreignKey: 'user_id',   as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'subscriber' });
User.hasMany(Subscription, { foreignKey: 'author_id', as: 'subscribers' });
Subscription.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

import Friendship from './friendship.js';
User.hasMany(Friendship, { foreignKey: 'first_id',  as: 'friendshipsAsFirst' });
User.hasMany(Friendship, { foreignKey: 'second_id', as: 'friendshipsAsSecond' });
Friendship.belongsTo(User, { foreignKey: 'first_id',  as: 'first' });
Friendship.belongsTo(User, { foreignKey: 'second_id', as: 'second' });


export { sequelize, 
    User,
    Conversation,
    ConversationMember,
    ConversationRole,
    Message,
    Post,
    PostSeen,
    Subscription,
    Friendship 
};

export async function connectToDB() {
    try 
    {
        await sequelize.authenticate();
        console.log('connected');
        await sequelize.sync({ alter: false });
        console.log('sync');
    } 
        catch (err) 
    {
        console.error('db error:', err);
        process.exit(1);
    }
}