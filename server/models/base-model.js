/**
 * @file 数据对象定义基础类
 * @author 小强赵
 */

export default function (schema) {

    // 新建时，创建时间和更新时间相同
    schema.pre('save', function (next) {
        const date = new Date().getTime().toString();
        this.createDate = date;
        this.updateDate = date;
        next();
    });

    // 更新时，更新 updateDate 字段
    schema.pre('updateOne', function (next) {
        const date = new Date().getTime().toString();
        this.updateOne({}, {
            $set: {
                updateDate: date
            }
        });
        next();
    });
}
