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

// 后台：查询用户所有评论
exports.comList = async ctx => {
    const uid = ctx.session.uid
    const data = await Comment.find({from: uid}).populate("artical", "title")

    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

// 删除对应 ID 的评论
exports.comDel = async ctx => {
    const commentId = ctx.params.id

    let articleId, uid
    let isOk = true  
    
    // 删除评论
    await Comment.findById(commentId, (err, data) => {
        if(err){
            console.log(err)
            isOk = false
            return 
        }else{
            articleId = data.article
            uid = data.from
        }
    })

    // 让文章的计数器 -1
    await Article.update({_id: articleId}, {$inc: {commentNum: -1}})

    await User.update({_id: uid}, {$inc: {commentNum: -1}})

    await Comment.deleteOne({_id: commentId})

    if(isOk){
        ctx.body = {
            state: 1,
            message: "删除成功"
        }
    }
    
}