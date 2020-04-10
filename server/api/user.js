/**
 * @file 用户实体相关的接口
 * @author 小强赵
 */

import user from '../proxy/user.js';

export default {

    /**
     * 登录
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    async signin(req, res) {
        const result = await user.signin(req.body, res);
        const map = [
            {
                statusInfo: '登录成功',
                data: result.data
            },
            {
                statusInfo: '用户不存在'
            },
            {
                statusInfo: '用户名和密码不匹配'
            }
        ];

        const data = map[result.type];
        data.status = 0;

        res.send(data);
    },

    /**
     * 退出登录
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    signout(req, res) {
        user.signout(res);
        res.send({
            status: 0,
            statusInfo: '退出登录成功'
        });
    },

    /**
     * 获取当前用户信息，如果用户未登录 currentUser 为 null
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    async getCurrentUser(req, res) {
        const currentUser = await user.getCurrentUser(req);
        res.send({
            status: 0,
            statusInfo: '',
            data: currentUser
        });
    },

    /**
     * 获取用户列表
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    getUserList(req, res) {
        user.getUserList().then(data => {
            res.send({
                status: 0,
                statusInfo: '',
                data
            });
        });
    },

    /**
     * 按 ID 删除某个用户
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    deleteUserItem(req, res) {
        user.deleteUserItem(req.params.id).then(data => {
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
     * 添加一个用户
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    addUserItem(req, res) {
        user.addUserItem(req.body).then(data => {
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
     * 按 ID 更新某个用户的密码 (root 用户不需要提供原密码)
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    updateUserPassword(req, res) {
        user.updateUserPassword(req.params.id, req.body).then(data => {
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
     * 按当前用户的密码 (需要提供原密码)
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    updateCurrentUserPassword(req, res) {
        user.updateCurrentUserPassword(req).then(data => {
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
    }

    /**
     * 初始化 Root 用户 -- 系统初始化完成后注释掉此方法
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     */
    // initRootUser(req, res) {
    //     user.addUserItem({
    //         name: config.rootAcount,
    //         pwd: config.rootAcount
    //     }).then(data => {
    //         res.send({
    //             status: 0,
    //             statusInfo: '',
    //             data
    //         });
    //     }, err => {
    //         res.send({
    //             status: 1,
    //             ...err
    //         });
    //     });
    // }
};
