// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasPermission: false,
    myOpenid: '',
    informList: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中。。。',
    })
    // 通过 login 云函数获取 openid
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      this.setData({
        myOpenid: res.result.openid
      })
    })
  },

  // 登录进管理界面
  verify: function(e){
    let account = e.detail.value.account
    let password = e.detail.value.password
    if(account == 'test2020' && password == '389261' || this.data.myOpenid == 'oaTOn5AnJvH2n4kErIqjN-a22OA0'){
      wx.showLoading({
        title: '请稍候。。。',
      })
      let getInform = project.fun('getInform',{})
      getInform.then(res => {
        wx.hideLoading()
        this.setData({
          hasPermission: true,
          informList: res.result.data
        })
      })
    }else{
      wx.showToast({
        title: '账号密码不正确！',
        icon: 'none'
      })
    }
  },

  // 查看说说详情
  watchItem: function(e){
    wx.navigateTo({
      url: '../'+ e.currentTarget.dataset.type +'Detail/'+ e.currentTarget.dataset.type +'Detail?itemDoc=' + e.currentTarget.dataset.doc,
    })
  },

  // 保留被举报的说说
  reserve: function(e){
    let informId = e.currentTarget.dataset.id
    let nowInform = this.data.informList
    let that = this
    wx.showLoading({
      title: '正在处理。。。',
    })
    let dataUpdate = project.fun('databaseUpdate',{
      collectionName: 'inform',
      doc: informId,
      data: {handle: true}
    })
    dataUpdate.then(res => {
      wx.showToast({
        title: '处理完毕。',
        success: function(){
          project.rmObj_Arr(nowInform, '_id', informId)
          that.setData({
            informList: nowInform
          })
        }
      })
    })
  },

  // 删除被举报的说说
  delete: function(e){
    let informId = e.currentTarget.dataset.item._id
    let sayType = e.currentTarget.dataset.item.type
    let sayDoc = e.currentTarget.dataset.item.informId
    let nowInform = this.data.informList
    let that = this
    wx.showLoading({
      title: '正在删除。。。',
    })
    let dataUpdate = project.fun('databaseUpdate',{
      collectionName: 'inform',
      doc: informId,
      data: {handle: true}
    })
    dataUpdate.then(res => {
      let dataUpdate = project.fun('databaseUpdate',{
        collectionName: sayType,
        doc: sayDoc,
        data: {delte: true}
      })
      dataUpdate.then(res => {
        wx.showToast({
          title: '删除成功',
          success: function(){
            project.rmObj_Arr(nowInform, '_id', informId)
            that.setData({
              informList: nowInform
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
    wx.hideLoading()
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