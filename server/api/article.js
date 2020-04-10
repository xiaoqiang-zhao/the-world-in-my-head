/**
 * @file 文章实体相关的接口
 * @author 小强赵
 */

import article from '../proxy/article.js';

export default {

    /**
     * 添加一篇文章
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    addArticleItem(req, res) {
        article.addArticleItem(req).then(data => {
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
     * 按 ID 删除某篇文章
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    deleteArticleItem(req, res) {
        article.deleteArticleItem(req.params.id).then(data => {
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
     * 更新一篇文章
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    updateArticleItem(req, res) {
        article.updateArticleItem(req.params.id, req.body).then(data => {
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
     * 获取文章列表
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    getArticleList(req, res) {
        article.getArticleList().then(data => {
            res.send({
                status: 0,
                statusInfo: '',
                data
            });
        });
    },

    /**
     * 通过 ID 获取某篇文章
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    getArticleById(req, res) {
        article.getArticleById(req.params.id).then(data => {
            res.send({
                status: 0,
                statusInfo: '',
                data
            });
        });
    }
};
