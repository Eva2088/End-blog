const { db } = require('../Schema/connect')
const UserSchema = require('../Schema/user')
const encrypt = require('../util/encrypt')

// 通过 db 对象创建操作 user 数据库的模型对象
const User = db.model("users", UserSchema)

// 用户注册
exports.reg = async (ctx) => {
    // 用户注册时 post 发过来的数据
    const user = ctx.request.body
    const username = user.username
    const password = user.password
    // 去 user 数据库查询，当前发过来的 username 是否存在
    await new Promise((resolve, reject) => {
        User.find({username}, (err, data) => {
            if(err)return reject(err)
            // 数据库查询没出错？ 还有可能没有数据
            if(data.length !== 0){
                // 查询到数据 -->  用户名已经存在
                return resolve("")
            }
            // 用户名不存在  需要存到数据库
            // 保存到数据库之前需要先加密，encrypt模块是自定义加密模块
            const _user = new User({
                username,
                password: encrypt(password)
            })
            
            _user.save((err, data) => {
                if(err){
                    reject(err)
                }else{
                    resolve(data)
                }
            })
        })
    })
    .then(async data => {
        if(data){
            // 注册成功
            await ctx.render("isOk", {
                status: "注册成功"
          })
        }else{
            // 用户名已存在
            await ctx.render("isOk", {
                status: "用户名已存在"
          })
        }
    })
    .catch(async err => {
        await ctx.render('isOk', {
            status: "注册失败，请重试"
        })
    })
}

// 用户登录
exports.login = async (ctx) => {
    // 拿到 post 数据
    const user = ctx.request.body
    const username = user.username
    const password = user.password

    // 用户登录，比对密码
    await new Promise((resolve, reject) => {
        User.find({username}, (err, data) => {
            if(err)return reject(err)
            if(data.length === 0) return reject("用户名不存在")
            
            // 把用户传过来的密码，加密后和数据库的比对
            if(data[0].password === encrypt(password)){
                return resolve(data)
            }
            resolve("")
        })
    })
    .then(async data => {
        if(!data){
            return ctx.render('isOk', {
                status: "密码不正确，登录失败"
            })
        }

        // 让用户在他的 cookie 里设置 username password 加密后的密码 权限
        ctx.cookies.set("username", username, {
            domain: "localhost",
            path: "/",
            maxAge: 36e5,
            httpOnly: true, // 不让客户端访问该 cookie
            overwrite: false, // 不覆盖
        })

        // 用户在数据库的 _id 值
        ctx.cookies.set("uid", data[0]._id, {
            domain: "localhost",
            path: "/",
            maxAge: 36e5,
            httpOnly: true, // 不让客户端访问该 cookie
            overwrite: false, // 不覆盖
        })

        // ctx.session = null // 手动过期
        ctx.session = {
            username,
            uid: data[0]._id
        }

        // 登录成功
        await ctx.render('isOk', {
            status: "登录成功"
        })
    })
    .catch(async err => {
        await ctx.render('isOk', {
            status: "登录失败"
        })
    })
}

// 确定用户状态 保持用户的登录状态
exports.keepLog = async (ctx, next) => {
    // ctx.session.isNew = true 代表没登录， ctx.session.isNew = undefined 代表登录
    if(ctx.session.isNew){ // session 没有
        if(ctx.cookies.get("username")){
            ctx.session = {
                username: ctx.cookies.get("username"),
                uid: ctx.cookies.get("uid")
            }
        }
    }
    await next()
}

// 用户退出的中间件
exports.logout = async (ctx) => {
    ctx.session = null
    ctx.cookies.set("username", null, {
        maxAge: 0
    })
    ctx.cookies.set("uid", null, {
        maxAge: 0
    })
    // 在后台重定向到 根页面
    ctx.redirect("/")
}