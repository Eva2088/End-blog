const Router = require('koa-router')
// 拿到操作 user 表的逻辑对象
const user = require('../control/user')

const router = new Router

// 设计主页
router.get("/", user.keepLogin, async (ctx) => {
    // 需要 title、 artical
    await ctx.render("index", {
        // session: {
        //     role: 66
        // },
        title: "假装这是一个title"
    })
})

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

module.exports = router