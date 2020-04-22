//index.js
const app = getApp()
// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    myavatar: 'cloud://yoyoluming-eeeyk.796f-yoyoluming-eeeyk-1301771364/head/head_default.png',
    mydoc: '',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // 判断是否授权
        if (res.authSetting['scope.userInfo']) {
          // 通过 login 云函数获取 openid
          let getOpenid = project.fun('login', {})
          getOpenid.then(res => {
            // openid 放入数据库查询对应用户信息
            let myInfor = project.getUser(res.result.openid)
            myInfor.then(res0 => {
              this.setData({
                myavatar: res0.data[0].avatar,
                mydoc: res0.data[0]._id,
                isLogin: true
              })
            })
          })
        }
      }
    })
  },

  uploadMood:function(){
    if(this.data.isLogin){
      wx.navigateTo({
        url: '../uploadMood/uploadMood',
      })
    }else{
      wx.showModal({
        title: '警告',
        content: '你还没有登录，登录后才可发表心情；是否前往个人中心登录？',
        success(res) {
          if (res.confirm) {
            // console.log('用户点击确定')
            wx.reLaunch({
              url: '../home/home',
            })
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
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
