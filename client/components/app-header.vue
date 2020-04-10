<template>
    <header class="app-header">
        <!-- logo 部分 -->
        <img src="@/assets/img/logo.png"
             class="logo"
             alt="logo"
             width="50"
             height="50">
        <span class="title">基础全栈项目</span>

        <!-- 导航部分 -->
        <el-menu
            v-if="currentUser"
            class="menu"
            :router="true"
            :default-active="activeIndex"
            mode="horizontal">
            <el-menu-item index="/admin/articles">文章管理</el-menu-item>
            <el-menu-item v-if="isRoot" index="/admin/tags">标签管理</el-menu-item>
            <!-- <el-menu-item index="/articles">统计分析</el-menu-item> -->
            <el-menu-item v-if="isRoot" index="/admin/users">用户管理</el-menu-item>
        </el-menu>
        <ul v-else class="menu"></ul>

        <!-- 用户部分 -->
        <div v-if="currentUser" class="user">
            <el-dropdown trigger="click" @command="handleCommand">
                <span class="el-dropdown-link">
                    {{currentUser.name}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="changePwd">修改密码</el-dropdown-item>
                    <el-dropdown-item command="signout" divided>退出</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <span v-else class="btn-signin" @click="siginDialogVisible = true">登录</span>

        <!-- 登录弹框 -->
        <el-dialog
            custom-class="signin-dialog"
            title="登录"
            :visible.sync="siginDialogVisible"
            :append-to-body="true"
            width="500px">
            <el-form ref="form" :model="form" :rules="formRules" label-width="95px">
                <el-form-item label="用户名:" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="密码:" prop="name">
                    <el-input type="password" v-model="form.pwd" @keyup.enter="signin"></el-input>
                </el-form-item>
            </el-form>
            <section slot="footer" class="dialog-footer">
                <el-button type="primary" @click="signin">
                    登 录
                </el-button>
            </section>
        </el-dialog>

        <!-- 修改当前用户密码弹框 -->
        <el-dialog
            title="修改用户密码"
            :visible.sync="changePasswordDialogVisible"
            :append-to-body="true"
            width="500px">
            <el-form
                ref="changePasswordForm"
                :model="changePasswordForm"
                :rules="changePasswordFormRules"
                label-width="95px"
                autocomplete="off">
                <!-- <el-form-item label="用户名:">
                    <el-input v-model="currentUser || currentUser.name" disabled></el-input>
                </el-form-item> -->
                <el-form-item label="原密码:" prop="oldPwd">
                    <el-input v-model="changePasswordForm.oldPwd" type="password"></el-input>
                </el-form-item>
                <el-form-item label="新密码:" prop="newPwd">
                    <el-input v-model="changePasswordForm.newPwd" type="password"></el-input>
                </el-form-item>
            </el-form>
            <section slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitChangePassword">
                    修 改
                </el-button>
            </section>
        </el-dialog>
    </header>
</template>
<script>
/**
 * @file 整个应用的头部
 * @author 小强赵
 */

import elMenu from 'element-ui/lib/menu';
import elMenuItem from 'element-ui/lib/menu-item';
import elButton from 'element-ui/lib/button';

import elDialog from 'element-ui/lib/dialog';
import 'element-ui/lib/theme-chalk/dialog.css';

import elForm from 'element-ui/lib/form';
import 'element-ui/lib/theme-chalk/form.css';
import elFormItem from 'element-ui/lib/form-item';
import 'element-ui/lib/theme-chalk/form-item.css';
import elInput from 'element-ui/lib/input';
import 'element-ui/lib/theme-chalk/input.css';

import elDropdown from 'element-ui/lib/dropdown';
import 'element-ui/lib/theme-chalk/dropdown.css';
import elDropdownMenu from 'element-ui/lib/dropdown-menu';
import 'element-ui/lib/theme-chalk/dropdown-menu.css';
import elDropdownItem from 'element-ui/lib/dropdown-item';
import 'element-ui/lib/theme-chalk/dropdown-item.css';

import message from 'element-ui/lib/message';
import 'element-ui/lib/theme-chalk/message.css';

import axios from '@/../plugins/axios.js';

export default {
    components: {
        elMenu,
        elMenuItem,
        elButton,
        elDialog,
        elForm,
        elFormItem,
        elInput,
        elDropdown,
        elDropdownMenu,
        elDropdownItem
    },
    data() {
        return {
            isRoot: false,
            activeIndex: '/admin/articles',
            siginDialogVisible: false,
            form: {
                name: '',
                pwd: ''
            },
            formRules: {
                name: [{
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }],
                pwd: [{
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }]
            },
            currentUser: null,
            changePasswordDialogVisible: false,
            changePasswordForm: {
                id: '',
                oldPwd: '',
                newPwd: ''
            },
            changePasswordFormRules: {
                oldPwd: [
                    {
                        required: true,
                        message: '必填项',
                        trigger: 'blur'
                    }
                ],
                newPwd: [
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
         * 处理刷新时 menu 选中某个 item
         */
        setActiveIndex() {
            const map = [
                {
                    names: ['admin-users'],
                    path: '/admin/users'
                },
                {
                    names: ['admin-tags', 'admin-tags-id'],
                    path: '/admin/tags'
                },
                // 首页(路由为 / )的页面名称是 index
                {
                    names: ['admin-articles', 'admin-articles-id', 'admin'],
                    path: '/admin/articles'
                }
            ];
            map.some(item => {
                if (item.names.indexOf(this.$route.name) > -1) {
                    this.activeIndex = item.path;
                    return true;
                }
            });
        },

        /**
         * 登录
         */
        async signin() {
            const res = await axios.post('/api/users/signin', this.form);
            // 登录成功
            if (res.data) {
                this.siginDialogVisible = false;
                this.setCurrentUser(res.data);
                window.location.reload();
            }
            // 登录失败
            else {
                message({
                    type: 'error',
                    message: res.statusInfo
                });
            }
        },

        /**
         * 设置当前用户，由 admin 模板调用
         *
         * @param {Object} currentUser 当前用户
         */
        setCurrentUser(currentUser) {
            this.currentUser = currentUser;
            // 已登录 (未登录为 null)
            if (currentUser) {
                this.changePasswordForm.id = currentUser._id;
                if (currentUser.name === 'root') {
                    this.isRoot = true;
                }
            }

            this.setActiveIndex();
        },

        /**
         * 用户相关操作
         *
         * @param {string} command 指令：退出登录或修改密码
         */
        handleCommand(command) {
            // 退出
            if (command === 'signout') {
                axios.post('/api/users/signout').then(() => {
                    this.setCurrentUser(null);
                    window.location.reload();
                });
            }
            // 修改密码
            else {
                this.changePasswordDialogVisible = true;
            }
        },

        /**
         * 提交修改密码
         */
        submitChangePassword() {
            this.$refs.changePasswordForm.validate(valid => {
                // 检验不通过
                if (!valid) {
                    return false;
                }

                axios.post('/api/users/current-user/change-pwd', {
                    oldPwd: this.changePasswordForm.oldPwd,
                    newPwd: this.changePasswordForm.newPwd
                }).then(res => {
                    this.changePasswordDialogVisible = false;
                    message({
                        type: 'success',
                        message: '添加成功'
                    });
                });
            });
        }
    }
};
</script>
<style lang="less" scoped>
.app-header {
    display: flex;
    position: relative;
    z-index: 2;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 2px 3px 5px rgba(0, 0, 0, .1);
    padding: 0 20px;
    line-height: 60px;
    .logo {
        flex: 0 0 50px;
        vertical-align: top;
        height: 50px;
        margin: 5px 0;
    }
    .title {
        flex: 0 0 150px;
        display: inline-block;
        padding-left: 10px;
        font-size: 20px;
        vertical-align: top;
        color: #4a4a4a;
    }
    .menu {
        flex: 1;
        display: inline-block;
        border: none;
        text-align: center;
    }
    .btn-signin,
    .user {
        flex: 0 0 50px;
        font-size: 14px;
        color: #6b6a6a;
    }
    .btn-signin {
        cursor: pointer;
    }
    .user {
        padding-top: 24px;
        line-height: 16px;
    }
    .el-dropdown-menu {
        background: #fff;
    }

}
</style>
