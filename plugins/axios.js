/**
 * @file axios 配置
 * @author 小强赵
 */

import getIp from 'get-ip';
import axios from 'axios';
import message from 'element-ui/lib/message';

import config from '../server/config.js';

const options = {
    // [自定义设置]是否使用系统提供的错误处理，默认 true
    axiosSystemErrorMessage: true
};

// The server-side needs a full url to works
if (process.server) {
    const host = getIp() || '127.0.0.1';
    options.baseURL = `http://${host}:${process.env.PORT || config.port}`;
}

const $http = axios.create(options);

// 拦截响应response，并做一些错误处理
$http.interceptors.response.use(res => {
    const data = res.data;
    switch (data.status) {
        // 数据正常
        case 0:
            return data;
        // 未登录或登录过期
        case -1:
            if (!process.server && res.config.axiosSystemErrorMessage) {
                // 打开登录弹框
                window.rootVueComponent.$refs.header.dialogVisible = true;
            }
            return Promise.reject(data);
        // 未知失败
        default:
            // -2 需要管理员权限 和 其他未知编码
            if (!process.server && res.config.axiosSystemErrorMessage) {
                message({
                    type: 'error',
                    message: data.statusInfo || '请求失败，请稍后重试 /(ㄒoㄒ)/~~'
                });
            }
            return Promise.reject(data);
    }
}, err => {
    if (err.config && err.config.axiosSystemErrorMessage) {
        switch (err.response.status) {
            case 404:
                err.statusInfo = '接口未定义';
                break;
            case 500:
                err.statusInfo = '服务器内部错误';
                break;
            default:
                err.statusInfo = '服务器未知错误';
        }
        message({
            type: 'error',
            message: err.response.status + ': ' + err.statusInfo
        });
    }
    return Promise.reject(err);
});

export default $http;
