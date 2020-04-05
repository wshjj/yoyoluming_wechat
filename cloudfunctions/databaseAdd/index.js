// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 数据库初始化
  const db = cloud.database()
  // 定义数据库名和要添加的数据
  const collectionName = event.collectionName
  const data = JSON.parse(event.data)
  // 将数据传输到数据库中
  return await db.collection(collectionName).add({
    // data 字段表示需新增的 JSON 数据
    data: data
  })
}