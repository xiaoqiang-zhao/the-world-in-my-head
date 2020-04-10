/**
 * @file 用户代理层
 * @author 小强赵
 */

import models from '../models';
import utiles from '../../utiles';
import auth from '../middlewares/auth';
import config from '../config';

const UserModel = models.UserModel;

export default {

    /**
     * 登录
     *
     * @param {Object} form 用户数据
     * @param {Object} res 返回头
     * @return {Object} 登录后的用户数据，Promise 对象
     */
    async signin(form, res) {
        // 格式校验
        let valid = true;
        let statusInfo;
        if (form.name === '') {
            valid = false;
            statusInfo = '用户名不可为空';
        }

        if (form.pwd === '') {
            valid = false;
            statusInfo = '密码不可为空';
        }
        else {
            form.pwd = utiles.md5(form.pwd);
        }
        if (!valid) {
            return Promise.reject({
                statusInfo
            });
        }

        const users = await this.getUserByName(form.name);
        let type;
        let data;

        // 用户未找到
        if (users.length === 0) {
            type = 1;
        }
        // 密码错误
        else if (form.pwd !== users[0].pwd) {
            type = 2;
        }
        // 登录成功
        else {
            type = 0;
            data = {
                name: users[0].name
            };
            auth.setSession(users[0]._id, res);
        }

        return {
            type,
            data
        };
    },

    /**
     * 注销
     *
     * @param {Object} res 返回头
     */
    signout(res) {
        auth.clearSession(res);
    },

    /**
     * 获取当前用户
     *
     * @param {Object} req 请求对象
     * @param {boolean} needPwd 是否需要返回密码
     * @return {Object} user 当前用户对象，未登录返回 null
     */
    async getCurrentUser(req, needPwd) {
        const token = req.signedCookies[config.authCookieName];
        let user;
        let userData;
        if (token === undefined) {
            user = null;
        }
        else {
            const users = await UserModel.find({
                _id: token // eslint-disable-line
            });
            userData = users.length ? users[0] : null;
        }

        // 去无用字段(加密后的密码不能直接返回)
        if (userData) {
            user = {
                name: userData.name,
                _id: userData._id // eslint-disable-line
            };
        }

        if (needPwd) {
            user.pwd = userData.pwd;
        }

        return user;
    },

    /**
     * 获取用户列表
     *
     * @return {Object} 数据查询操作结果，Promise 对象
     */
    getUserList() {
        return UserModel.find();
    },

    /**
     * 通过用户名获取用户
     *
     * @param {string} name 用户名
     * @return {Object} 获取到的用户
     */
    getUserByName(name) {
        return UserModel.find({
            name
        });
    },

    /**
     * 通过 ID 删除用户
     *
     * @param {string} id 用户 ID
     * @return {Object} 数据删除操作结果，Promise 对象
     */
    deleteUserItem(id) {
        return UserModel.remove({
            _id: id  // eslint-disable-line
        });
    },

    /**
     * 插入一条用户数据
     *
     * @param {Object} user 用户数据
     * @return {Object} 插入后的数据，Promise 对象
     */
    async addUserItem(user) {
        // 格式校验
        let valid = true;
        let statusInfo;
        if (user.name === '') {
            valid = false;
            statusInfo = '用户名不可为空';
        }

        if (user.pwd === '') {
            valid = false;
            statusInfo = '密码不可为空';
        }
        else {
            user.pwd = utiles.md5(user.pwd);
        }

        // 重名校验
        const users = await this.getUserByName(user.name);
        if (users.length > 0) {
            valid = false;
            statusInfo = `用户名“${user.name}”已存在`;
        }

        if (!valid) {
            return Promise.reject({
                statusInfo
            });
        }

        // 对象
        const userModel = new UserModel(user);
        return userModel.save();
    },

    /**
     * 通过 ID 更新用户密码
     *
     * @param {string} id 用户 ID
     * @param {Object} form 用户表单
     * @return {Object} 数据删除操作结果，Promise 对象
     */
    async updateUserPassword(id, form) {
        // 数据校验
        let valid = true;
        let statusInfo;
        if (form.pwd === '') {
            valid = false;
            statusInfo = '密码不可为空';
        }

        const users = await UserModel.find({
            _id: id  // eslint-disable-line
        });

        if (users.length === 0) {
            valid = false;
            statusInfo = '用户未找到';
        }

        if (!valid) {
            return Promise.reject({
                statusInfo
            });
        }

        return UserModel.updateOne({
            _id: id // eslint-disable-line
        }, {
            pwd: utiles.md5(form.pwd)
        });
    },

    /**
     * 更新当前登录用户密码
     *
     * @param {Object} req 请求
     * @return {Object} 数据删除操作结果，Promise 对象
     */
    async updateCurrentUserPassword(req) {
        const form = req.body;
        // 数据校验
        let valid = true;
        let statusInfo;
        if (form.oldPwd === '') {
            valid = false;
            statusInfo = '原密码不可为空';
        }

        if (form.newPwd === '') {
            valid = false;
            statusInfo = '新密码不可为空';
        }

        const currentUser = await this.getCurrentUser(req, true);
        if (currentUser.pwd !== utiles.md5(form.oldPwd)) {
            valid = false;
            statusInfo = '原密码错误';
        }

        if (!valid) {
            return Promise.reject({
                statusInfo
            });
        }

        return UserModel.updateOne({
            _id: currentUser._id // eslint-disable-line
        }, {
            pwd: utiles.md5(form.newPwd)
        });
    }
};
