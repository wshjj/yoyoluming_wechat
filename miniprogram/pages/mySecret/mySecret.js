// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')
// 定义页数
let page = 1

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myopenid: '',
    secretList: [],
    over: false,
    toBottom: false
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
        // 获取首页第一页的数据
        let getMyContent = project.fun('getMyContent',{
          collectionName: 'secret',
          page: 1,
        })
        getMyContent.then(res1 =>{
          let secretList
          if (res1.result == "over") secretList = []
          else secretList = res1.result.data
          secretList.reverse()
          this.setData({
            myopenid: res.result.openid,
            secretList: secretList
          })
          wx.hideLoading()
        })
      })
    })
  },

  // 加载更多
  getMore: function(){
    wx.showLoading({
      title: '获取内容中...',
      mask: true
    })
    page++
    let getPageContent = project.fun('getMyContent', {
      collectionName: 'secret',
      page: page,
    })
    getPageContent.then(res => {
      if (res.result == 'over') {
        this.setData({
          over: true
        })
        page--
        wx.hideLoading()
      }else{
        let newSecretList = res.result.data
        newSecretList.reverse()
        let nowSecretList = [...this.data.secretList , ...newSecretList]
        this.setData({
          toBottom: false,
          secretList: nowSecretList
        })
        wx.hideLoading()
      }
    })
  },

  // 查看秘密详情
  watchItem: function(e){
    let itemId = e.currentTarget.dataset.item._id
    wx.navigateTo({
      url: '../secretDetail/secretDetail?itemDoc=' + itemId,
    })
  },

  // 删除心情说说
  deleteSecret: function(e){
    let secretDoc = e.currentTarget.dataset.secretid
    wx.showModal({
      title: '提示',
      content: '是否要删除该秘密？',
      success (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中。。。',
          })
          let dataUpdate = project.fun('databaseUpdate',{
            collectionName: 'secret',
            doc: secretDoc,
            data: {delte: true}
          })
          dataUpdate.then(res => {
            wx.showToast({
              title: '删除成功',
              success: function(){
                wx.redirectTo({
                  url: '../mySecret/mySecret',
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
    this.setData({
      toBottom: true
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})