// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag_uploadSecret: false,
    isHiddenGender: false,
    myopenid: '',
    authorGender: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      // openid 放入数据库查询对应用户信息
      let myInfor = project.getUser(res.result.openid)
      myInfor.then(res0 => {
        // console.log(res0.data)
        this.setData({
          myopenid: res.result.openid,
          authorGender: res0.data[0].gender,
        })
        wx.hideLoading()
      })
    })
  },

  // 点击开关，改变状态
  bindSwitch: function(e){
    // console.log(e.detail.value)
    this.setData({
      isHiddenGender: e.detail.value
    })
  },

  // 发表秘密
  sendSecret: function(e){
    let content =  e.detail.value.content
    let that = this
    // 如果文字内容为空，则不能上传
    if(content == ""){
      wx.showModal({
        title: '提示',
        content: '秘密呢？别不说话呀！',
        showCancel: false,
        confirmText: '我知道了',
      })
      return false
    }
    // 防多触
    if(that.data.flag_uploadSecret){return false}
    that.setData({
      flag_uploadSecret: true
    })
    wx.showLoading({
      title: '检测中...',
      mask: true
    })
    let verify = project.fun('checkText',{
      content: content
    })
    verify.then(res => {
      console.log(res.result)
      if(res.result.errCode == 87014){
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '你发表的内容包含敏感信息！',
          showCancel: false,
          confirmText: '我知道了',
          success: function(){
            that.setData({
              flag_uploadSecret: false
            })
          }
        })
      }else if(res.result.errCode == 0){
        wx.hideLoading()
        // 发布者信息
        let openid = this.data.myopenid
        let gender
        if(this.data.isHiddenGender) gender = 0
        else gender = this.data.authorGender
        wx.showLoading({
          title: '发送秘密中...',
          mask: true
        })
        let data = {
          openid: openid,
          authorGender: gender,
          time: project.getNowTime(),
          content: content,
          zanList: [],
          commentList: [],
          delte: false
        }
        let addSecret = project.fun('databaseAdd', {
          collectionName: 'secret',
          data: JSON.stringify(data)
        })
        addSecret.then(res => {
          // console.log(res)
          wx.showToast({
            title: '上传成功！',
            success: function () {
              wx.switchTab({
                url: '../secret/secret',
              })
            }
          })
        })
      }else{
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '发生了一些意外错误，建议稍后再试。或者联系开发者反馈。',
          showCancel: false,
          confirmText: '我知道了',
          success: function(){
            that.setData({
              flag_uploadSecret: false
            })
          }
        })
      }
    })
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