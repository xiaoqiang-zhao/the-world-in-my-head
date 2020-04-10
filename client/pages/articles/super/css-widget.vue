<template>
    <section class="container article-detail">
        <!-- 展示区 -->
        <div class="view markdown-body">
            <h1>{{title}}</h1>
            <div class="tags date">
                <span
                    v-for="item in tags"
                    class="item selected">
                    {{item}}
                </span>
                <span class="date-text">{{createDate}}</span>
            </div>
            <div id="md-container" v-html="mdHTML"></div>
        </div>
        <!-- 内容导航区 -->
        <div class="title-tree" :class="{ 'open': isOpenHeaders, 'close': !isOpenHeaders}">
            <header>
                <span class="text">文章目录</span>
                <button class="icon-catalogue" v-on:click="isOpenHeaders = true;">
                    <i></i>
                </button>
                <button class="icon-close" v-on:click="isOpenHeaders = false;"></button>
            </header>
            <ul>
                <li v-for="item in titleTree">
                    <a :href="'#' + item.text">{{item.text}}</a>
                    <ul v-if="item.children && item.children.length > 0">
                        <li v-for="item in item.children">
                            <a :href="'#' + item.text">{{item.text}}</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </section>
</template>
<script>
/**
 * @file 文章详情页
 * @author 小强赵
 */

// markdown 部分
import remark from 'remark';
import midas from 'remark-midas';
import html from 'remark-html';
import highlight from 'remark-highlight.js';
// 样式
import 'highlight.js/styles/solarized-light.css';
import 'github-markdown-css/github-markdown.css';

import axios from '@/../plugins/axios';
import utiles from '@/../utiles';
import addIdForHeading from '@/plugins/remark-add-id-for-heading';

