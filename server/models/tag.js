/**
 * @file “标签”数据格式定义
 */
import mongoose from 'mongoose';
import BaseModel from './base-model';

const Schema = mongoose.Schema;
const tagSchema = new Schema({
    // 文本
    text: {type: String},
    // 描述
    description: {type: String},
    // 创建时间
    createDate: {type: String},
    // 更新时间
    updateDate: {type: String}
});

tagSchema.plugin(BaseModel);

export default mongoose.model('tag', tagSchema);
