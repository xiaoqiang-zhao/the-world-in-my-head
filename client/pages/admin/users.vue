<template>
    <section class="container user-list">
        <!-- 头部按钮行 -->
        <header class="button-line">
            <el-button
                type="primary"
                icon="el-icon-circle-plus-outline"
                @click="addUserDialogVisible = true">
                新增用户
            </el-button>
        </header>
        <!-- 用户列表 -->
        <el-table
            :data="tableData"
            style="width: 100%">
            <el-table-column
                label="用户姓名"
                prop="name"
                width="180">
            </el-table-column>
            <el-table-column
                label="创建时间"
                prop="createDate"
                :formatter="dateFormatter">
            </el-table-column>
            <el-table-column
                label="更新时间"
                prop="updateDate"
                :formatter="dateFormatter">
            </el-table-column>
            <el-table-column
                label="操作"
                width="125">
                <template slot-scope="scope">
                    <el-button @click="deleteUser(scope.row)" type="text" size="small">删除</el-button>
                    <el-button @click="changePassword(scope.row)" type="text" size="small">修改密码</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 添加用户的弹框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addUserDialogVisible"
            width="500px"
            autocomplete="off">
            <el-form ref="form" :model="form" :rules="formRules" label-width="95px">
                <el-form-item label="用户名:" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="密码:" prop="pwd">
                    <el-input v-model="form.pwd" type="password"></el-input>
                </el-form-item>
            </el-form>
            <section slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addUser">
                    添 加
                </el-button>
            </section>
        </el-dialog>
        <!-- 修改用户密码弹框 -->
        <el-dialog
            title="修改用户密码"
            :visible.sync="changePasswordDialogVisible"
            width="500px">
            <el-form
                ref="changePasswordForm"
                :model="changePasswordForm"
                :rules="changePasswordFormRules"
                label-width="95px"
                autocomplete="off">
                <el-form-item label="用户名:">
                    <el-input v-model="changePasswordForm.name" disabled></el-input>
                </el-form-item>
                <el-form-item label="密码:" prop="pwd">
                    <el-input v-model="changePasswordForm.pwd" type="password"></el-input>
                </el-form-item>
            </el-form>
            <section slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitChangePassword">
                    修 改
                </el-button>
            </section>
        </el-dialog>
    </section>
</template>
<script>
/**
 * @file 用户列表页
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
import elDialog from 'element-ui/lib/dialog';
import 'element-ui/lib/theme-chalk/dialog.css';
import elForm from 'element-ui/lib/form';
import 'element-ui/lib/theme-chalk/form.css';
import elFormItem from 'element-ui/lib/form-item';
import 'element-ui/lib/theme-chalk/form-item.css';
import elInput from 'element-ui/lib/input';

import axios from '@/../plugins/axios';
import utiles from '@/../utiles';

export default {
    layout: 'admin',
    components: {
        elTable,
        elTableColumn,
        elButton,
        elDialog,
        elForm,
        elFormItem,
        elInput
    },
    async asyncData() {
        let tableData;
        try {
            const res = await axios.get('/api/users');
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
            addUserDialogVisible: false,
            changePasswordDialogVisible: false,
            form: {
                name: '',
                pwd: ''
            },
            formRules: {
                name: [
                    {
                        required: true,
                        message: '必填项',
                        trigger: 'blur'
                    }
                ],
                pwd: [
                    {
                        required: true,
                        message: '必填项',
                        trigger: 'blur'
                    }
                ]
            },
            changePasswordForm: {
                id: '',
                name: '',
                pwd: ''
            },
            changePasswordFormRules: {
                pwd: [
                    {
                        required: true,
                        message: '必填项',
                        trigger: 'blur'
                    }
                ]
            }
        };
    },
    methods: {

        /**
         * 删除用户
         *
         * @param {Object} userItem 一条用户数据
         */
        deleteUser(userItem) {
            messageBox.confirm('此操作将永久删除该资源, 是否继续?', '提示', {
                confirmButtonText: '继续',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => axios.delete('/api/users/' + userItem._id)
            ).then(res => {
                // 移除页面中的数据
                this.tableData.some((item, index) => {
                    if (item._id === userItem._id) {
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
         * 添加一条用户数据
         */
        addUser() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.requestAddUser(this.form);
                }
            });
        },

        /**
         * 发起添加用户请求
         *
         * @param {Object} form 表单
         */
        requestAddUser(form) {
            axios.post('/api/users', form).then(res => {
                this.addUserDialogVisible = false;
                message({
                    type: 'success',
                    message: '添加成功'
                });
                this.tableData.push(res.data);
                this.form.name = '';
                this.form.pwd = '';
            });
        },

        /**
         * 更新用户密码
         *
         * @param {Object} userItem 一条用户数据
         */
        changePassword(userItem) {
            this.changePasswordDialogVisible = true;
            this.changePasswordForm.id = userItem._id;
            this.changePasswordForm.name = userItem.name;
        },

        /**
         * 提交密码修改
         */
        submitChangePassword() {
            this.$refs.changePasswordForm.validate(valid => {
                // 检验不通过
                if (!valid) {
                    return false;
                }

                axios.post(`/users/root-user/change-pwd/${this.changePasswordForm.id}`, {
                    pwd: this.changePasswordForm.pwd
                }).then(res => {
                    this.changePasswordDialogVisible = false;
                    message({
                        type: 'success',
                        message: '添加成功'
                    });
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
.user-list {
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
