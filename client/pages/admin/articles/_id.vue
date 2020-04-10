<template>
    <section class="container article-detail">
        <!-- 展示区 -->
        <div class="view markdown-body">
            <h1>{{title}}</h1>
            <div class="tags date">
                <span
                    v-for="item in tags"
                    v-if="item.isSelected"
                    class="item"
                    :class="{selected: item.isSelected}">
                    {{item.text}}
                </span>
                <span
                    v-if="status === 'editor'"
                    class="item selected iconfont icon-setting"
                    @click="tagDialogVisible = true">
                </span>
                <span class="date-text">{{createDate}}</span>
            </div>
            <div v-html="mdHTML"></div>
        </div>
        <!-- 中间 按钮区 -->
        <div v-if="status === 'editor'" class="middle" :class="{'editor-folded': isFoldEditor}">
            <button
                class="btn iconfont icon-save"
                @click="updateArticle">
            </button>
            <button
                v-if="!isFoldEditor"
                class="btn iconfont icon-img"
                @click="imgDialogVisible = true">
            </button>
            <button
                class="btn iconfont icon-fold-right"
                :class="{'icon-fold-left': isFoldEditor}"
                @click="isFoldEditor = !isFoldEditor">
            </button>
        </div>
        <!-- 编辑区 -->
        <div v-if="status === 'editor' && !isFoldEditor" class="editor">
            <el-input
                type="textarea"
                :autosize="{minRows: 55}"
                resize="none"
                placeholder="请输入文章内容"
                v-model="mdText">
            </el-input>
        </div>
        <el-dialog
            :visible.sync="imgDialogVisible"
            :fullscreen="true"
            title="上传图片">
            <el-upload
                class="upload-demo"
                action="/api/upload"
                :on-success="handleSuccess"
                :on-preview="handlePictureCardPreview"
                list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
        </el-dialog>
        <el-dialog
            :visible.sync="tagDialogVisible"
            title="编辑标签">
            <div class="tags">
                <span
                    v-for="item in tags"
                    class="item"
                    :class="{selected: item.isSelected}"
                    @click="item.isSelected = !item.isSelected">
                    {{item.text}}
                </span>
            </div>
        </el-dialog>
    </section>
</template>
<script>
/**
 * @file 文章详情页
 * @author 小强赵
 */
import message from 'element-ui/lib/message';
import 'element-ui/lib/theme-chalk/message.css';

import elTable from 'element-ui/lib/table';
import elTableColumn from 'element-ui/lib/table-column';
import 'element-ui/lib/theme-chalk/table.css';
import elButton from 'element-ui/lib/button';
import elForm from 'element-ui/lib/form';
import 'element-ui/lib/theme-chalk/form.css';
import elFormItem from 'element-ui/lib/form-item';
import 'element-ui/lib/theme-chalk/form-item.css';
import elInput from 'element-ui/lib/input';
import elDialog from 'element-ui/lib/dialog';
import 'element-ui/lib/theme-chalk/dialog.css';
import elUpload from 'element-ui/lib/upload';
import 'element-ui/lib/theme-chalk/upload.css';

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

export default {
    layout: 'admin',
    components: {
        elTable,
        elTableColumn,
        elButton,
        elForm,
        elFormItem,
        elInput,
        elDialog,
        elUpload
    },
    data() {
        return {
            mdHTML: '',
            mdText: '',
            title: '',
            // 文章创建时间
            createDate: '',
            tags: [],
            tagDialogVisible: false,
            // 上传图片弹窗
            imgDialogVisible: false,
            isFoldEditor: false,
            // 状态：preview: 预览状态, editor: 编辑状态
            status: ''
        };
    },
    watch: {
        mdText(newValue, oldValue) {
            this.mdToHtml();
        }
    },
    mounted() {
        axios.get(`/api/articles/${this.$route.params.id}`).then(res => {
            this.title = res.data.title;
            this.createDate = utiles.formatDate(res.data.createDate, true);
            this.mergeTags(res.data.tags);
            this.mdText = res.data.mdContent;
            this.mdToHtml();
        });

        this.isFoldEditor = !this.$route.query.isEdit;
        this.status = +this.$route.query.isEdit ? 'editor' : 'preview';
        // 参数 this.$route.query.isEdit 的值刷新后会成为 string，这里用加号强制转成 number
    },
    methods: {

        mergeTags(tags) {
            const extendTags = [];
            if (this.status === 'preview') {
                tags.forEach(element => {
                    extendTags.push({
                        text: element,
                        isSelected: true
                    });
                });
                this.tags = extendTags;
            }
            else {
                axios.get('/api/tags').then(res => {
                    this.tags = res.data.tags;
                    res.data.forEach(element => {
                        extendTags.push({
                            text: element.text,
                            isSelected: tags.indexOf(element.text) > -1
                        });
                    });
                    this.tags = extendTags;
                });
            }
        },

        /**
         * 将 markdown 转为 html
         *
         * @param {string} md markdown 内容
         */
        mdToHtml(md) {
            const me = this;
            remark()
                .use([html, midas])
                .use(highlight)
                .process(this.mdText, (err, file) => {
                    me.mdHTML = file.contents;
                    // 提取标题
                    me.mdHTML.replace(/<h1>(.+)<\/h1>/, (matchStr, $1) => {
                        this.title = $1;
                        return $1;
                    });
                });
        },

        /**
         * 更新文章内容
         */
        updateArticle() {
            const tags = [];
            this.tags.forEach(element => {
                if (element.isSelected) {
                    tags.push(element.text);
                }
            });
            axios.post(`/api/articles/${this.$route.params.id}`, {
                mdContent: this.mdText,
                tags
            }).then(res => {
                message({
                    type: 'success',
                    message: '保存成功'
                });
            });
        },

        /**
         * 上传成功后的回调函数
         *
         * @param {Object} response 返回头
         * @param {Object} file 当前图片对象
         * @param {Array} fileList 上传列表汇总
         */
        handleSuccess(response, file, fileList) {
            file.name = '/' + response.data.path;
        },

        /**
         * 点击预览的回调，这里用作生成 markdown 图片文本
         *
         * @param {Object} file 图片对象
         */
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        }
    }
};
</script>
<style lang="less">
.article-detail {
    display: flex;
    justify-content: center;
    .view,
    .editor {
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

    .editor .el-textarea > textarea {
        border: none;
        padding: 10px 13px;
    }

    .middle {
        flex: 0 0 80px;
        margin: 5px;
        text-align: center;
        .btn {
            display: inline-block;
            width: 2.5em;
            height: 2.5em;
            line-height: 2.5em;
            margin: 20px 0;
            background: none;
            border: none;
            border-radius: 50px;
            font-size: 18px;
            text-align: center;
            box-shadow: 2px 3px 5px rgba(0, 0, 0, .1), -2px -3px 5px rgba(0, 0, 0, .1);
            outline: none;
            cursor: pointer;
            transition: 300ms;
            &:hover {
                background: #409EFF;
                color: #fff;
            }
        }
        .icon-fold-left {
            transform: rotate(180deg);
        }
        &.editor-folded {
            margin-right: -80px;
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
