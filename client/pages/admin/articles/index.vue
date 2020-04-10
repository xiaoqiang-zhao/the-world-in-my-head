<template>
    <section class="container article-list">
        <!-- 头部按钮行 -->
        <header class="button-line">
            <el-button
                type="primary"
                icon="el-icon-circle-plus-outline"
                @click="toArticleDetail(null, 1)">
                新增文章
            </el-button>
        </header>
        <!-- 文章列表 -->
        <el-table
            :data="tableData"
            style="width: 100%">
            <el-table-column
                label="文章标题"
                prop="title">
            </el-table-column>
            <el-table-column
                label="创建时间"
                prop="createDate"
                :formatter="dateFormatter"
                width="180">
            </el-table-column>
            <el-table-column
                label="更新时间"
                prop="updateDate"
                :formatter="dateFormatter"
                width="180">
            </el-table-column>
            <el-table-column
                label="操作"
                width="150">
                <template slot-scope="scope">
                    <el-button @click="deleteArticle(scope.row)" type="text" size="small">删除</el-button>
                    <el-button @click="toArticleDetail(scope.row._id, 1)" type="text" size="small">编辑</el-button>
                    <el-button @click="toArticleDetail(scope.row._id, 0)" type="text" size="small">查看</el-button>
                </template>
            </el-table-column>
        </el-table>
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
import messageBox from 'element-ui/lib/message-box';
import 'element-ui/lib/theme-chalk/message-box.css';
import message from 'element-ui/lib/message';
import 'element-ui/lib/theme-chalk/message.css';
import loading from 'element-ui/lib/loading';
import 'element-ui/lib/theme-chalk/loading.css';

import axios from '@/../plugins/axios';
import utiles from '@/../utiles';

export default {
    layout: 'admin',
    components: {
        elTable,
        elTableColumn,
        elButton
    },
    props: {
        indexTableData: {
            'type': Array,
            'default': () => []
        }
    },
    async asyncData() {
        let tableData;
        try {
            const res = await axios.get('/api/articles');
            tableData = res.data;
        }
        catch (e) {
            tableData = [];
        }

        return {
            tableData
        };
    },
    data() {
        let tableData = [];
        if (this.indexTableData.length > 0) {
            tableData = this.indexTableData;
        }
        return {
            tableData
        };
    },
    methods: {

        /**
         * 到文章详情页
         *
         * @param {string} id 文章 ID，新建时 ID 为 null
         * @param {number} isEdit 是否可编辑，0: 不可编辑只展示，1: 可编辑包括添加新文章
         */
        toArticleDetail(id, isEdit) {
            if (id === null) {
                const load = loading.service({
                    lock: true,
                    text: '文章新建中...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });

                axios.post('/api/articles', {}).then(res => {
                    load.close();
                    this.$router.push({
                        path: `/admin/articles/${res.data._id}`,
                        query: {
                            isEdit
                        }
                    });
                });
            }
            else {
                this.$router.push({
                    path: `/admin/articles/${id}`,
                    query: {
                        isEdit
                    }
                });
            }
        },

        /**
         * 删除文章
         *
         * @param {Object} articleItem 一条文章数据
         */
        deleteArticle(articleItem) {
            messageBox.confirm('此操作将永久删除该资源, 是否继续?', '提示', {
                confirmButtonText: '继续',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => axios.delete('/api/articles/' + articleItem._id)
            ).then(res => {
                // 移除页面中的数据
                this.tableData.some((item, index) => {
                    if (item._id === articleItem._id) {
                        this.tableData.splice(index, 1);
                        return true;
                    }
                });
                message({
                    type: 'success',
                    message: '删除成功!'
                });
            });
        },

        /**
         * 格式化一条文章数据的两个时间字段：createDate、updateDate
         *
         * @param {Object} row 一条资源数据
         * @param {Object} column 单元格对象
         * @param {Object} cellValue 字段值
         *
         * @return {string} 格式化后的时间
         */
        dateFormatter(row, column, cellValue) {
            return utiles.formatDate(cellValue);
        }
    }
};
</script>
<style lang="less" scoped>
.article-list {
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
