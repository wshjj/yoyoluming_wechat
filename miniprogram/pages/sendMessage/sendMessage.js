// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sender: {},
    receiver: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let sender = options.sender
    let receiver = options.receiver
    // openid 放入数据库查询发件人信息
    let myInfor = project.getUser(sender)
    myInfor.then(res => {
      // openid 放入数据库查询收件人信息
      let recInfor = project.getUser(receiver)
      recInfor.then(res0 => {
        this.setData({
          sender: res.data[0],
          receiver: res0.data[0]
        })
        wx.hideLoading()
      })
    })
  },

  // 发送站内信
  sendMessage: function(e){
    if(this.data.receiver.blackName.indexOf(this.data.sender.openid) != -1){
      wx.showModal({
        title: '提示',
        content: '你已被收件方拉黑，无法发送站内信',
        showCancel: false,
        confirmText: '我知道了'
      })
    }else{
      wx.showLoading({
        title: '发送中...',
        mask: true
      })
      let content = e.detail.value.content
      // 将这条消息存入收件人的 message 列表
      let unshiftArr = project.fun('databaseUnshiftArr', {
        collectionName: 'user',
        doc: this.data.receiver._id,
        arrName: 'message',
        updateDate: {
          id: project.createRandomStr(18),
          sender: this.data.sender.openid,
          receiver: this.data.receiver.openid,
          senderName: this.data.sender.name,
          message: content,
          time: project.getNowTime(),
          isOffical: false,
          isRead: false
        }
      })
      unshiftArr.then(res => {
        let update = project.fun('databaseUpdate',{
          collectionName: 'user',
          doc: this.data.receiver._id,
          data: {unread: true}
        })
        update.then(res0 => {
          wx.showToast({
            title: '发送成功！',
            success: function () {
              wx.navigateBack({})
            }
          })
        })
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