# 我的思想世界

> 信息爆炸的时代，每天都有很多信息输入，为了自己的脑袋不被炸成碎片，写一个项目，帮助记录和整理读过的书看过的电影，以及知乎抖音得到等平台的信息。这是一个多维笔记项目，市面上的笔记还不能满足我的需求，这里有 3D 立体展示，这里有脑图，这里有故事线，还有像推理电影中整理线索的白板图。它简直就是我项上这颗肉丸子的外挂。

## 项目初始化

> 服务端 NodeJs + Express + Mongo + Log4j，浏览器端 Vue + axios + ElementUI，还有 Nuxt 方案来做 SSR，提供用户管理权限管理内容管理等通用功能。

*不保证 Windows 系统的兼容性*

1. 安装 `Node.js[必须]` 和 `MongoDB[必须]`
2. `npm install` 安装依赖包
3. `npm run db` 启动数据库服务
4. `npm run dev` 启动开发环境
5. visit `http://localhost:9090`
6. done!

MongoDB 附注：
- 在根目录下新建 data/db: `sudo mkdir -p /data/db`；
- MongoDB 下载地址: https://www.mongodb.com/download-center/community
- 然后把 MongoDB 的包放到 /usr/local 下，当前项目用的是 mongodb-macos-x86_64-4.2.5 这一版；
- 启动 MongoDB: sudo /usr/local/mongodb-macos-x86_64-4.2.5/bin/mongod；
- 新建数据库，数据库名 base_full_stack_project；
- 数据库配置在 mongod.conf 文件中。
- 数据导出: mongoexport -d base_full_stack_project -c articles tags users -o outpath --type json

```shell
cd /usr/local/mongodb-macos-x86_64-4.2.5/bin
./mongoexport -d base_full_stack_project -c articles -o ~/data-export/articles.json --type json
./mongoexport -d base_full_stack_project -c tags -o ~/data-export/tags.json --type json
./mongoexport -d base_full_stack_project -c users -o ~/data-export/users.json --type json
```

导入数据: 

```shell
./mongoimport -d base_full_stack_project -c articles --file /Users/zhaoxiaoqiang/Desktop/articles.json --type json
./mongoimport -d base_full_stack_project -c users --file /Users/zhaoxiaoqiang/Desktop/users.json --type json
./mongoimport -d base_full_stack_project -c tags --file /Users/zhaoxiaoqiang/Desktop/tags.json --type json
```

## 部署

```shell
# 构建
npm run build
# 启动服务和进程守护
npm run pm2
```

## server 端架构

* router - 负责对外提供 API 的定义，整合下面的 api 和 middleware 层；

* api - 定义 API，过滤无效数据，在一定程度上这就是一份文档；

* middleware - 中间件，主要是权限校验；

* proxy - 代理层，负责校验(重点是数据的有效性)，组合不同的 model 向上层输出，同时为以后数据存储方式的变更留下扩展点；

* models - 数据实体的定义，和数据库的交互也在此定义。

权限的校验规则在 router 中配置，包括登录权限和操作权限；校验规则在 middleware 中定义。

## client 端架构

* components 中存放公共组件；
* layouts 中存放模板，当前项目包括管理端和博客端，在页面中配置属于哪一端；
* pages 中存放页面，pages/admin 下是管理端页面，其他的是博客端页面；
* 页面使用哪种模板需要在页面文件中配置。

```js
// pages 中配置模板的方法
export default {
    layout: 'blog'
}
```

## 细节

### api 通用码

status: 0, 数据处理成功返回；

status: -1, 需要登录后才能访问接口；

status: -2, 需要管理员权限才能访问接口。

### base-model

数据有一些通用的操作写进了 server/modules/base-model，当前包括新建时间和更新时间：

```js
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
```

### assets 和 static

在 `*.vue` 组件中，所有模板和 CSS 都会被 `vue-html-loader` 及 `css-loader` 解析，并查找资源URL。例如，在 `<img src="./logo.png">`
和 `background: url(./logo.png)` 中，"./logo.png" 是相对的资源路径，将由Webpack解析为模块依赖。

因为 `logo.png` 不是 JavaScript，当被视为模块依赖时，需要使用 `url-loader` 和 `file-loader`
处理它。vue-cli 的 webpack 脚手架已经配置了这些 loader，因此可以使用相对/模块路径。

由于这些资源可能在构建过程中被内联/复制/重命名，所以它们基本上是源代码的一部分。这就是为什么建议将
Webpack 处理的静态资源放在 /src 目录中和其它源文件放一起的原因。事实上，甚至不必把它们全部放在 /src/assets：可以用模块/组件的组织方式来使用它们。例如，可以在每个放置组件的目录中存放静态资源。

相比之下，`static/` 目录下的文件并不会被 Webpack 处理：它们会直接被复制到最终目录（默认是dist/static）下。必须使用绝对路径引用这些文件，这是通过在 `config.js` 文件中的 `build.assetsPublicPath` 和 `build.assetsSubDirectory` 连接来确定的。

### API 系统级错误处理

在 axios 的插件中做了全局错误处理，这样就不需要在业务中每个 API 请求中再做错误处理了。但是有场景下你可能不想用全局的错误处理，想要自己根据业务定制一些错误处理方案，这时你需要传一个配置进去，代码如下：

```js
axios.post('/api/users', form, {
    // 是否使用系统提供的错误处理，默认 true
    axiosSystemErrorMessage: false
});
```

文件： plugins/axios

### SSR cookie

浏览器会自动维护 cookie，但在 node 里，在前一个请求执行成功的回调函数里再发一个请求，这时请求头不会被自动带到下一个，这其中也包括 cookie，也就是说 node 不帮你自动维护 cookie，你需要自己来。于是有了 server/midlewares/ssr-cookie.js 中间件。

## API

**API 采用 RESTful 形式设计**

接口 API：

> URL: /api/users
> 
> Method: GET
> 
> 说明: 获取用户列表

入参：无

返回结果:

```json
{
"status": 0,
"statusInfo": "",
"data": [{
    "_id": "5b325144959843cf5420577b",
    "name": "张三",
    "createDate": "1530773195050",
    "updateDate": "1530773195050"
    }]
}`
```

> URL: /api/users/:id
> 
> Method: DELETE
> 
>  说明: 删除某个用户

入参：无

返回结果:

```json
{
    "status": 0,
    "statusInfo": "",
    "data": {
        "n":1,
        "ok":1
    }
}
```

> URL: /api/users
> 
> Method: POST
> 
>  说明: 添加个用户

入参：

```json
{
    "name": "赵六"
}
```

返回结果:

```json
{
    "status": 0,
    "statusInfo": "",
    "data": {
        "_id": "5b5e75113732983b990aafe9",
        "name": "赵六",
        "createDate": "1532917009489",
        "updateDate": "1532917009489"
    }
}
```

> URL: /api/upload
> 
> Method: POST
> 
> 说明: 上传文件，通过表单的形式提交文件流
> 
> 演示地址: http://127.0.0.1:9090/upload

入参: 文件表单

返回结果:

```json
{
    "status": 0,
    "statusInfo": "上传成功",
    "data": {}
}
```

更多 API 请参考 server/api-router。
