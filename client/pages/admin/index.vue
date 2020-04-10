<template>
    <articles :index-table-data="tableData"></articles>
</template>
<script>
/**
 * @file 首页引导
 * @author 小强赵
 */

import articles from './articles';
import axios from '@/../plugins/axios';

export default {
    layout: 'admin',
    components: {
        articles
    },
    // 组件并不会服务器端渲染，需要从父页面传过去
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
    }
};
</script>
