// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myInfo: {
      message:[]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    // 通过 login 云函数获取 openid
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      // openid 放入数据库查询对应用户信息
      let myInfo = project.getUser(res.result.openid)
      myInfo.then(res0 => {
        // console.log(res0.data)
        // 将个人数据库中的未读标记置为 false
        let update = project.fun('databaseUpdate', {
          collectionName: 'user',
          doc: res0.data[0]._id,
          data: {
            unread: false
          }
        })
        this.setData({
          myInfo: res0.data[0],
        })
        wx.hideLoading()
      })
    })
  },

  // 点击消息读消息
  readMessage: function(e){
    let item = e.currentTarget.dataset.item
    let that = this
    wx.showModal({
      title: '消息内容',
      content: item.message,
      showCancel: false,
      success: function(){
        if(!item.isRead){
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          let myInfo = project.getUser(that.data.myInfo.openid)
          myInfo.then(res => {
            let nowInfo = res.data[0]
            let nowMessage = res.data[0].message
            for(let i in nowMessage){
              if (nowMessage[i].id == item.id) {
                nowMessage[i].isRead = true
                break
              }
            }
            // 将个人数据库 message 数组中的该项已读标记置为 true
            let update = project.fun('databaseUpdate', {
              collectionName: 'user',
              doc: res.data[0]._id,
              data: {
                message: nowMessage
              }
            })
            update.then(res0 => {
              nowInfo.message = nowMessage
              that.setData({
                myInfo: nowInfo
              })
              wx.hideLoading()
            })
          })
        }
      }
    })
  },

  // 查看用户个人卡片
  watchUser: function (e) {
    if (e.currentTarget.dataset.offical){
      wx.showToast({
        title: '这是官方消息。',
        icon: 'none'
      })
    }else{
      wx.navigateTo({
        url: '../userCard/userCard?openid=' + e.currentTarget.dataset.openid + '&myOpenid=' + this.data.myInfo.openid + '&myDoc=' + this.data.myInfo._id
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})