// pages/cover/cover.js
const project = require('../../project/project.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    login: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo
          wx.getUserInfo({
            success: res => {
              this.setData({
                userInfo: res.userInfo
              })
              wx.switchTab({
                url: '../index/index',
              })
            }
          })
        }
        else{
          this.setData({
            login: false
          })
        }
      }
    })
  },

  bindGetUserInfo:function(e){
    wx.showLoading({
      title: '加载中',
    })
    let getOpenid = project.fun('login',{})
    getOpenid.then(res => {
      let userDate = {
        openid: res.result.openid,
        name: e.detail.userInfo.nickName,
        avatar: e.detail.userInfo.avatarUrl,
        gender: e.detail.userInfo.gender
      }
      let addDate = project.fun('databaseAdd', {
        collectionName: 'user',
        data: JSON.stringify(userDate),
      })
      addDate.then(res0 => {
        console.log(res0)
        wx.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 1500,
          complete:function(){
            wx.switchTab({
              url: '../index/index',
            })
          }
        })
      })
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