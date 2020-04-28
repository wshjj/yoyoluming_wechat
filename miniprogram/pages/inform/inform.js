// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag_inform: false,
    informId: '',
    informIdPart: '',
    type: '',
    typeWord: '',
    array: ['色情暴力','广告推销','内容低俗','违法反动','其他违规行为'],
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let informId = options.informId
    let type = options.type
    let informIdPart = informId.slice(0,5)
    let typeWord
    switch(type){
      case 'mood': typeWord = '心情广场';break;
      case 'topic': typeWord = '话题说';break;
      case 'secret': typeWord = '匿名说';break;
    }
    this.setData({
      informId,
      informIdPart,
      typeWord,
      type
    })
  },

  // 选择违规类型，滑动选项
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  // 提交举报到数据库
  inform: function(e){
    if (this.data.flag_inform) { return false }
    wx.showLoading({
      title: '提交中...',
    })
    this.setData({
      flag_inform: true
    })
    // 首先计数举报中对这个 id 的说说有几条了，已经有五条了，就不添加了
    let count = db.collection('inform').where({
      informId: this.data.informId
    }).count()
    count.then(res => {
      // console.log(res.total)
      if(res.total >= 5){
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '因受多次举报，该说说已在处理中，感谢您的配合！',
          showCancel: false,
          success: function(res){
            wx.navigateBack({})
          }
        })
      }else{
        let reason = e.detail.value.reason
        let illegal = this.data.array[this.data.index]
        let informId = this.data.informId
        let type = this.data.type
        let data = {
          type: type,
          reason: reason,
          illegal: illegal,
          informId: informId,
          handle: false,
        }
        // 向数据库中添加举报信息
        let addInform = project.fun('databaseAdd',{
          collectionName: 'inform',
          data: JSON.stringify(data)
        })
        addInform.then(res => {
          console.log(res)
          wx.showToast({
            title: '提交成功！',
            success: function(){
              wx.navigateBack({})
            }
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