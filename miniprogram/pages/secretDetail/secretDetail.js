// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {
      zanList: [],
      commentList: []
    },
    myInfo: {},
    isZan: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let itemDoc = options.itemDoc
    db.collection('secret').doc(itemDoc).get().then(res => {
      if(res.data.delte){
        wx.showModal({
          title: '提示',
          content: '这条秘密不见了哦~',
          showCancel: false,
          success (res){
            wx.navigateBack({})
          }
        })
      }else{
        // 通过 login 云函数获取 openid
        let getOpenid = project.fun('login', {})
        getOpenid.then(res0 => {
          // openid 放入数据库查询对应用户信息
          let myInfo = project.getUser(res0.result.openid)
          myInfo.then(res1 => {
            let isZan = res.data.zanList.indexOf(res1.data[0].openid)
            this.setData({
              item: res.data,
              myInfo: res1.data[0],
              isZan: isZan
            })
            wx.hideLoading()
          })
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