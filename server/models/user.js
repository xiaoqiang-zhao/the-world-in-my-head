/**
 * @file “用户”数据格式定义
 */
import mongoose from 'mongoose';
import BaseModel from './base-model';

const Schema = mongoose.Schema;
const userSchema = new Schema({
    // 姓名
    name: {type: String},
    // 密码(md5加密过后的)
    pwd: {type: String},
    // 创建时间
    createDate: {type: String},
    // 更新时间
    updateDate: {type: String}
});

userSchema.plugin(BaseModel);

export default mongoose.model('user', userSchema);
