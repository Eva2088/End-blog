const { Schema } = require('./connect')

const userSchema = new Schema({
    username: String,
    password: String,
    avatar: {
        type: String,
        default: "/avatar/default.jpg"
    }
}, {versionKey: false})

module.exports = userSchema