// 这是一个用于调用云函数的函数
// name 为调用的云函数名字
// data 为传递给云函数的数据
const fun = (name,data) => {
  return wx.cloud.callFunction({
    name: name,
    data: data,
  })
}

module.exports = {
  fun: fun
}