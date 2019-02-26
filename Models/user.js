const { db } = require('../Schema/connect')

// 取用户的 Schema， 为了拿到操作 users 集合的实例对象
const UserSchema = require('../Schema/user')
const User = db.model("users", UserSchema)

module.exports = User