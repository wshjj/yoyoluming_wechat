// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      gender: 0,
      signature: '。。。',
      hobby: '。。。',
      intro: '。。。'
    },
    myInfo: {},
    birth: 0,
    myOpenid: '',
    myDoc: '',
    isLiked: false,
    isBlack: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const openid = options.openid
    const myOpenid = options.myOpenid
    const myDoc = options.myDoc
    // 查询现在的年份
    let d = new Date()
    let nowYear = d.getFullYear()
    let nowMonth = d.getMonth()+1
    let birth = 0
    // openid 放入数据库查询对应用户信息
    let userInfo = project.getUser(openid)
    userInfo.then(res => {
      if (nowMonth >= parseInt(res.data[0].birth.slice(5, 7))){
        birth = nowYear - parseInt(res.data[0].birth.slice(0, 4))
      }else{
        birth = nowYear - parseInt(res.data[0].birth.slice(0, 4))-1
      }
      let isLiked
      // 检测是否已经关注
      for (let i in res.data[0].likeMe){
        if (res.data[0].likeMe[i].openid == myOpenid)
          isLiked = true
      }
      // openid 放入数据库查询我的信息
      let myInfo = project.getUser(myOpenid)
      myInfo.then(res0 => {
        let isBlack
        // 检测是否拉黑
        if (res0.data[0].blackName.indexOf(openid) == -1) {
          isBlack = false
        } else {
          isBlack = true
        }
        this.setData({
          userInfo: res.data[0],
          myInfo: res0.data[0],
          birth: birth,
          myOpenid: myOpenid,
          myDoc: myDoc,
          isLiked: isLiked,
          isBlack: isBlack
        })
        wx.hideLoading()
      })
    })
  },

  // 点关注
  like: function(){
    wx.showLoading({
      title: '正在关注中...',
      mask: true
    })
    // 将我的 openid 及其他信息存入这个用户的 likeMe 列表
    let unshiftArr = project.fun('databaseUnshiftArr',{
      collectionName: 'user',
      doc: this.data.userInfo._id,
      arrName: 'likeMe',
      updateDate: { 
        openid: this.data.myOpenid,
        name: this.data.myInfo.name,
        avatar: this.data.myInfo.avatar
      }
    })
    unshiftArr.then(res => {
      // 将这个用户的 openid 存入我的 myLike 列表
      let unshiftArr1 = project.fun('databaseUnshiftArr', {
        collectionName: 'user',
        doc: this.data.myDoc,
        arrName: 'myLike',
        updateDate: {
          openid: this.data.userInfo.openid,
          name: this.data.userInfo.name,
          avatar: this.data.userInfo.avatar
        }
      })
      unshiftArr1.then(res0 => {
        let nowUserInfo = this.data.userInfo
        nowUserInfo.likeMe.unshift(this.data.myOpenid)
        let that = this
        wx.showToast({
          title: '关注成功',
          success: function () {
            that.setData({
              isLiked: true,
              userInfo: nowUserInfo
            })
          }
        })
      })
    })
  },

  // 取消关注
  unlike: function(){
    wx.showLoading({
      title: '正在取消关注...',
      mask: true
    })
    let that = this
    let nowUserInfo = this.data.userInfo
    // openid 放入数据库查询对应用户信息
    let myInfo = project.getUser(this.data.userInfo.openid)
    myInfo.then(res => {
      // 将我的 openid 及其他信息从该用户的 likeMe 列表中删除
      let nowLikeMe = res.data[0].likeMe
      project.rmObj_Arr(nowLikeMe, 'openid', this.data.myOpenid)
      let update = project.fun('databaseUpdate',{
        collectionName: 'user',
        doc: this.data.userInfo._id,
        data: {
          likeMe: nowLikeMe
        }
      })
      update.then(res =>{
        nowUserInfo.likeMe = nowLikeMe
        // openid 放入数据库查询对应用户信息
        let myInfo1 = project.getUser(this.data.myOpenid)
        myInfo1.then(res0 => {
          // 将该用户的 openid 及其它信息从我的 myLike 列表中删除
          let nowMyLike = res0.data[0].myLike
          project.rmObj_Arr(nowMyLike, 'openid', this.data.userInfo.openid)
          let update1 = project.fun('databaseUpdate', {
            collectionName: 'user',
            doc: this.data.myDoc,
            data: {
              myLike: nowMyLike
            }
          })
          update1.then(res1 => {
            wx.showToast({
              title: '取消关注成功',
              success: function () {
                that.setData({
                  isLiked: false,
                  userInfo: nowUserInfo
                })
              }
            })
          })
        })
      })
    })
  },

  // 加入黑名单
  black: function(){
    let that = this
    wx.showModal({
      title: '提示',
      content: '拉黑后不会再接收该用户发来的站内信，是否拉黑？',
      success(res) {
        if (res.confirm) {
          // console.log('用户点击确定')
          wx.showLoading({
            title: '加入黑名单中...',
            mask: true
          })
          // 将这个用户的 openid 存入我的 blackName 列表
          let unshiftArr = project.fun('databaseUnshiftArr', {
            collectionName: 'user',
            doc: that.data.myDoc,
            arrName: 'blackName',
            updateDate: that.data.userInfo.openid
          })
          unshiftArr.then(res => {
            let nowUserInfo = that.data.userInfo
            nowUserInfo.blackName.unshift(that.data.myOpenid)
            wx.showToast({
              title: '拉黑成功',
              success: function () {
                that.setData({
                  isBlack: true,
                })
              }
            })
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },

  // 移除黑名单
  unblack: function(){
    wx.showLoading({
      title: '移除中...',
      mask: true
    })
    let that = this
    // openid 放入数据库查询对应用户信息
    let myInfo1 = project.getUser(this.data.myOpenid)
    myInfo1.then(res => {
      // 将该用户的 openid 从我的 blackName 列表中删除
      let nowMyBlack = res.data[0].blackName
      if (nowMyBlack.indexOf(this.data.userInfo.openid) > -1){
        nowMyBlack.splice(nowMyBlack.indexOf(this.data.userInfo.openid), 1)
      }
      let update1 = project.fun('databaseUpdate', {
        collectionName: 'user',
        doc: this.data.myDoc,
        data: {
          blackName: nowMyBlack
        }
      })
      update1.then(res1 => {
        wx.showToast({
          title: '移出黑名单成功',
          success: function () {
            that.setData({
              isBlack: false,
            })
          }
        })
      })
    })
  },

  // 发送站内信
  sendMessage: function(){
    let sender = this.data.myOpenid
    let receiver = this.data.userInfo.openid
    wx.navigateTo({
      url: '../sendMessage/sendMessage?sender=' + sender + '&receiver=' + receiver,
    })
  },

  // 预览头像
  preImg: function(e){
    let fileid = e.currentTarget.dataset.fileid
    wx.previewImage({
      current: fileid,
      urls: [fileid]
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