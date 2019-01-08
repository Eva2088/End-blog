const Router = require('koa-router')
const router = new Router

// 设计主页
router.get("/", async (ctx) => {
    // 需要 title、 artical
    await ctx.render("index", {
        // session: {
        //     role: 66
        // },
        title: "假装这是一个title"
    })
})
// 动态路由，主要用来处理用户的 登录 注册
// router.get("/user/:id", async (ctx) => {
//     ctx.body = ctx.params.id
// })
router.get(/^\/user\/(?=reg|login)/, async (ctx) => {
    // show = true 显示注册， show = false 显示登录
    const show = /reg$/.test(ctx.path)
    await ctx.render("register", {
        show: show
    })
})


module.exports = router