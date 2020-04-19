// 引入 project.js
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
        // 判断是否授权
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo
          wx.getUserInfo({
            success: res => {
              // 获取用户信息成功，将信息渲染至全局
              this.setData({
                userInfo: res.userInfo
              })
              // 然后跳转到主页
              wx.switchTab({
                url: '../index/index',
              })
            }
          })
        }
        else{
          // 没有授权，显示出登录按钮
          this.setData({
            login: false
          })
        }
      }
    })
  },

  /*
  * 按下“授权登录”后，将用户信息存入数据库
  */
  bindGetUserInfo:function(e){
    wx.showLoading({
      title: '加载中',
    })
    // 通过 login 云函数获取 openid
    let getOpenid = project.fun('login',{})
    getOpenid.then(res => {
      // 用户的标识、昵称、头像、性别信息的对象
      let userDate = {
        openid: res.result.openid,
        name: e.detail.userInfo.nickName,
        avatar: e.detail.userInfo.avatarUrl,
        gender: e.detail.userInfo.gender,
        birth: '未填',
        signature: '还没写哦~',
        hobby: '无',
        intro: '这个人很懒，啥也没写。',
      }
      // 使用 databaseAdd 云函数将用户存入数据库
      let addDate = project.fun('databaseAdd', {
        collectionName: 'user',
        data: JSON.stringify(userDate),
      })
      addDate.then(res0 => {
        //console.log(res0)
        // 存入数据库成功，弹出授权成功的提示
        wx.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 1500,
          complete:function(){
            // 弹出提示后进行跳转
            wx.switchTab({
              url: '../index/index',
            })
          }
        })
      })
    })
  },

  /*
  * 用户选择“暂不登录”，先跳转主页
  */
  unlogin: function(){
    // 用户暂未登录，先跳转主页
    wx.switchTab({
      url: '../index/index',
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