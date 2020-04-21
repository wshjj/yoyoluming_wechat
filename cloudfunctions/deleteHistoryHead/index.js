// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 数据库初始化
  const db = cloud.database()
  // 云开发数据库指令变量
  const _ = db.command
  // 定义需要操作的用户 id
  const doc = event.doc
  const fileid = event.fileid
  if (fileid.substring(0,5) == 'cloud'){
    await cloud.deleteFile({
      fileList: [fileid],
    })
    // 更新数据库中数据
    return await db.collection('user').doc(doc).update({
      // data 字段表示需新增的 JSON 数据
      data: {
        avatarHistory: _.pop()
      }
    })
  }else{
    // 更新数据库中数据
    return await db.collection('user').doc(doc).update({
      // data 字段表示需新增的 JSON 数据
      data: {
        avatarHistory: _.pop()
      }
    })
  }
}