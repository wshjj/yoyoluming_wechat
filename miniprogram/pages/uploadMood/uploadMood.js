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
    authorAvatar: '',
    authorName: '',
    uploadImg: [],
    loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      // openid 放入数据库查询对应用户信息
      let myInfor = project.getUser(res.result.openid)
      myInfor.then(res0 => {
        console.log(res0.data)
        this.setData({
          myopenid: res.result.openid,
          authorAvatar: res0.data[0].avatar,
          authorName: res0.data[0].name,
        })
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

  // 发表心情说说事件
  uploadMood: function(e){
    let content = e.detail.value.content
    let that = this
    // 如果文字内容为空，则不能上传
    if(content == ""){
      wx.showModal({
        title: '提示',
        content: '请输入文字内容',
        showCancel: false,
        confirmText: '我知道了',
      })
      return false
    }
    // 发表者信息
    let openid = this.data.myopenid
    let avatar = this.data.authorAvatar
    let name = this.data.authorName
    // 临时图片链接列表
    let filelist = this.data.uploadImg
    // 用于承接临时链接换为的云空间文件 id
    let upImgList = []
    // 将临时图片文件上传云空间，并且换出 fileid
    // 递归写法
    function upload(){
      if (filelist.length != 0){
        wx.showLoading({
          title: '上传图片中...',
        })
      }
      // 没换完则继续
      if (upImgList.length < filelist.length){
        let uploadImg = project.uploadImg('mood', filelist[upImgList.length])
        uploadImg.then(res => {
          // console.log(res.fileID)
          upImgList.push(res.fileID)
          upload()
        })
      }else{
        // 将数据上传到数据库的函数
        function uploadData(borderLength) {
          wx.showToast({
            title: filelist.length == 0 ? '上传说说中...' : '图片上传成功',
            icon: filelist.length == 0 ? 'loading' : 'success',
            success: function () {
              wx.showLoading({
                title: '上传说说中...',
              })
              let data = {
                openid: openid,
                authorName: name,
                authorAvatar: avatar,
                time: project.getNowTime(),
                content: content,
                imgList: upImgList,
                borderLength: borderLength,
                zanList: [],
                commentList: [],
                setTop: false,
                delte: false
              }
              let test = project.fun('databaseAdd', {
                collectionName: 'mood',
                data: JSON.stringify(data)
              })
              test.then(res => {
                // console.log(res)
                wx.showToast({
                  title: '上传成功！',
                  success: function () {
                    wx.switchTab({
                      url: '../index/index',
                    })
                  }
                })
              })
            }
          })
        }
        // 如果图片是单张，则上传个数据用于区分图片的长短边
        if(upImgList.length == 1){
          wx.getImageInfo({
            src: upImgList[0],
            success(res) {
              console.log(res)
              let borderLength = res.width > res.height ? 'width' : 'height'
              uploadData(borderLength)
            },
            fail(res) {
              wx.showToast({
                title: '不支持上传的图片格式',
                icon: 'none',
                success: function(){
                  wx.cloud.deleteFile({
                    fileList: upImgList,
                    success: res => {
                      // handle success
                      // console.log(res.fileList)
                      that.setData({
                        uploadImg: []
                      })
                    },
                    // fail: console.error
                  })
                }
              })
            }
          })
        }else{
          uploadData('none')
        }
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