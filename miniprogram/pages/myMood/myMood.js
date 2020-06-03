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
    moodList: [],
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
          collectionName: 'mood',
          page: 1,
        })
        getMyContent.then(res1 =>{
          let moodList
          if (res1.result == "over") moodList = []
          else moodList = res1.result.data
          moodList.reverse()
          this.setData({
            myopenid: res.result.openid,
            moodList: moodList
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
      collectionName: 'mood',
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
        let newMoodList = res.result.data
        newMoodList.reverse()
        let nowMoodList = [...this.data.moodList , ...newMoodList]
        this.setData({
          toBottom: false,
          moodList: nowMoodList
        })
        wx.hideLoading()
      }
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
      url: '../moodDetail/moodDetail?itemDoc=' + e.currentTarget.dataset.item._id,
    })
  },

  // 删除心情说说
  deleteMood: function(e){
    let moodDoc = e.currentTarget.dataset.moodid
    wx.showModal({
      title: '提示',
      content: '是否要删除该说说？',
      success (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中。。。',
          })
          let dataUpdate = project.fun('databaseUpdate',{
            collectionName: 'mood',
            doc: moodDoc,
            data: {delte: true}
          })
          dataUpdate.then(res => {
            wx.showToast({
              title: '删除成功',
              success: function(){
                wx.redirectTo({
                  url: '../myMood/myMood',
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