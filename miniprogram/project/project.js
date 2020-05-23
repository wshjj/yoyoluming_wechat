// 云数据库初始化
const db = wx.cloud.database()

// 这是一个获取时间并且返回时间的函数
const getNowTime = () => {
  let d = new Date()
  let year = d.getFullYear()
  let month = (Array(2).join(0) + (d.getMonth()+1)).slice(-2)
  let date = (Array(2).join(0) + d.getDate()).slice(-2)
  let hour = (Array(2).join(0) + d.getHours()).slice(-2)
  let minute = (Array(2).join(0) + d.getMinutes()).slice(-2)
  let second = (Array(2).join(0) + d.getSeconds()).slice(-2)
  return `${year}-${month}-${date} ${hour}:${minute}:${second}`
}

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
  let cloudPath = path + '/' + createRandomStr(15) + '.png'
  return wx.cloud.uploadFile({
    cloudPath: cloudPath,
    filePath: file,
  })
}

// 这是一个从对象数组中删除指定项的函数
// arr 是需要处理的数组
// attr 是属性名
// value 是需删除项的对应属性属性值
const rmObj_Arr = (arr, attr, value) => {
  for(let i in arr){
    if (arr[i][attr] == value) {
      arr.splice(i, 1)
      break
    }
  }
}

module.exports = {
  getNowTime,
  fun,
  getUser,
  createRandomStr,
  uploadImg,
  rmObj_Arr
}