/**
 * @file “文章”数据格式定义
 */
import mongoose from 'mongoose';
import BaseModel from './base-model';

const Schema = mongoose.Schema;
const articleSchema = new Schema({
    // 标题
    title: {type: String},
    // 标签
    tags: {type: Array},
    // 描述
    description: {type: String},
    // markdown 内容
    mdContent: {type: String},
    // 作者 ID
    authId: {type: String},
    // 创建时间
    createDate: {type: String},
    // 更新时间
    updateDate: {type: String}
});

articleSchema.plugin(BaseModel);

export default mongoose.model('article', articleSchema);
