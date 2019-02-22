const Koa = require('koa')
const static = require('koa-static')
const views = require('koa-views')
const router = require('./routers/router')
// const logger = require('koa-logger')
const body = require('koa-body')
const { join } = require('path')
const session = require('koa-session')

// 生成 Koa 实例
const app = new Koa

app.keys = ['some secret hurr']

// session 的配置对象
const CONFIG = {
    key: "Sid",
    maxAge: 36e5, /** 过期时间 */
    overwrite: true, /** 是否覆盖 (default true) */
    httpOnly: true, /** 是否能让客户端访问 (default true) */
    signed: true, /** 是否签名 (default true) */
    rolling: true, /** 是否每操作一次就刷新延长一次过期时间 (default is false) */
}
// 注册日志模块
// app.use(logger())

// 注册 session
app.use(session(CONFIG, app))

// 配置 koa-body 处理 post 请求数据
app.use(body())

// 配置静态文件资源目录
app.use(static(join(__dirname, "public")))

// 配置视图模板
app.use(views(join(__dirname, "views"), {
    extension: "pug"
}))

// 注册路由信息
app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000, () => {
    console.log("项目启动成功，监听在3000端口")
})

// 创建管理员用户 如果管理员用户已经存在 则返回
{
    // admin  admin
    const { db } = require('./Schema/connect')
    const UserSchema = require('./Schema/user')
    const encrypt = require('./util/encrypt')
    const User = db.model("users", UserSchema)
  
    User
        .find({username: "admin"})
        .then(data => {
            if(data.length === 0){
                // 管理员不存在  创建
                new User({
                    username: "admin",
                    password: encrypt("admin"),
                    role: 666,
                    commentNum: 0,
                    articleNum: 0
                })
                .save()
                .then(data => {
                    console.log("管理员用户名 -> admin,  密码 -> admin")
                })
                .catch(err => {
                    console.log("管理员账号检查失败")
                })
            }else{
                // 在控制台输出
                console.log(`管理员用户名 -> admin,  密码 -> admin`)
            }
    })
}