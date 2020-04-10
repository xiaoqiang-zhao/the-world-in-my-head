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
            <div v-html="mdHTML"></div>
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
        axios.get(`/api/articles/${this.$route.params.id}`).then(res => {
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
</style>
