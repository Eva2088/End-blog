const { Schema } = require('./connect')

const userSchema = new Schema({
    username: String,
    password: String
}, {versionKey: false})

module.exports = userSchema