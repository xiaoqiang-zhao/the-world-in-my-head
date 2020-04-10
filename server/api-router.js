/**
 * @file  API路由配置文件
 * @author 小强赵
 */

import {Router} from 'express';
import article from './api/article';
import tag from './api/tag';
import user from './api/user';
import upload from './api/upload';
import logger from './logger';
import auth from './middlewares/auth';

const router = new Router();
// API 接口调用日志
router.all('/*', (req, res, next) => {
    logger.trace(`API request, URL:${req.originalUrl}, method:${req.method}, body:${JSON.stringify(req.body)}`);
    next();
});

// 用户相关部分
router.get('/users', auth.adminRequired, user.getUserList);
router.get('/users/current', user.getCurrentUser);
router.delete('/users/:id', auth.adminRequired, user.deleteUserItem);
// root 用户修改密码
router.post('/users/root-user/change-pwd/:id', auth.adminRequired, user.updateUserPassword);
// 当前登录用户修改密码
router.post('/users/current-user/change-pwd', auth.userRequired, user.updateCurrentUserPassword);
router.post('/users', auth.adminRequired, user.addUserItem);
router.post('/users/signin', user.signin);
router.post('/users/signout', user.signout);
// 系统初始化完成后注释掉此方法
// router.get('/init-root-user', user.initRootUser);

// 文章相关部分
router.get('/articles', article.getArticleList);
router.get('/articles/:id', article.getArticleById);
router.post('/articles', auth.userRequired, article.addArticleItem);
router.post('/articles/:id', auth.userRequired, article.updateArticleItem);
router.delete('/articles/:id', auth.userRequired, article.deleteArticleItem);

// tag 相关部分
router.get('/tags', tag.getTagList);
router.get('/tags/:id', tag.getTagById);
router.post('/tags', auth.adminRequired, tag.addTagItem);
router.post('/tags/:id', auth.adminRequired, tag.updateTagItem);
router.delete('/tags/:id', auth.adminRequired, tag.deleteTagItem);

// 独立接口
router.post('/upload', upload);

export default router;
