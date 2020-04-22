// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myopenid: '',
    uploadImg: ['cloud://yoyoluming-eeeyk.796f-yoyoluming-eeeyk-1301771364/head/UWC7XRokw0.png', 'cloud://yoyoluming-eeeyk.796f-yoyoluming-eeeyk-1301771364/head/YXLxeHwmeV.png', 'cloud://yoyoluming-eeeyk.796f-yoyoluming-eeeyk-1301771364/head/Yc0jvj4Y8h.png']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      this.setData({
        myopenid: res.result.openid
      })
    })
  },

  test: function(){
    let data = {tast:12}
    let test = project.fun('databaseAdd',{
      collectionName:'mood',
      data: JSON.stringify(data)
    })
    test.then(res => {
      console.log(res)
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