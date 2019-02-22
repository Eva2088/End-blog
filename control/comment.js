const { db } = require('../Schema/connect')

// 取用户的 Schema， 为了拿到操作 users 集合的实例对象
const UserSchema = require('../Schema/user')
const User = db.model("users", UserSchema)

// 通过 db 对象创建操作 article 数据库的模型对象
const ArticleSchema = require('../Schema/article')
const Article = db.model("articles", ArticleSchema)

const CommentSchema = require('../Schema/comment')
const Comment = db.model("comments", CommentSchema)

// 发表评论
exports.addComment = async ctx => {
    let message = {
        status: 0,
        msg: "登录才能发表评论"
    }

    // 验证用户是否登录
    if(ctx.session.isNew) return ctx.body = message
    
    const data = ctx.request.body

    data.from = ctx.session.uid

    const _comment = new Comment(data)

    await _comment
        .save()
        .then(data => {
            message = {
                status: 1,
                msg: "评论成功"
            }

            // 跟新当前文章的评论数量
            Article
                .update(
                    {_id: data.article}, 
                    {$inc: {commentNum: 1}},
                    err => {
                        if(err) return console.log(err)
                        // console.log("评论计数器更新成功")
                    }
                )

            // 跟新用户的评论数量
            User
                .update(
                    {_id: data.from},
                    {$inc: {commentNum: 1}},
                    err => {
                        if(err) return console.log(err)
                    }
                )
        })
        .catch(err => {
            message = {
                status: 0,
                msg: err
            }
        })

    ctx.body = message
}