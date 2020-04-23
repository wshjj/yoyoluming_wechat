// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myopenid: '',
    uploadImg: [],
    loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      this.setData({
        myopenid: res.result.openid
      })
    })
  },

  // 预览上传的图片
  watchImg: function(e){
    let fileid = e.currentTarget.dataset.file
    wx.previewImage({
      current: fileid,
      urls: this.data.uploadImg,
    })
  },

  // 移除上传的图片
  removeImg: function(e){
    let index = e.currentTarget.dataset.index
    let nowUploadImg = this.data.uploadImg
    nowUploadImg.splice(index,1)
    this.setData({
      uploadImg: nowUploadImg,
      loading: true,
    })
  },

  // 图片渲染完毕的事件
  loadend: function(){
    // 将图片上的遮挡去掉
    this.setData({
      loading:false
    })
  },

  // 添加图片事件
  addImg:function(){
    let nowUploadImg = this.data.uploadImg
    let that = this
    if(nowUploadImg.length == 9){
      wx.showModal({
        title: '提示',
        content: '最多上传9张图片哦！',
        showCancel: false,
        confirmText: '我知道了'
      })
    }else{
      wx.chooseImage({
        count: 9 - nowUploadImg.length,
        success: function (res) {
          // console.log(res.tempFilePaths)
          that.setData({
            uploadImg:nowUploadImg.concat(res.tempFilePaths),
            loading: true
          })
        },
      })
    }
  },

  uploadMood: function(e){
    wx.showLoading({
      title: '上传图片中...',
    })
    let content = e.detail.value.content
    let openid = this.data.myopenid
    let filelist = this.data.uploadImg
    let upImgList = []
    // 将临时图片文件上传云空间，并且换出 fileid
    // 递归写法
    function upload(){
      if(upImgList.length < filelist.length){
        let uploadImg = project.uploadImg('mood', filelist[upImgList.length])
        uploadImg.then(res => {
          // console.log(res.fileID)
          upImgList.push(res.fileID)
          upload()
        })
      }else{
        wx.showToast({
          title: '图片上传成功',
          success: function(){
            wx.showLoading({
              title: '上传说说中...',
            })
            let data = {
              openid: openid,
              content: content,
              imgList: upImgList,
              zanList: [],
              commentList: [],
              setTop: false
            }
            let test = project.fun('databaseAdd',{
              collectionName:'mood',
              data: JSON.stringify(data)
            })
            test.then(res => {
              // console.log(res)
              wx.showToast({
                title: '上传成功！',
                success: function(){
                  wx.switchTab({
                    url: '../index/index',
                  })
                }
              })
            })
          }
        })
      }
    }
    upload()
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