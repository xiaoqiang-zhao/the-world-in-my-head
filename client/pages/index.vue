<template>
    <section class="container article-list">
        <!-- 文章列表 -->
        <article
            class="article-item"
            v-for="item in articleList"
            @click="toArticleDetail(item)">
            <header>{{item.title}}</header>
            <section class="description">
                {{item.description}}
            </section>
            <footer class="tags date">
                <span
                    v-for="tag in item.tags"
                    class="item selected">
                    {{tag}}
                </span>
                <span class="date-text">{{dateFormatter(item.createDate)}}</span>
            </footer>
        </article>
        <div v-if="articleList.length === 0" class="empty-data">暂无数据</div>
    </section>
</template>
<script>
/**
 * @file 文章列表页
 * @author 小强赵
 */
import elTable from 'element-ui/lib/table';
import elTableColumn from 'element-ui/lib/table-column';
import 'element-ui/lib/theme-chalk/table.css';
import elButton from 'element-ui/lib/button';

import axios from '@/../plugins/axios';
import utiles from '@/../utiles';

export default {
    layout: 'blog',
    components: {
        elTable,
        elTableColumn,
        elButton
    },
    async asyncData() {
        let articleList;
        try {
            const res = await axios.get('/api/articles', {
                axiosSystemErrorMessage: false
            });
            articleList = res.data;
        }
        catch (e) {
            articleList = [];
        }

        return {
            articleList
        };
    },
    data() {
        return {
            articleList: []
        };
    },
    methods: {

        /**
         * 到文章详情页
         *
         * @param {Object} articleData 文章数据
         */
        toArticleDetail(articleData) {
            let path;
            if (articleData.isSuperArticle) {
                path = articleData.path;
            }
            else {
                path = `/articles/${articleData._id}`;
            }

            this.$router.push({
                path
            });
        },

        /**
         * 格式化时间字段
         *
         * @param {string} date 时间字段值
         *
         * @return {string} 格式化后的时间
         */
        dateFormatter(date) {
            return utiles.formatDate(date, true);
        }
    }
};
</script>
<style lang="less" scoped>
.article-list {
    max-width: 800px;
    margin: 0 auto;
    .article-item {
        margin: 1em 0;
        padding: 1em;
        border: 1px solid #d8d5d5;
        box-shadow: 2px 3px 5px rgba(0, 0, 0, .1), -2px -3px 5px rgba(0, 0, 0, .1);
        cursor: pointer;
        > header {
            margin-bottom: 16px;
            font-size: 20px;
            font-weight: 600;
            line-height: 1.25;
        }
        > .description {
            color: #888;
        }
        .tags {
            margin-top: 1em;
            // padding-bottom: 6px;
            font-size: 13px;
            .item {
                display: inline-block;
                padding: 0 6px;
                margin: 0 6px 0 0;
                background: #f1f1f1;
                color: #a4a4a4;
                height: 22px;
                line-height: 22px;
                font-weight: normal;
                cursor: pointer;
                // &.selected {
                //     color: #017E66;
                //     background-color: rgba(1, 126, 102, 0.08);
                // }
            }
            .date-text {
                float: right;
                color: #909399;
            }
        }
    }
    .button-line {
        text-align: right;
        padding: 5px 0;
    }
    .el-form,
    .dialog-footer {
        padding-right: 17px;
    }
}
</style>
