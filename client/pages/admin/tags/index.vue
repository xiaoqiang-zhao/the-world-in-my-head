<template>
    <section class="container tag-list">
        <!-- 头部按钮行 -->
        <header class="button-line">
            <el-button
                type="primary"
                icon="el-icon-circle-plus-outline"
                @click="toTagDetail(null, 1)">
                新增Tag
            </el-button>
        </header>
        <!-- 标签列表 -->
        <el-table
            :data="tableData"
            style="width: 100%">
            <el-table-column
                label="标签名称"
                prop="text">
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
                    <el-button @click="deleteTag(scope.row)" type="text" size="small">删除</el-button>
                    <el-button @click="toTagDetail(scope.row._id, 1)" type="text" size="small">编辑</el-button>
                    <el-button @click="toTagDetail(scope.row._id, 0)" type="text" size="small">查看</el-button>
                </template>
            </el-table-column>
        </el-table>
    </section>
</template>
<script>
/**
 * @file 标签列表页
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

import axios from '@/../plugins/axios';
import utiles from '@/../utiles';

export default {
    layout: 'admin',
    components: {
        elTable,
        elTableColumn,
        elButton
    },
    async asyncData() {
        let tableData;
        try {
            const res = await axios.get('/api/tags');
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
        return {
            tableData: []
        };
    },
    methods: {

        /**
         * 到标签详情页
         *
         * @param {string} id 标签 ID，新建时 ID 为 null
         * @param {number} isEdit 是否可编辑，0: 不可编辑只展示，1: 可编辑包括添加新标签
         */
        toTagDetail(id, isEdit) {
            if (id === null) {
                id = 0;
            }
            this.$router.push({
                path: `/admin/tags/${id}`,
                query: {
                    isEdit
                }
            });
        },

        /**
         * 删除标签
         *
         * @param {Object} tagItem 一条标签数据
         */
        deleteTag(tagItem) {
            messageBox.confirm('此操作将永久删除该资源, 是否继续?', '提示', {
                confirmButtonText: '继续',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => axios.delete('/api/tags/' + tagItem._id)
            ).then(res => {
                // 移除页面中的数据
                this.tableData.some((item, index) => {
                    if (item._id === tagItem._id) {
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
         * 格式化一条资源数据的两个时间字段：createDate、updateDate
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
.tag-list {
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