export default {
    layout: 'blog',
    data() {
        return {
            mdHTML: '',
            mdText: '',
            title: '',
            // 文章创建时间
            createDate: '',
            tags: [],
            titleTree: [],
            isOpenHeaders: true
        };
    },
    mounted() {
        axios.get(`/api/articles/5bfa52b0fdb7882d3efcacac`).then(res => {
            this.title = res.data.title;
            this.createDate = utiles.formatDate(res.data.createDate, true);
            this.mdText = res.data.mdContent;
            this.tags = res.data.tags;
            this.mdToHtml();
        });

        let isPhone = false;
        if (window.screen.width < 800) {
            isPhone = true;
        }
        // 手机上关闭，PC 上打开
        this.isOpenHeaders = !isPhone;
    },
    methods: {

        /**
         * 将 markdown 转为 html
         *
         * @param {string} md markdown 内容
         */
        mdToHtml(md) {
            const me = this;
            remark()
                .use([html, midas])
                .use(addIdForHeading)
                .use(highlight)
                .use(() => treeRoot => this.pickUpTitleTree(treeRoot))
                .process(this.mdText, (err, file) => {
                    me.mdHTML = file.contents;
                    this.$nextTick(() => {
                        this.appendDemoDom();
                    });
                });
        },

        /**
         * 提取标题树
         *
         * @param {Object} treeRoot md 文档树根节点
         */
        pickUpTitleTree(treeRoot) {
            const titleTree = [];
            treeRoot.children.forEach(item => {
                if (item.type === 'heading' && item.depth > 1) {
                    // console.log(item.children[0].value);
                    if (item.depth === 2) {
                        titleTree.push({
                            text: item.children[0].value
                        });
                    }
                    else if (item.depth === 3) {
                        const last = titleTree[titleTree.length - 1];
                        last.children = last.children ? last.children : [];
                        last.children.push({
                            text: item.children[0].value
                        });
                    }
                }
            });
            this.titleTree = titleTree;
        },

        /**
         * 填充示例 Dom 节点
         * 以下一个标题作为参考点，添加示例样式
         */
        appendDemoDom() {
            // 单行文字截断 Demo
            this.factory(
                '多行文字超出截断【移动】',
                `<div class="ellipsis ellipsis-demo">
                    200px 的宽度，超出显示省略号，后面是占位文字：aaaaaaaaaaaaaa
                </div>`
            );

            // 行文字超出截断【移动】
            this.factory(
                '多行文字超出截断【PC】',
                `<div class="line-clamp line-clamp-demo">
                    200px 的宽度，2 行文字后超出显示省略号，后面是占位文字：aaaaaaaaaaaaaa
                </div>`
            );

            // 行文字超出截断【PC】
            this.factory(
                '独立样式',
                `<div class="wrap wrap-demo">
                    <div class="text">
                        200px 的宽度，展示文字较少的情况
                    </div>
                </div>`
            );
            this.factory(
                '独立样式',
                `<div class="wrap wrap-demo">
                    <div class="text">
                        200px 的宽度，2 行文字后超出显示省略号，后面是占位文字：aaaaaaaaaaaaaa
                    </div>
                </div>`
            );

            // 大图小字
            this.factory(
                '小图大字',
                `<div class="img-text-container img-text-container-demo">
                    <img src="/logo.png">
                    图片配文字
                </div>`
            );
            this.factory(
                '小图大字',
                `<div class="img-text-container img-text-container-demo iconfont icon-setting">
                    iconfont 配文字
                </div>`
            );

            // 小图大字
            this.factory(
                '文字间隔',
                `<div class="icon-text-container icon-text-container-demo">
                    <img src="/logo.png">
                    x图片配文字
                </div>`
            );
            this.factory(
                '文字间隔',
                `<div class="icon-text-container icon-text-container-demo iconfont icon-setting">
                    x图标配文字
                </div>`
            );
            this.factory(
                '文字间隔',
                `<div class="icon-text-container icon-text-container-demo2">
                    <img src="/logo.png">
                    x图片配文字
                </div>`
            );

            this.factory(
                '文字间隔',
                `<div class="icon-text-container icon-text-container-demo2 iconfont icon-setting">
                    x图标配文字
                </div>`
            );

            // 文字间隔
            this.factory(
                '数据为空&暂无权限',
                `<div class="space-item-demo">
                    <span class="space-item">
                        第一段文字</span><span class="space-item">
                        第二段文字</span><span class="space-item">
                        第三段文字
                    </span>
                </div>`
            );

            this.factory(
                '数据为空&暂无权限',
                `<div class="space-item-demo2">
                    <span class="space-item">
                        第一段文字</span><span class="space-item">
                        第二段文字</span><span class="space-item">
                        第三段文字
                    </span>
                </div>`
            );

            this.factory(
                '加载中',
                `<div class="no-right iconfont icon-no-right no-right-demo">
                    暂无权限
                </div>`
            );

            this.factory(
                '加载中',
                `<div class="data-empty iconfont icon-empty data-empty-demo">
                    暂无数据
                </div>`
            );

            this.factory(
                '布局',
                '<div class="loading loading-demo"></div>'
            );
        },

        factory(id, html) {
            const demoContainer = document.createElement('div');
            demoContainer.className = 'demo-container';
            demoContainer.innerHTML = html;
            const referenceElement = document.getElementById(id);
            document.getElementById('md-container').insertBefore(demoContainer, referenceElement);
        }
    }
};
</script>
<style lang="less">
.article-detail {
    display: flex;
    justify-content: center;
    .view {
        flex: 1;
        margin: 5px;
        box-shadow: 2px 3px 5px rgba(0, 0, 0, .1), -2px -3px 5px rgba(0, 0, 0, .1);
        transition: 'width' 300ms;
        max-width: 800px;
        overflow: auto;
    }

    // markdown 样式部分自定义
    .markdown-body {
        padding: 10px 20px;
        h1 {
            border-bottom: none;
            text-align: center;
        }
        // 隐藏原有 title，手动添加 title，再在 title 下写入 tag
        > div > h1 {
            display: none;
        }
        blockquote {
            background: #F6F6F6;
            padding: 10px;
        }
    }

    .title-tree {
        ul {
            padding: 0 6px 0 20px;
        }
        ul li {
            list-style: none;
            position: relative;
        }
        ul li a {
            padding: 5px 0;
        }
        ul li:before {
            content: "\200B";
            display: inline-block;
            box-sizing: border-box;
            height: 4px;
            width: 4px;
            overflow: hidden;
            position: absolute;
            left: -9px;
            top: 11px;
            border: 2px solid #5a5a5a;
            border-radius: 2px;
            vertical-align: middle;
        }
        ul ul li:before {
            border: 1px solid #ccc;
        }
        a {
            display: inline-block;
            width: 100%;
            overflow: hidden;
            /* 不折行 */
            text-overflow: ellipsis;
            white-space: nowrap; /* 强制不换行 */
            color: #2479cc;
            text-decoration: none;
            cursor: pointer;
        }
        ul ul {
            margin-top: 0;
            margin-bottom: 0;
        }
        .icon-catalogue {
            position: absolute;
            display: none; /* 宽屏隐藏 */
            box-sizing: border-box;
            width: 38px;
            height: 38px;
            border: none;
            padding: 5px 6px;
            border-radius: 20px;
            cursor: pointer;
        }
        .icon-close {
            position: absolute;
            right: 0;
            display: none;
            border: none;
            background: none;
        }
        &.open {
            flex: 0 0 260px;
            margin: 5px 0 0 10px;
            max-width: 260px;
            min-width: 120px;
            max-height: 97vh;
            overflow: auto;
            box-sizing: border-box;
            border: 1px solid #e2e2e2;
            font-size: 14px;
            line-height: 1em;
            transition: border-radius .5s;
            > ul {
                max-width: 260px;
                min-width: 120px;
                margin-bottom: 5px;
            }
            > header {
                position: relative;
                padding-top: 0;
                display: block;
                box-sizing: border-box;
                padding-bottom: 3px;
                border-bottom: 1px solid #e2e2e2;
                margin: 6px;
                font-weight: 700;
                background: #fff;
                line-height: 1.5em;
            }
        }
        &.close {
            margin-top: 5px;
            box-shadow: 2px 3px 5px rgba(0, 0, 0, .1), -2px -3px 5px rgba(0, 0, 0, .1);
            > ul {
                display: none;
            }
            .text {
                display: none;
            }
        }
    }
    /* 文章列表图标 */
    .icon-catalogue {
        display: inline-block;
    }
    .icon-catalogue i,
    .icon-catalogue i:before,
    .icon-catalogue i:after {
        position: relative;
        box-sizing: border-box;
        display: block;
        height: 2px;
        width: 20px;
        border-left: 2px solid #006a00;
        border-right: 15px solid #006a00;
        margin: 13px 2px;
    }
    .icon-catalogue i:before,
    .icon-catalogue i:after {
        position: absolute;
        margin: 0;
        content: "\200B";
        left: -2px;
    }
    .icon-catalogue i:before {
        top: -6px;
    }
    .icon-catalogue i:after {
        bottom: -6px;
    }
    /* 关闭按钮图标，当前只有这里用到，
    如果有第二处使用，需要提到公共文件中( icon 文件夹下是个不错的选择)
    */
    .icon-close {
        position: relative;
        box-sizing: border-box;
        display: inline-block;
        height: 18px;
        width: 18px;
        cursor: pointer;
    }
    .icon-close:before,
    .icon-close:after {
        position: absolute;
        width: 100%;
        height: 2px;
        top: 50%;
        left: 0;
        background: #006a00;
        content: "\200B";
    }
    .icon-close:before {
        transform: rotate(45deg);
    }
    .icon-close:after {
        transform: rotate(-45deg);
    }
    // 小于800时文章目录显示为图标
    @media screen and (max-width: 800px) {
        .title-tree {
            position: absolute;
            right: 0;
        }
        .title-tree {
            width: 40px;
            height: 40px;
            min-width: 40px; // 不加会出现侧 U 型边框
            border-radius: 20px;
            overflow: hidden;
        }
        .title-tree.open {
            // 消除 pc 端最小高宽的限制，因为关闭状态下内容会窄
            height: auto;
            width: auto;
            min-width: auto;
            background: #fff;
            border-radius: 0;
        }
        .title-tree .icon-catalogue {
            display: inline-block;
            background: #fff;
        }
        .title-tree.open .icon-catalogue {
            display: none;
        }
        .title-tree.open .icon-close {
            display: inline-block;
        }
    }

    .tags {
        padding-bottom: 6px;
        font-size: 13px;
        .item {
            display: inline-block;
            padding: 0 6px;
            margin: 0 6px 6px 0;
            background: #b1b3b3;
            color: #1e1e1e;
            height: 22px;
            line-height: 22px;
            font-weight: normal;
            cursor: pointer;
            &.selected {
                color: #017E66;
                background-color: rgba(1,126,102,0.08);
            }
        }
        .date-text {
            float: right;
            color: #909399;
        }
    }
}
.demo-container {
    // CSS widget 实现代码
    // 清除浮动
    .c-f,
    .clear-float {
        zoom: 1; /* 兼容IE7及以下 */
    }
    .c-f:after,
    .clear-float:after {
        content: "\200B";
        display: block;
        height: 0;
        clear: both;
    }

    // 单行截断
    .ellipsis,
    .text-overflow-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // 多行截断：方案一(移动版)
    .line-clamp {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        -webkit-line-clamp: 2;
    }
    // 多行截断：方案一(PC版)
    .wrap {
        // box-sizing: content-box;
        height: 40px;
        line-height: 20px;
        overflow: hidden;
    }
    .wrap .text {
        float: right;
        margin-left: -5px;
        width: 100%;
        word-break: break-all;
    }
    .wrap::before {
        float: left;
        width: 5px;
        content: '';
        height: 100%;
    }
    .wrap::after {
        float: right;
        content: "...";
        height: 20px;
        line-height: 20px;
        /* 为三个省略号的宽度 */
        width: 3em;
        /* 使盒子不占位置 */
        margin-left: -3em;
        /* 移动省略号位置 */
        position: relative;
        left: 100%;
        top: -20px;
        padding-right: 5px;
        // background: #2479cc;
        background: linear-gradient(to right, rgba(255,255,255,.1) 10%, #fff, #fff);
        text-align: right;
    }

    // 大图小字
    .img-text-container {
        font-size: 16px;
        line-height: 40px;
    }
    .img-text-container img,
    .img-text-container::before {
        margin-right: 5px;
        font-size: 40px;
        height: 40px;
        vertical-align: top;
    }

    // 小图大字
    .icon-text-container {
        font-size: 16px;
        line-height: 1em;
    }
    .icon-text-container img {
        display: inline-block;
        height: 14px;
        margin-right: 5px;
        // 高度的一半
        margin-bottom: -7px;
        vertical-align: 32%;
    }
    .icon-text-container::before {
        display: inline-block;
        font-family: "iconfont";
        font-size: 14px;
        color: #555;
        vertical-align: top;
    }

    // 文字间隔
    .space-item {
        display: inline-block;
        line-height: 1em;
    }
    .space-item:nth-of-type(n + 2)::before {
        content: "\200B";
        display: inline-block;
        height: .15em;
        width: 1px;
        border-bottom: .7em solid #f00;
        margin: 0 .5em;
    }

    // 暂无数据，暂无权限
    .no-right,
    .data-empty {
        text-align: center;
        padding: 50px 0;
        color: #555;
    }
    .icon-no-right:before,
    .icon-empty:before {
        display: block;
        margin: 0 auto;
        font-size: 48px;
        margin-bottom: 10px;
    }

    // 加载中
    .loading {
        width: 40px;
        height: 40px;
        position: relative;
        margin: 100px auto;
    }
    .loading::before,
    .loading::after {
        content: '';
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #333;
        opacity: .6;
        position: absolute;
        top: 0;
        left: 0;
        animation: sk-bounce 2.0s infinite ease-in-out;
    }
    .loading::after {
        animation-delay: -1.0s;
    }

    @-webkit-keyframes sk-bounce {
        0%,
        100% {
            -webkit-transform: scale(0.0);
        }
        50% {
            -webkit-transform: scale(1.0);
        }
    }

    @keyframes sk-bounce {
        0%,
        100% { 
            transform: scale(0.0);
            -webkit-transform: scale(0.0);
        }
        50% { 
            transform: scale(1.0);
            -webkit-transform: scale(1.0);
        }
    }

    // 示例代码
    .ellipsis-demo,
    .line-clamp-demo,
    .icon-text-container-demo,
    .icon-text-container-demo2 {
        width: 200px;
        border: 1px solid #999;
    }
    .img-text-container-demo,
    .wrap-demo {
        width: 200px;
        height: 40px;
        outline: 1px solid #999;
    }
    .icon-text-container-demo {
        font-size: 28px;
    }
    .icon-text-container-demo2 {
        font-size: 28px;
        padding: 14px 0;
    }
    .space-item-demo {
        outline: 1px solid #999;
        font-size: 14px;
    }
    .space-item-demo2 {
        outline: 1px solid #999;
        font-size: 28px;
    }
}
</style>
