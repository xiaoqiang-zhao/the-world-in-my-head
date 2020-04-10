<template>
    <section class="container tag-detail">
        <el-form ref="form" :model="form" :rules="formRules" label-width="95px">
            <el-form-item label="标签:" prop="text">
                <el-input v-model="form.text"></el-input>
            </el-form-item>
            <el-form-item label="描述:" prop="description">
                <el-input
                    type="textarea"
                    :autosize="{minRows: 3}"
                    v-model="form.description">
                </el-input>
            </el-form-item>
        </el-form>
        <section class="btns-container">
            <el-button @click="back">
                返回
            </el-button>
            <el-button v-if="status === 'editor'" type="primary" @click="submitTag">
                提交
            </el-button>
        </section>
    </section>
</template>
<script>
/**
 * @file tag 详情页
 * @author 小强赵
 */
import message from 'element-ui/lib/message';
import 'element-ui/lib/theme-chalk/message.css';

import elButton from 'element-ui/lib/button';
import elForm from 'element-ui/lib/form';
import 'element-ui/lib/theme-chalk/form.css';
import elFormItem from 'element-ui/lib/form-item';
import 'element-ui/lib/theme-chalk/form-item.css';
import elInput from 'element-ui/lib/input';

import axios from '@/../plugins/axios';

export default {
    layout: 'admin',
    components: {
        elButton,
        elForm,
        elFormItem,
        elInput
    },
    data() {
        return {
            form: {
                text: '',
                description: ''
            },
            // 状态：preview: 预览状态, editor: 编辑状态
            status: '',
            formRules: {
                text: [
                    {
                        required: true,
                        message: '必填项',
                        trigger: 'blur'
                    }
                ]
            }
        };
    },
    mounted() {
        if (this.$route.params.id !== '0') {
            axios.get(`/api/tags/${this.$route.params.id}`).then(res => {
                this.form.text = res.data.text;
                this.form.description = res.data.description;
            });
        }

        this.isFoldEditor = !this.$route.query.isEdit;
        this.status = this.$route.query.isEdit ? 'editor' : 'preview';
    },
    methods: {

        /**
         * 提交 tag
         */
        submitTag() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    let url = '/api/tags';
                    if (this.$route.params.id !== '0') {
                        url += '/' + this.$route.params.id;
                    }

                    axios.post(url, this.form).then(res => {
                        message({
                            type: 'success',
                            message: '保存成功'
                        });
                        this.back();
                    });
                }
            });
        },

        // 返回列表页
        back() {
            this.$router.push({
                path: '/admin/tags'
            });
        }
    }
};
</script>
<style lang="less">
.tag-detail {
    max-width: 800px;
    padding-top: 50px;
    margin: 0 auto;
    .btns-container {
        text-align: center;
    }
}
</style>
