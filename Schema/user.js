const { Schema } = require('./connect')

const userSchema = new Schema({
    username: String,
    password: String,
    avatar: {
        type: String,
        default: "/avatar/default.jpg"
    },
    role: {
        type: String,
        default: 1
    },
    commentNum: Number,
    articleNum: Number
}, 
{
    versionKey: false
})

module.exports = userSchema