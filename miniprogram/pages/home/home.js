// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    login: true,
    myInfo: {},
    likeList: [],
    navTitle: "",
    isList: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // 判断是否授权
        if (res.authSetting['scope.userInfo']) {
          // 已经授权
          // 通过 login 云函数获取 openid
          let getOpenid = project.fun('login', {})
          getOpenid.then(res => {
            // openid 放入数据库查询对应用户信息
            let myInfo = project.getUser(res.result.openid)
            myInfo.then(res0 =>{
              // console.log(res0.data)
              this.setData({
                myInfo: res0.data[0],
              })
              wx.hideLoading()
            })
          })
        }
        else {
          // 没有授权，要求登录
          this.setData({
            login: false
          })
          wx.hideLoading()
        }
      }
    })
  },

  /*
  * 按下“点我登录”后，将用户信息存入数据库
  */
  bindGetUserInfo: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    // 通过 login 云函数获取 openid
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      // 用户的标识、昵称、头像、性别信息的对象
      let userDate = {
        openid: res.result.openid,
        name: e.detail.userInfo.nickName,
        avatar: e.detail.userInfo.avatarUrl,
        avatarHistory: [],
        gender: e.detail.userInfo.gender,
        birth: '0000-00-00',
        signature: '还没写哦~',
        hobby: '无',
        intro: '这个人很懒，啥也没写。',
        qq: '未填',
        wechat: '未填',
        moodFavorite: [],
        topicFavorite: [],
        likeMe: [],
        myLike: [],
        blackName: [],
        message: [],
        unread: false
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
          complete: function () {
            // 弹出提示后进行跳转
            wx.reLaunch({
              url: '../home/home',
            })
          }
        })
      })
    })
  },

  /*
  * 跳转设置个人的资料卡
  */
  setInfoCard:function(){
    wx.navigateTo({
      url: '../setInfo/setInfo',
    })
  },

  // 弹出一个列表，包括我关注的用户或关注我的用户
  popList: function(e){
    let navTitle
    let likeList
    switch(e.currentTarget.dataset.type){
      case 'concern': {
        navTitle = '我的关注'
        likeList = this.data.myInfo.myLike
        break
      }
      case 'fans': {
        navTitle = '关注我的'
        likeList = this.data.myInfo.likeMe
        break
      }
    }
    this.setData({
      isList: true,
      navTitle: navTitle,
      likeList: likeList
    })
  },

  // 关闭弹出的列表
  cancelList: function(){
    this.setData({
      isList: false
    })
  },

  // 查看用户个人卡片
  watchUser: function (e) {
    wx.navigateTo({
      url: '../userCard/userCard?openid=' + e.currentTarget.dataset.openid + '&myOpenid=' + this.data.myInfo.openid + '&myDoc=' + this.data.myInfo._id
    })
  },

  // 跳转查看我的消息
  myMessage: function(){
    let nowMyInfo = this.data.myInfo
    nowMyInfo.unread = false
    this.setData({
      myInfo: nowMyInfo
    })
    wx.navigateTo({
      url: '../myMessage/myMessage',
    })
  },

  // 跳转到我的心情说说
  myMood: function(){
    wx.navigateTo({
      url: '../myMood/myMood',
    })
  },

  // 跳转到我的匿名说
  mySecret: function(){
    wx.navigateTo({
      url: '../mySecret/mySecret',
    })
  },

  // 跳转到我的收藏
  myFavorite: function(){
    wx.navigateTo({
      url: '../myFavorite/myFavorite',
    })
  },

  // 跳转到反馈对软件意见
  feedBack: function(){
    wx.navigateTo({
      url: '../feedBack/feedBack',
    })
  },

  // 举报处理入口
  inform: function(){
    wx.navigateTo({
      url: '../handleInform/handleInform',
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
    if(this.data.login){
      wx.showLoading({
        title: '更新用户信息...',
        mask: true
      })
      // openid 放入数据库查询对应用户信息
      let myInfo = project.getUser(this.data.myInfo.openid)
      myInfo.then(res0 => {
        // console.log(res0.data)
        this.setData({
          myInfo: res0.data[0],
        })
        wx.hideLoading()
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      isList: false
    })
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