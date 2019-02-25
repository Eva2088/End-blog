const { db } = require('../Schema/connect')

// 取用户的 Schema， 为了拿到操作 users 集合的实例对象
const UserSchema = require('../Schema/user')
const User = db.model("users", UserSchema)

// 通过 db 对象创建操作 article 数据库的模型对象
const ArticleSchema = require('../Schema/article')
const Article = db.model("articles", ArticleSchema)

const CommentSchema = require('../Schema/comment')
const Comment = db.model("comments", CommentSchema)

// 返回文章发表页
exports.addPage = async (ctx) => {
    await ctx.render("add-article", {
        title: "文章发表",
        session: ctx.session
    })
}

// 文章的发表 保存到数据库
exports.add = async (ctx) => {
    if(ctx.session.isNew){
        // true: 没登录，不需要查询数据库
        return ctx.body = {
            msg: "用户没登录",
            status: 0
        }
    }

    // 用户已登录
    // 用户在登录情况下，post 发过来的数据
    const data = ctx.request.body
    // 添加文章的作者
    data.author = ctx.session.uid
    data.commentNum = 0

    await new Promise((resolve, reject) => {
        new Article(data).save((err, data) => {
            if(err){
                return reject(err)
            }
            // 更新用户文章基数
            User
                .update(
                    {_id: data.author},
                    {$inc: {articleNum: 1}},
                    err => {
                        if(err) return console.log(err)
                    }
                )
            resolve(data)
        })
    })
    .then(data => {
        ctx.body = {
            msg: "发表成功",
            status: 1
        }
    })
    .catch(err => {
        ctx.body = {
            msg: "发表失败",
            status: 0
        }
    })
}

// 获取文章列表
exports.getList = async (ctx) => {
    // 如果没有 id 则默认为第一页
    let page = ctx.params.id || 1
    page--

    const maxNum = await Article.estimatedDocumentCount((err, num) => {
        err ? console.log(err) : num
    })
    const artList = await Article
        .find()
        .sort("-created") // 按文章发表时间 降序排序
        .skip(3 * page) // 用于跳过
        .limit(3) // 取3条数据
        .populate({
            path: "author",
            select: 'username _id avatar'
        }) // 用于连表查询
        .then(data => data)
        .catch(err => console.log(err))

    // 查询每篇文章的头像
    await ctx.render("index", {
        session: ctx.session,
        title: "博客首页",
        artList,
        maxNum
    })

}

// 文章详情
exports.details = async (ctx) => {
    // 取动态路由里的 id
    const _id = ctx.params.id

    // 查找文章本身数据
    const article = await Article
        .findById(_id)
        .populate({
            path: "author",
            select: 'username'
        }) // 用于连表查询
        .then(data => data)

    // 查找跟当前文章关联的所有评论
    const comment = await Comment
        .find({article: _id})
        .sort("-created")
        .populate("from", "username avatar")
        .then(data => data)
        .catch(err => {
        console.log(err)
        })

    await ctx.render("article", {
        session: ctx.session,
        title: article.title,
        article,
        comment
    })
}

// 返回用户所有文章
exports.artList = async ctx => {
    const uid = ctx.session.uid
    const data = await Article.find({author: uid})

    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

// 删除对应 ID 的文章
exports.artDel = async ctx => {
    // const _id = ctx.params.id
    // let uid
    // let res = {}

    // // 删除文章
    // 删除文章对应的所有评论
    // 被删除评论对应的用户 commentNum - 1
}