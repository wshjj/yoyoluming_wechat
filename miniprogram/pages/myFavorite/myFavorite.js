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
    moodList: [],
    myInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    // 通过 login 云函数获取 openid
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      // openid 放入数据库查询对应用户信息
      let myInfo = project.getUser(res.result.openid)
      myInfo.then(res0 => {
        this.setData({
          myopenid: res.result.openid,
          moodList: res0.data[0].moodFavorite,
          myInfo : res0.data[0]
        })
        wx.hideLoading()
      })
    })
  },

  // 预览图片
  preImg: function(e){
    let files = e.currentTarget.dataset.files
    let fileid = e.currentTarget.dataset.fileid
    wx.previewImage({
      current: fileid,
      urls: files
    })
  },

  // 查看说说的详情
  watchItem: function(e){
    wx.navigateTo({
      url: '../moodDetail/moodDetail?itemDoc=' + e.currentTarget.dataset.item.collectDoc,
    })
  },

  // 取消收藏心情说说
  deleteMood: function(e){
    let moodDoc = e.currentTarget.dataset.moodid
    let nowFavorite = this.data.myInfo.moodFavorite
    let myDoc = this.data.myInfo._id
    wx.showModal({
      title: '提示',
      content: '是否要取消收藏该说说？',
      success (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '取消收藏。。。',
          })
          project.rmObj_Arr(nowFavorite, 'collectDoc', moodDoc)
          let dataUpdate = project.fun('databaseUpdate',{
            collectionName: 'user',
            doc: myDoc,
            data: {moodFavorite: nowFavorite}
          })
          dataUpdate.then(res => {
            wx.showToast({
              title: '取消收藏成功',
              success: function(){
                wx.redirectTo({
                  url: '../myFavorite/myFavorite',
                })
              }
            })
          })
        } else if (res.cancel) {}
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