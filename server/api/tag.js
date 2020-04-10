/**
 * @file tag 实体相关的接口
 * @author 小强赵
 */

import tag from '../proxy/tag.js';

export default {

    /**
     * 添加 tag
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    addTagItem(req, res) {
        tag.addTagItem(req.body).then(data => {
            res.send({
                status: 0,
                statusInfo: '',
                data
            });
        }, err => {
            res.send({
                status: 1,
                ...err
            });
        });
    },

    /**
     * 按 ID 删除某 tag
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    deleteTagItem(req, res) {
        tag.deleteTagItem(req.params.id).then(data => {
            res.send({
                status: 0,
                statusInfo: '',
                data
            });
        }, err => {
            res.send({
                status: 1,
                statusInfo: '删除失败',
                data: err
            });
        });
    },

    /**
     * 更新 tag
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    updateTagItem(req, res) {
        tag.updateTagItem(req.params.id, req.body).then(data => {
            res.send({
                status: 0,
                statusInfo: '',
                data
            });
        }, err => {
            res.send({
                status: 1,
                ...err
            });
        });
    },


    /**
     * 获取 tag 列表
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    getTagList(req, res) {
        tag.getTagList().then(data => {
            res.send({
                status: 0,
                statusInfo: '',
                data
            });
        });
    },

    /**
     * 通过 ID 获取某 tag
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    getTagById(req, res) {
        tag.getTagByKV('_id', req.params.id).then(data => {
            res.send({
                status: 0,
                statusInfo: '',
                data
            });
        });
    }
};
