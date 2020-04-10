/**
 * @file “文章”代理层
 * @author 小强赵
 */

import models from '../models';
import userProxy from './user';

import unified from 'unified';
import markdown from 'remark-parse';

const ArticleModel = models.ArticleModel;
// 新建文章默认内容
const articleDefaultMdContent = `# 标题

> 描述

## 二级标题

段落内容

## 参考
`;

export default {

    /**
     * 插入一篇文章数据
     *
     * @param {Object} req 请求对象
     * @return {Object} 插入后的数据，Promise 对象
     */
    async addArticleItem(req) {
        // 当前用户为作者
        const auth = await userProxy.getCurrentUser(req);

        // 新文章默认内容
        const articleObj = this.mdToObject(articleDefaultMdContent);
        const article = {
            authId: auth._id,
            ...articleObj
        };

        // 对象
        const articleModel = new ArticleModel(article);
        return articleModel.save();
    },

    /**
     * 通过 ID 删除文章
     *
     * @param {string} id 用户 ID
     * @return {Object} 数据删除操作结果，Promise 对象
     */
    deleteArticleItem(id) {
        return ArticleModel.remove({
            _id: id // eslint-disable-line
        });
    },

    /**
     * 更新篇文章数据
     *
     * @param {string} id 文章id
     * @param {Object} article 文章数据
     * @return {Object} 插入后的数据，Promise 对象
     */
    async updateArticleItem(id, article) {
        const articleObj = this.mdToObject(article.mdContent);

        // 格式校验
        let valid = true;
        let statusInfo;
        if (articleObj.title === '') {
            valid = false;
            statusInfo = '标题不可为空';
        }

        if (articleObj.description === '') {
            valid = false;
            statusInfo = '描述不可为空';
        }

        articleObj.tags = article.tags || [];

        if (!valid) {
            return Promise.reject({
                statusInfo
            });
        }

        // 对象
        return ArticleModel.updateOne({
            _id: id // eslint-disable-line
        }, articleObj);
    },

    /**
     * 将 markdown 文本转换成简单对象(只有我们关心的标题、概述、markdown 内容，没有全部解析)
     *
     * @param {string} mdContent markdown 文本
     * @return {Object} 文章简单对象
     */
    mdToObject(mdContent) {
        const tree = unified()
            .use(markdown)
            .parse(mdContent);

        // 标题
        let title;
        const firstChild = tree.children.length > 0 ? tree.children[0] : null;
        if (firstChild
            && firstChild.type === 'heading'
            && firstChild.depth === 1
            && firstChild.children.length > 0
        ) {
            title = firstChild.children[0].value;
        }

        // 描述
        let description;
        const secondChild = tree.children.length > 1 ? tree.children[1] : null;
        if (secondChild
            && secondChild.type === 'blockquote'
            && secondChild.children.length > 0
        ) {
            // 取第一段
            description = secondChild.children[0].children[0].value;
        }

        const article = {
            title,
            description,
            mdContent
        };

        return article;
    },

    /**
     * 获取文章列表
     *
     * @return {Object} 数据查询操作结果，Promise 对象
     */
    getArticleList() {
        return ArticleModel.find().sort({
            // 倒序
            createDate: -1
        });
    },

    /**
     * 通过 ID 获取某篇文章
     *
     * @param {string} id 文章id
     * @return {Object} 查询结果，Promise 对象
     */
    async getArticleById(id) {
        let article;
        const articles = await ArticleModel.find({
            '_id': id // eslint-disable-line
        });

        article = articles.length ? articles[0] : null;

        return article;
    }
};
