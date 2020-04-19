// 云数据库初始化
const db = wx.cloud.database()

// 这是一个用于调用云函数的函数
// name 为调用的云函数名字
// data 为传递给云函数的数据
const fun = (name,data) => {
  return wx.cloud.callFunction({
    name: name,
    data: data,
  })
}

// 这是一个用于借 openid 来查询用户数据的函数
// openid 为用户的 openid
const getUser = (openid) => {
  return db.collection('user').where({
    openid: openid
  }).get()
}

module.exports = {
  fun,
  getUser
}