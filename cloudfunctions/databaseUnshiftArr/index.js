// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 数据库初始化
  const db = cloud.database()
  // 云开发数据库指令变量
  const _ = db.command
  // 定义数据库名和要添加的数据
  const collectionName = event.collectionName
  const doc = event.doc
  const arrName = event.arrName
  const updateDate = event.updateDate
  let data = {}
  data[arrName] = _.unshift(updateDate)

  // 将数据传输到数据库中
  return await db.collection(collectionName).doc(doc).update({
    // data 字段表示需新增的 JSON 数据
    data: data
  })
}