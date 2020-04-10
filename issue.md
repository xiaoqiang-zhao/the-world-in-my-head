# 服务器端渲染时丢 cookie

## 问题描述

我用 Nuxt 和 express 搭配实现服务端渲染, 在 .vue 文件中代码如下:

```js
async asyncData(req) {
    const res = await axios.get('/api/users', null, {
         withCredentials: true
    });
}
```
在浏览器中直接访问是能拿到数据的，地址像这样：http://172.24.140.50:9090/api/users, 但是正和岛页面中用服务端渲染就不行了，我这个接口需要一个登录后的 token，也就是一个服务端只读 cookie，我这这样排查的：

```js
async asyncData(req) {
    console.log('index.vue signedCookies:', req.req.signedCookies[config.authCookieName]);
   // 这里可以拿到正确的 signedCookies
    const res = await axios.get('/api/users', null, {
         withCredentials: true
    });
}
```
但是在 nodejs 服务端就不行了，“/api/users” 对应的 nodejs 代码是这样的:

```js
getUserList(req, res) {
     console.log('api-user token: ', req.signedCookies);
    // it lost signedCookies
}
```

express 的 router 这样设置的:

```js
router.get('/api/users', user.getUserList);
```

怎么解决呢，有思路吗？

It trabbled me, hoe can i get the signedCookies in nodejs server side?

https://cmty.app/nuxt/nuxt.js/issues/c7585

## 问题定位

浏览器会自动维护 cookie，但在 node 里，在前一个请求执行成功的回调函数里再发一个请求，这时请求头不会被自动带到下一个，这其中也包括 cookie，也就是说 node 不帮你自动维护 cookie，你需要自己来。

## 问题解决

在业务代码里直接使用 axios 提供的 API 可以做这个事情，先获取再赋值：
```js
async asyncData({req}) {
    if (process.server) {
        axios.defaults.headers.common.cookie = req.headers.cookie;
    }

    let tableData;
    try {
        const res = await axios.get('/api/users');
        tableData = res.data;
    }
    catch (e) {
        tableData = [];
    }

    return {
        tableData
    };
},
```

还有一种框架记得解决方案，添加 Express 中间件，页面请求为接口请求预置 cookie：

```js
// server/middlewares/ssr-cookie.js
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
    // (页面请求为接口请求预置 cookie)
    // 未登录状态下设置 common cookie 会有问题
    if (!isMatched && req.headers.cookie) {
        axios.defaults.headers.common.cookie = req.headers.cookie;
    }

    next();
}
```

在 Express 入口处添加中间件就可以了，不用再每个业务代码里写重复代码。

```js
import express from 'express';
const app = express();
app.use(ssrCookie);
```

## 参考

https://github.com/nuxt-community/express-template/issues/100

https://stackoverflow.com/questions/19936705/how-to-maintain-a-request-session-in-nodejs

https://www.npmjs.com/package/node-axios-cookiejar

转发 cookie 是最简单的做法，而 cookie jar 的本质也是在服务端维护 cookie，但它会使用 cookie 那些属性，如 domain、path、expires 等。比如如果用 request 模块在 node.js 里发送请求，只要设置 let request = request.defaults({jar: true}); 后面的请求 cookie 就在同一个空间下读取了。后续无论用什么语言，只要涉及到在服务端发送多个请求，需要维护请求之间的 cookie，记住 cookiejar 这个名词，一定能搜到解决方案。有些情况 cookie 可能 1 分钟就失效，有些情况存在不同 path 同名 cookie，这时候得按标准来。
大部分情况不会遇到就是了。除非写针对非常变态网站的爬虫 ── 不过这种场景个人倾向于跑一个 Headless Chrome 这样完整的浏览器去处理。

-- 屈光宇

https://github.com/salesforce/tough-cookie/blob/b897b49223327d2d6a23750c2a4b5343f4c4c7d3/lib/cookie.js
