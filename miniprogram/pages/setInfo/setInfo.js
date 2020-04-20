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
      name: '我的名字',
      gender: 0,
      birth: '0000-00-00',
      signature: '不一样的我',
      hobby: '我的爱好',
      intro: '这就是我',
    },
    array:['保密','男','女'],
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
        nowUserInfo.gender = res0.data[0].gender
        nowUserInfo.openid = res.result.openid
        // switch (res0.data[0].gender){
        //   case 0: nowUserInfo.gender = '保密'; break;
        //   case 1: nowUserInfo.gender = '男';break;
        //   case 2: nowUserInfo.gender = '女';break;
        // }
        this.setData({
          userInfo: nowUserInfo
        })
        wx.hideLoading()
      })
    })
  },

  // 弹出文本框填写要修改个人信息
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
      // 调用完后显示修改成功，并更新当前页面
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

  // 更换头像
  changeHead:function(){
    // 为了方便下面调用this.data数据
    let that = this
    // 调用选择图片的 api
    wx.chooseImage({
      // 图片数量为1
      count: 1,
      // 选取图片成功后的程序
      success: function (res) {
        wx.showLoading({
          title: '上传中...',
        })
        // console.log(res.tempFilePaths[0])
        let uploadImg = project.uploadImg('head', res.tempFilePaths[0])
        uploadImg.then(res0 => {
          // console.log(res0.fileID)
          // 调用更新用户数据的云函数
          let updateDate = project.fun('databaseUpdate', {
            collectionName: 'user',
            doc: that.data.userInfo.doc,
            data: JSON.stringify({ avatar: res0.fileID})
          })
          // 调用完后显示修改成功，并更新当前页面
          updateDate.then(res => {
            console.log(res)
            wx.showToast({
              title: '修改成功！',
              icon: 'success',
              mask: true,
              complete: function () {
                let nowUserInfo = that.data.userInfo
                nowUserInfo.avatar = res0.fileID
                that.setData({
                  userInfo: nowUserInfo
                })
              }
            })
          })
        })
      },
      fail:function(){
        wx.showToast({
          title: '修改失败',
          icon: 'none'
        })
      }
    })
  },

  // 修改性别
  changeSex:function(e){
    // console.log(e.detail.value)
    // 为了方便下面调用this.data数据
    let that = this
    // 保存现在的性别到 nowSex 变量
    let nowSex = this.data.array[e.detail.value]
    // 弹出提示框，确认是否修改
    wx.showModal({
      title: '提示',
      content: '是否确认将性别改为 ' + nowSex,
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '修改中...',
          })
          // console.log('用户点击确定')
          // 调用更新用户数据的云函数
          let updateDate = project.fun('databaseUpdate', {
            collectionName: 'user',
            doc: that.data.userInfo.doc,
            data: JSON.stringify({ gender: e.detail.value })
          })
          // 调用完后显示修改成功，并更新当前页面
          updateDate.then(res => {
            console.log(res)
            wx.showToast({
              title: '修改成功！',
              icon: 'success',
              mask: true,
              complete: function () {
                let nowUserInfo = that.data.userInfo
                nowUserInfo.gender = e.detail.value
                that.setData({
                  userInfo: nowUserInfo
                })
              }
            })
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
          wx.showToast({
            title: '修改失败',
            icon: 'none'
          })
        }
      }
    })
  },

  // 修改生日
  changeBirth:function(e){
    // console.log(e.detail.value)
    // 为了方便下面调用this.data数据
    let that = this
    // 弹出提示框，确认是否修改
    wx.showModal({
      title: '提示',
      content: '是否确认将生日改为 ' + e.detail.value,
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '修改中...',
          })
          // console.log('用户点击确定')
          // 调用更新用户数据的云函数
          let updateDate = project.fun('databaseUpdate', {
            collectionName: 'user',
            doc: that.data.userInfo.doc,
            data: JSON.stringify({ birth: e.detail.value })
          })
          // 调用完后显示修改成功，并更新当前页面
          updateDate.then(res => {
            console.log(res)
            wx.showToast({
              title: '修改成功！',
              icon: 'success',
              mask: true,
              complete: function () {
                let nowUserInfo = that.data.userInfo
                nowUserInfo.birth = e.detail.value
                that.setData({
                  userInfo: nowUserInfo
                })
              }
            })
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
          wx.showToast({
            title: '修改失败',
            icon: 'none'
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