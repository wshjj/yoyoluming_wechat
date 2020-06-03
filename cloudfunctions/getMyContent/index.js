// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 数据库初始化
  const db = cloud.database()
  // 用户的标识
  const openid = cloud.getWXContext().OPENID
  // 定义数据库名和要获取的页数
  const collectionName = event.collectionName
  const page = event.page
  const isTop = event.isTop
  if(isTop){
    return await db.collection(collectionName).where({ delte: false , setTop: isTop , openid: openid }).get()
  }
  // 一页的页数
  const limit = 20
  // 先计数数据库中一共有多少条数据
  const countResult = await db.collection(collectionName).where({ delte: false , setTop: isTop , openid: openid }).count()
  const total = countResult.total
  // 作为判断是否是最后一页的依据
  const residue = total - page*limit
  // 如果已经超出了页面范围，则返回'over'
  if((residue+limit) <= 0){
    return 'over'
  }
  // 从数据库中读取数据
  return await db.collection(collectionName).where({ delte: false , setTop: isTop , openid: openid }).skip(residue > 0 ? residue : 0).limit(residue > 0 ? limit : residue + limit).get()
}