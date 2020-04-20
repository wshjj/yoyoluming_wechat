// 云数据库初始化
const db = wx.cloud.database()

// 这是一个用于调用云函数的函数
// name 为调用的云函数名字
// data 为传递给云函数的数据
// 返回值是云函数 promise 对象
const fun = (name,data) => {
  return wx.cloud.callFunction({
    name: name,
    data: data,
  })
}

// 这是一个用于借 openid 来查询用户数据的函数
// openid 为用户的 openid
// 返回值是数据库查询到的用户数据 promise 对象
const getUser = (openid) => {
  return db.collection('user').where({
    openid: openid
  }).get()
}

// 这是一个生成一个随机字符串的函数
// len 是字符串的长度
// 返回值是生成的字符串
const createRandomStr = (len) => {
  let $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let maxPos = $chars.length
  let pwd = ''
  for (var i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

// 这是一个上传图片到云空间的程序
// path 是图片要保存的目录
// file 是图片的临时文件地址
// 返回值是图片上传 api 的 promise 的对象
const uploadImg = (path,file) => {
  let cloudPath = path + '/' + createRandomStr(10) + '.png'
  return wx.cloud.uploadFile({
    cloudPath: cloudPath,
    filePath: file,
  })
}

module.exports = {
  fun,
  getUser,
  createRandomStr,
  uploadImg
}