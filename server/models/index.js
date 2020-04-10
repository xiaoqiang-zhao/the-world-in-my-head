/**
 * @file 数据库操作入口文件
 * @author 小强赵
 */

import mongoose from 'mongoose';
import bluebird from 'bluebird';

import UserModel from './user';
import ArticleModel from './article';
import TagModel from './tag';
import config from '../config.js';

mongoose.Promise = bluebird;

mongoose.connect(config.db, {
    useNewUrlParser: true
}).then(() => {
    console.log('数据库链接成功');
}, err => {
    console.log('数据库链接失败:', err);
});

export default {
    UserModel,
    ArticleModel,
    TagModel
};
