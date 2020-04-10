<template>
    <section class="container">
        <el-upload
            accept="*/*"
            action="/api/upload"
            class="upload-zip"
            drag
            ref="uploadComp"
            :multiple="true">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>

        <div>-------- 照片墙 --------</div>
        <el-upload
            action="/api/upload"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>

        <div>--------- 图片列表缩略图 ----------</div>
        <el-upload
            class="upload-demo"
            action="/api/upload"
            :on-success="handleSuccess"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
    </section>
</template>
<script>
import elUpload from 'element-ui/lib/upload';
import 'element-ui/lib/theme-chalk/upload.css';
import elDialog from 'element-ui/lib/dialog';
import 'element-ui/lib/theme-chalk/dialog.css';
import elButton from 'element-ui/lib/button';

export default {
    components: {
        elUpload,
        elDialog,
        elButton
    },
    data() {
        return {
            dialogImageUrl: '',
            dialogVisible: false
        };
    },
    methods: {
        handleSuccess(response, file, fileList) {
            // debugger
            file.name = response.data.path;
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        }
    }
};
</script>
<style scoped>
.title
{
    margin: 50px 0;
}
</style>
