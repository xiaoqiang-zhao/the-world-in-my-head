/**
 * @file 站点配置
 */

export default {
    // 服务端口
    port: 9090,
    // 数据库链接地址
    db: 'mongodb://127.0.0.1:27017/base_full_stack_project',
    // 管理员账号，用于初始化和权限坚定
    rootAcount: 'root',
    // 权限验证制字段
    authCookieName: 'token',
    // session 加密密钥
    sessionSecret: 'base_full_stack_project' // 务必修改
};
