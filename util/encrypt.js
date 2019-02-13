const crypto = require('crypto')

// 加密对象 ==> 返回加密成功的数据
module.exports = function(password, KEY = "tanzhou jiao yu"){
    const hmac = crypto.createHmac("sha256", KEY)
    hmac.update(password)
    const passwordHmac = hmac.digest("hex")
    return passwordHmac
}