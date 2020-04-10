/**
 * @file cookie 接力中间件，解决 SSR 丢 cookie 的问题
 * @author 小强赵
 */
import axios from '../../plugins/axios.js';

export default function (req, res, next) {
    const filter = [
        '/_nuxt',
        '/api'
    ];

    const isMatched = filter.some(item => {
        if (req.url.indexOf(item) === 0) {
            return true;
        }
    });

    // 静态资源和 API不需要设置 coolie，其实只有 asyncData 方法中调用接口前需要预置 cookie
    // (请求页为接口预置 cookie)
    // 未登录状态下设置 common cookie 会有问题
    if (!isMatched && req.headers.cookie) {
        axios.defaults.headers.common.cookie = req.headers.cookie;
    }

    next();
}
