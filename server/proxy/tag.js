/**
 * @file “标签”代理层
 * @author 小强赵
 */

import models from '../models';

const TagModel = models.TagModel;

export default {

    /**
     * 插入一条 tag
     *
     * @param {Object} form 请求表单
     * @return {Object} 插入后的数据，Promise 对象
     */
    async addTagItem(form) {
        // 格式校验
        let validResult = await this.validate(form, false);

        if (!validResult.valid) {
            return Promise.reject({
                statusInfo: validResult.statusInfo
            });
        }
        const tag = {
            text: form.text,
            description: form.description
        };

        // 对象
        const tagModel = new TagModel(tag);
        return tagModel.save();
    },

    /**
     * 校验 tag 数据
     *
     * @param {Object} form 用户提交表单
     * @param {boolean} isUpdate 是否是跟新，更新时检验 tag 重名的逻辑和新建有区别
     * @param {string} tagId 只有 isUpdate 为 true 时需要且必要
     * @return {Object} 验证结果
     *                  .valid 值为 false 失败，.statusInfo 失败信息
     *                  .valid 值为 true 检验成功
     */
    async validate(form, isUpdate, tagId) {
        // 格式校验
        let valid = true;
        let statusInfo;
        if (form.text === '') {
            valid = false;
            statusInfo = '标签名不可为空';
        }

        // 重名校验
        const tag = await this.getTagByKV('text', form.text);
        if (tag) {
            // 更新
            if (isUpdate && tagId !== tag.id) {
                valid = false;
                statusInfo = `Tag “${form.text}”已存在`;
            }
            // 新建
            else if (isUpdate === false) {
                valid = false;
                statusInfo = `Tag “${form.text}”已存在`;
            }
        }

        const result = {
            valid
        };
        if (!valid) {
            result.statusInfo = statusInfo;
        }

        return result;
    },

    /**
     * 通过 ID 删除文章
     *
     * @param {string} id 用户 ID
     * @return {Object} 数据删除操作结果，Promise 对象
     */
    deleteTagItem(id) {
        return TagModel.remove({
            _id: id // eslint-disable-line
        });
    },

    /**
     * 更新 Tag
     *
     * @param {string} id tag id
     * @param {Object} tag tag 数据
     * @return {Object} 插入后的数据，Promise 对象
     */
    async updateTagItem(id, tag) {
        // 格式校验
        let validResult = await this.validate(tag, true, id);

        if (!validResult.valid) {
            return Promise.reject({
                statusInfo: validResult.statusInfo
            });
        }
        const tagObj = {
            text: tag.text,
            description: tag.description
        };

        // 对象
        return TagModel.updateOne({
            _id: id // eslint-disable-line
        }, tagObj);
    },

    /**
     * 获取 tag 列表
     *
     * @return {Object} 数据查询操作结果，Promise 对象
     */
    getTagList() {
        return TagModel.find();
    },

    /**
     * 通过键值获取某 tag
     *
     * @param {string} key 键
     * @param {string} value 值
     * @return {Object} 查询结果，Promise 对象
     */
    async getTagByKV(key, value) {
        let tag;
        const tags = await TagModel.find({
            [key]: value
        });

        tag = tags.length ? tags[0] : null;

        return tag;
    }
};
