const Router = require('koa-router')
// 拿到操作 user 表的逻辑对象
const user = require('../control/user')
const article = require('../control/article')
const comment = require('../control/comment')
const admin = require('../control/admin')
const upload = require('../util/upload')

const router = new Router

// 设计主页
router.get("/", user.keepLog, article.getList)

/* 
    对用户的动作  /user
    登录  /user/login
    注册  /user/reg
    退出  /user/lagout
*/
// 动态路由，主要用来返回用户的 登录 注册页面
// router.get("/user/:id", async (ctx) => {
//     ctx.body = ctx.params.id
// })
router.get(/^\/user\/(?=reg|login)/, async (ctx) => {
    // show = true 显示注册， show = false 显示登录
    const show = /reg$/.test(ctx.path)
    // await ctx.render("register", {
    //     show: show
    // })
    await ctx.render("register", {show})
})

// // 处理用户点击submit按钮 登录的 post
// router.post("/user/login", async (ctx) => {  
//     const data = ctx.request.body
// })

// 用户注册 路由
router.post("/user/reg", user.reg)

// 用户登录 路由
router.post("/user/login", user.login)

// 用户退出 路由
router.get("/user/logout", user.logout)

// 文章的发表 路由
router.get("/article", user.keepLog, article.addPage)

// 文章添加 路由
router.post("/article", user.keepLog, article.add)

// 文章列表分页
router.get("/page/:id", article.getList)

// 文章详情页
router.get("/article/:id", user.keepLog, article.details)

// 发表评论
router.post("/comment", user.keepLog, comment.addComment)

// 后台管理：文章、评论、头像上传
router.get("/admin/:id", user.keepLog, admin.index)

// 头像上传
router.post("/upload", user.keepLog, upload.single('file'), user.upload)

// 获取用户的所有评论
router.get("/user/comments", user.keepLog, comment.comList)

// 删除评论
router.del("/comment/:id", user.keepLog, comment.comDel)

// 获取用户的所有评论
router.get("/user/articles", user.keepLog, article.artList)

// 删除评论
router.del("/article/:id", user.keepLog, article.artDel)



// 404
router.get("*", async ctx => {
    await ctx.render("404", {
        title: "404"
    })
})

module.exports = router