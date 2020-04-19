// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      doc: '',
      openid: '',
      avatar: 'cloud://yoyoluming-eeeyk.796f-yoyoluming-eeeyk-1301771364/head/head_default.png',
      name: '',
      gener: '',
      birth: '',
      signature: '',
      hobby: '',
      intro: '',
    },
    textarea: false,
    textarea_name: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '载入页面中...',
    })
    // 通过 login 云函数获取 openid
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      // openid 放入数据库查询对应用户信息
      let myInfor = project.getUser(res.result.openid)
      myInfor.then(res0 => {
        // console.log(res0.data)
        // 拷贝一份当前用户信息，并将数据库中的用户信息替换进相应的内容
        let nowUserInfo = this.data.userInfo
        nowUserInfo.avatar = res0.data[0].avatar
        nowUserInfo.name = res0.data[0].name
        nowUserInfo.birth = res0.data[0].birth
        nowUserInfo.signature = res0.data[0].signature
        nowUserInfo.hobby = res0.data[0].hobby
        nowUserInfo.intro = res0.data[0].intro
        nowUserInfo.doc = res0.data[0]._id
        nowUserInfo.openid = res.result.openid
        switch (res0.data[0].gender){
          case 0: nowUserInfo.gender = '保密'; break;
          case 1: nowUserInfo.gender = '男';break;
          case 2: nowUserInfo.gender = '女';break;
        }
        this.setData({
          userInfo: nowUserInfo
        })
        wx.hideLoading()
      })
    })
  },

  // 弹出文本框填写个人信息
  popUp:function(e){
    let name = e.currentTarget.dataset.name
    //console.log(name)
    this.setData({
      textarea: true,
      textarea_name: name,
    })
  },

  // 关闭用来修改个人信息的弹窗
  popUpX:function(){
    this.setData({
      textarea: false,
      textarea_name: "",
    })
  },

  // 确定修改个人信息
  popUpSure:function(e){
    wx.showLoading({
      title: '加载中...',
    })
    // 为了方便下面调用this.data数据
    let that = this
    // 用户要修改的类目
    let name = this.data.textarea_name
    // 用户填写的修改信息
    let changeMsg = e.detail.value.text
    // 将调用更新用户数据的过程放在这个函数中
    let updataProcess = function(data){
      // 调用更新用户数据的云函数
      let updateDate = project.fun('databaseUpdate', {
        collectionName: 'user',
        doc: that.data.userInfo.doc,
        data: JSON.stringify(data)
      })
      // 调用完后显示修改成功，并且刷新当前页面
      updateDate.then(res => {
        console.log(res)
        wx.showToast({
          title: '修改成功！',
          icon: 'success',
          mask: true,
          complete: function(){
            let key = Object.keys(data)[0]
            let nowUserInfo = that.data.userInfo
            nowUserInfo[key] = data[key]
            that.setData({
              textarea: false,
              userInfo: nowUserInfo
            })
          }
        })
      })
    }
    switch(name){
      case '昵称':
        updataProcess({name: changeMsg });
        break;
      case '个性签名':
        updataProcess({signature: changeMsg });
        break;
      case '爱好':
        updataProcess({ hobby: changeMsg });
        break;
      case '自我介绍':
        updataProcess({ hobby: changeMsg });
        break;
    }
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