/**
 * @file 权限管理中间件
 * @author 小强赵
 */

import config from '../config';
import userProxy from '../proxy/user';
import logger from '../logger';

export default {

    /**
     * 需要是管理员
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     * @param {Function} next 下一个
     */
    async adminRequired(req, res, next) {
        logger.trace(`auth adminRequired, URL:${req.originalUrl}, method:${req.method}`);
        const user = await userProxy.getCurrentUser(req);
        if (user === null) {
            res.send({
                status: -1,
                statusInfo: '用户未登录或登录已过期'
            });
            logger.trace(`auth with out sign in, URL:${req.originalUrl}, method:${req.method}`);
        }
        else if (user.name === config.rootAcount) {
            next();
            logger.trace(`auth adminRequired pass, URL:${req.originalUrl}, method:${req.method}`);
        }
        else {
            res.send({
                status: -2,
                statusInfo: '此项操作需要管理员权限'
            });
            logger.trace(`auth with out admin, URL:${req.originalUrl}, method:${req.method}`);
        }
    },

    /**
     * 需要是登录用户
     *
     * @param {Object} req 请求
     * @param {Object} res 返回
     * @param {Function} next 下一个
     */
    async userRequired(req, res, next) {
        logger.trace(`auth userRequired, URL:${req.originalUrl}, method:${req.method}`);
        const user = await userProxy.getCurrentUser(req);
        if (user === null) {
            res.send({
                status: 1,
                statusInfo: '用户未登录或登录已过期'
            });
        }
        else {
            next();
        }
    },

    /**
     * 种 session，其实是服务器端只读 token
     *
     * @param {Object} token 用户标识
     * @param {Object} res 返回头
     */
    setSession(token, res) {
        const opts = {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 30,
            signed: true,
            httpOnly: true
        };
        // cookie 有效期30天
        res.cookie(config.authCookieName, token, opts);
    },

    /**
     * 清除 session
     *
     * @param {Object} res 返回头
     */
    clearSession(res) {
        res.clearCookie(config.authCookieName, {
            path: '/'
        });
    }
};
