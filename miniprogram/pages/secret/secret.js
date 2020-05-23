//index.js
const app = getApp()
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
    isLogin: false,
    mydoc: '',
    myopenid: '',
    secretList: [],
    toUpload: false,
    over: false,
    toBottom: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '获取内容中...',
      mask: true
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // 判断是否授权
        if (res.authSetting['scope.userInfo']) {
          // 通过 login 云函数获取 openid
          let getOpenid = project.fun('login', {})
          getOpenid.then(res => {
            // openid 放入数据库查询对应用户信息
            let myInfo = project.getUser(res.result.openid)
            myInfo.then(res0 => {
              // 获取首页第一页的数据
              let getPageContent = project.fun('getPageContent',{
                collectionName: 'secret',
                page: 1,
              })
              getPageContent.then(res1 =>{
                let secretList
                if(res1.result == "over") secretList = []
                else secretList = res1.result.data
                secretList.reverse()
                this.setData({
                  mydoc: res0.data[0]._id,
                  myopenid: res.result.openid,
                  isLogin: true,
                  secretList: secretList
                })
                wx.hideLoading()
              })
            })
          })
        }else{
          // 获取首页第一页的数据
          let getPageContent = project.fun('getPageContent',{
            collectionName: 'secret',
            page: 1,
          })
          getPageContent.then(res1 =>{
            let secretList
            if(res1.result == "over") secretList = []
            else secretList = res1.result.data
            secretList.reverse()
            this.setData({
              mydoc: res0.data[0]._id,
              myopenid: res.result.openid,
              isLogin: true,
              secretList: secretList
            })
            wx.hideLoading()
          })
        }
      }
    })
  },

  // 发表秘密，先判断是否登录，登录了则跳转发表页面
  toUploadSecret: function(){
    if(this.data.isLogin){
      this.setData({
        toUpload: true
      })
      wx.navigateTo({
        url: '../uploadSecret/uploadSecret',
      })
    }else{
      wx.showModal({
        title: '警告',
        content: '你还没有登录，登录后才可发表秘密；是否前往个人中心登录？',
        success(res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '../home/home',
            })
          } else if (res.cancel) {}
        }
      })
    }
  },

  // 加载更多
  getMore: function(){
    wx.showLoading({
      title: '获取内容中...',
      mask: true
    })
    page++
    let getPageContent = project.fun('getPageContent', {
      collectionName: 'secret',
      page: page
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
          over: false,
          secretList: nowSecretList
        })
        wx.hideLoading()
      }
    })
  },

  // 举报说说
  inform: function(e){
    let informId = e.currentTarget.dataset.doc
    if(this.data.isLogin){
      wx.navigateTo({
        url: '../inform/inform?informId=' + informId + '&type=secret',
      })
    }else{
      wx.showModal({
        title: '警告',
        content: '你还没有登录，登录后才可以举报秘密；是否前往个人中心登录？',
        success(res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '../home/home',
            })
          } else if (res.cancel) {}
        }
      })
    }
  },

  // 查看秘密详情
  watchItem: function(e){
    let itemId = e.currentTarget.dataset.item._id
    if(this.data.isLogin){
      wx.navigateTo({
        url: '../secretDetail/secretDetail?itemDoc=' + itemId,
      })
    }else{
      wx.showModal({
        title: '警告',
        content: '你还没有登录，登录后才可以查看秘密的详情；是否前往个人中心登录？',
        success(res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '../home/home',
            })
          } else if (res.cancel) {}
        }
      })
    }
  },

  // 刷新页面
  fresh: function(){
    wx.showLoading({
      title: '获取内容中...',
      mask: true
    })
    page = 1
    // 获取首页第一页的数据
    let getPageContent = project.fun('getPageContent',{
      collectionName: 'secret',
      page: 1,
    })
    getPageContent.then(res1 =>{
      let secretList
      if(res1.result == "over") secretList = []
      else secretList = res1.result.data
      secretList.reverse()
      this.setData({
        toBottom:false,
        over:false,
        secretList: secretList
      })
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 10,
      })
      wx.hideLoading()
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
    if(!this.data.toUpload){return false}
    wx.showLoading({
      title: '获取内容中...',
      mask: true
    })
    page = 1
    // 获取首页第一页的数据
    let getPageContent = project.fun('getPageContent',{
      collectionName: 'secret',
      page: 1,
    })
    getPageContent.then(res1 =>{
      let secretList
      if(res1.result == "over") secretList = []
      else secretList = res1.result.data
      secretList.reverse()
      this.setData({
        toUpload: false,
        toBottom:false,
        over:false,
        secretList: secretList
      })
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 10,
      })
      wx.hideLoading()
    })
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