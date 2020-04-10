<template>
    <div class="page-root">
        <app-header ref="header"></app-header>
        <section class="loading" v-if="type === 0">
            权限信息加载中...
        </section>
        <nuxt v-if="type === 1" to="/articles"></nuxt>
        <section class="no-right" v-if="type === 2">
            <div class="iconfont icon-no-right">
                暂未登录
            </div>
        </section>
        <app-footer></app-footer>
    </div>
</template>

<script>
/**
 * @file 管理端页面布局
 * @author 小强赵
 */
import axios from '@/../plugins/axios.js';
import appHeader from '../components/app-header.vue';
import appFooter from '../components/app-footer.vue';
import 'element-ui/lib/theme-chalk/message.css';

export default {
    components: {
        appHeader,
        appFooter
    },
    data() {
        return {
            // 0: loading
            // 1: 加载完成
            // 2: no-right 无权限
            type: 0
        };
    },
    mounted() {
        axios.get('/api/users/current', {
            // 去除统一提示
            axiosSystemErrorMessage: false
        }).then(res => {
            const currentUser = res.data;
            if (currentUser) {
                this.$refs.header.setCurrentUser(currentUser);
                this.type = 1;
            }
            else {
                this.type = 2;
            }
        });
    }
};
</script>

<style lang="less">
.page-root {
    position: relative;
    min-height: 100vh;
}
.container {
    padding: 5px 5px 20px 5px;
}
.loading,
.no-right {
    text-align: center;
    padding: 50px 0;
    color: #555;
}
.icon-no-right:before {
    display: block;
    margin: 0 auto;
    font-size: 100px;
    margin-bottom: 10px;
}
</style>
