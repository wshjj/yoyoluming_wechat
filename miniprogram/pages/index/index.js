//index.js
const app = getApp()
// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    myavatar: 'cloud://yoyoluming-eeeyk.796f-yoyoluming-eeeyk-1301771364/head/head_default.png',
    mydoc: '',
    myMoodFavorite: '',
    moodList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading({
      title: '获取内容中...',
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
            let myInfor = project.getUser(res.result.openid)
            myInfor.then(res0 => {
              db.collection('mood').get().then(res1 => {
                // console.log(res1.data)
                let moodList = res1.data
                for(let i = 0;i < moodList.length;i++)
                  {moodList[i].hasOthers = false}
                this.setData({
                  myavatar: res0.data[0].avatar,
                  mydoc: res0.data[0]._id,
                  myMoodFavorite: res0.data[0].moodFavorite,
                  isLogin: true,
                  moodList: moodList
                })
                wx.hideLoading()
              })
            })
          })
        }
      }
    })
  },

  // 发表心情，先判断是否登录，登录了则跳转发表页面
  uploadMood:function(){
    if(this.data.isLogin){
      wx.navigateTo({
        url: '../uploadMood/uploadMood',
      })
    }else{
      wx.showModal({
        title: '警告',
        content: '你还没有登录，登录后才可发表心情；是否前往个人中心登录？',
        success(res) {
          if (res.confirm) {
            // console.log('用户点击确定')
            wx.reLaunch({
              url: '../home/home',
            })
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      })
    }
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

  // 查看用户个人卡片
  watchUser: function(e){
    wx.navigateTo({
      url: '../userCard/userCard?openid=' + e.currentTarget.dataset.openid,
    })
  },

  // 查看说说的详情
  watchItem: function(e){
    // 如果是冒泡上来的其他事件则立即返回
    if (e.currentTarget.dataset.item.hasOthers)
    {return false}
    // console.log(JSON.stringify(e.currentTarget.dataset.item))
    wx.navigateTo({
      url: '../moodDetail/moodDetail?jsonItem=' + encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item)),
    })
  },

  // 点击右上角三个点，展开列表，包括收藏和举报
  others: function(e){
    let index = e.currentTarget.dataset.index
    let nowMoodList = this.data.moodList
    nowMoodList[index].hasOthers = true
    this.setData({
      moodList: nowMoodList
    })
  },

  // 取消收藏和举报的列表
  cancelOthers: function(e){
    let index = e.currentTarget.dataset.index
    let nowMoodList = this.data.moodList
    nowMoodList[index].hasOthers = false
    this.setData({
      moodList: nowMoodList
    })
  },

  // 举报说说
  inform: function(e){
    let informId = e.currentTarget.dataset.doc
    wx.navigateTo({
      url: '../inform/inform?informId=' + informId + '&type=mood',
    })
  },

  // 收藏说说
  collect: function(e){
    let collection = e.currentTarget.dataset.doc
    let index = e.currentTarget.dataset.index
    let nowMoodList = this.data.moodList
    // 已收藏列表，用于防重复
    let myMoodFavorite = this.data.myMoodFavorite
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否收藏该篇心情说说？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '收藏中...',
          })
          // 先查询收藏列表，是否重复
          if (myMoodFavorite.indexOf(collection) != -1){
            wx.showToast({
              title: '你已收藏过，收藏失败！',
              icon: 'none',
              success: function(){
                // 关闭列表
                nowMoodList[index].hasOthers = false
                that.setData({
                  moodList: nowMoodList
                })
              }
            })
          }else{
            // 将收藏的说说的标识存入数据库
            let collectMood = project.fun('databaseUnshiftArr', {
              collectionName: 'user',
              doc: that.data.mydoc,
              arrName: 'moodFavorite',
              updateDate: collection
            })
            collectMood.then(res => {
              myMoodFavorite.unshift(collection)
              // 关闭列表
              nowMoodList[index].hasOthers = false
              that.setData({
                moodList: nowMoodList,
                myMoodFavorite: myMoodFavorite
              })
              wx.showToast({
                title: '收藏成功！',
              })
            })
          }
        } else if (res.cancel) {
          // 关闭列表
          nowMoodList[index].hasOthers = false
          that.setData({
            moodList: nowMoodList
          })
        }
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
    wx.showLoading({
      title: '获取内容中...',
    })
    // 到 mood 数据库中获取心情广场的数据
    db.collection('mood').get().then(res => {
      // console.log(res.data)
      let moodList = res.data
      for (let i = 0; i < moodList.length; i++)
      { moodList[i].hasOthers = false }
      this.setData({
        moodList: moodList
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
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
