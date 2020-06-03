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
    isZan: -1,
    popText: false,
    commentInput: '',
    isHiddenGender: false
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

  // 弹出评论的框
  popComment: function(){
    this.setData({
      popText: true
    })
  },

  // 收起评论的框
  unPopComment: function(){
    this.setData({
      popText: false
    })
  },

  // 向评论框中输入内容
  input: function(e){
    this.setData({
      commentInput: e.detail.value
    })
  },

  // 发布评论
  sendComment: function(e){
    let content = e.detail.value.comContent
    let gender = this.data.isHiddenGender ? 0 : this.data.myInfo.gender
    let openid = this.data.myInfo.openid
    let that = this
    console.log(content)
    if (content == "") {
      wx.showToast({
        title: '评论内容为空',
        icon: 'none',
        duration: 1500,
      })
      return false
    }
    wx.showLoading({
      title: '检测中...',
      mask: true
    })
    let verify = project.fun('checkText',{
      content: content
    })
    verify.then(res => {
      console.log(res.result)
      if(res.result.errCode == 87014){
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '你发表的内容包含敏感信息！',
          showCancel: false,
          confirmText: '我知道了',
        })
      }else if(res.result.errCode == 0){
        wx.hideLoading()
        wx.showLoading({
          title: '发表评论中...',
          mask: true
        })
        let data = {
          openid: openid,
          gender: gender,
          time: project.getNowTime(),
          content: content,
        }
        let unshiftArr = project.fun('databaseUnshiftArr', {
          collectionName: 'secret',
          doc: that.data.item._id,
          arrName: 'commentList',
          updateDate: data
        })
        unshiftArr.then(res => {
          // console.log(res)
          wx.showToast({
            title: '发布成功！',
            success: function () {
              wx.redirectTo({
                url: '../secretDetail/secretDetail?itemDoc=' + that.data.item._id,
              })
            }
          })
        })
      }else{
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '发生了一些意外错误，建议稍后再试。或者联系开发者反馈。',
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },

  // 点击开关，改变状态
  bindSwitch: function(e){
    // console.log(e.detail.value)
    this.setData({
      isHiddenGender: e.detail.value
    })
  },

  // 点赞
  zan: function(){
    this.setData({
      isZan: -1-this.data.isZan
    })
    db.collection('secret').doc(this.data.item._id).get().then(res => {
      let nowItem = res.data
      let isZan
      if (nowItem.zanList.indexOf(this.data.myInfo.openid) > -1){
        // 如果在点赞列表中，则删去
        nowItem.zanList.splice(nowItem.zanList.indexOf(this.data.myInfo.openid), 1)
        isZan = -1
      }else{
        // 不在的话，就 unshift 进去
        nowItem.zanList.unshift(this.data.myInfo.openid)
        isZan = 0
      }
      let update = project.fun('databaseUpdate', {
        collectionName: 'secret',
        doc: this.data.item._id,
        data: {
          zanList: nowItem.zanList,
        }
      })
      update.then(res0 => {
        this.setData({
          item: nowItem,
          isZan: isZan
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