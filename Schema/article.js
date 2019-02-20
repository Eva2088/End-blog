const { Schema } = require('./connect')

const ArticleSchema = new Schema({
    title: String,
    content: String,
    author: String,
    tips: String
}, {
    versionKey: false,
    // 创建时间
    timestamps: {
        createdAt: "created" 
    }
})

module.exports = ArticleSchema