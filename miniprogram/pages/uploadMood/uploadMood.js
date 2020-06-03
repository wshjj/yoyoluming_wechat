// 云数据库初始化
const db = wx.cloud.database()
// 引入 project.js
const project = require('../../project/project.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag_uploadMood: false,
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
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let getOpenid = project.fun('login', {})
    getOpenid.then(res => {
      // openid 放入数据库查询对应用户信息
      let myInfor = project.getUser(res.result.openid)
      myInfor.then(res0 => {
        // console.log(res0.data)
        this.setData({
          myopenid: res.result.openid,
          authorAvatar: res0.data[0].avatar,
          authorName: res0.data[0].name,
        })
        wx.hideLoading()
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
    let isLoad = true
    if(index == nowUploadImg.length-1){
      isLoad = false
    }
    nowUploadImg.splice(index,1)
    this.setData({
      uploadImg: nowUploadImg,
      loading: isLoad,
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
          wx.showLoading({
            title: '检测图片中。。。',
            mask: true
          })
          // console.log(res.tempFilePaths)
          let tempImg = res.tempFilePaths
          let i = 0
          let isDelte = false
          function verify(){
            wx.getFileSystemManager().readFile({
              filePath: tempImg[i],
              success: buffer => {
                let test = project.fun('checkImg',{buffer: buffer.data})
                test.then(result0 => {
                  console.log(result0.result)
                  if(result0.result.errCode == 87014){
                    if(tempImg.length == i+1){
                      tempImg.splice(i,1)
                      isDelte = true
                      wx.hideLoading()
                      if(isDelte){
                        wx.showModal({
                          title: '警告',
                          content: '因包含敏感信息，部分图片已被删除。',
                          showCancel: false,
                          confirmText: '我知道了'
                        })
                      }
                      that.setData({
                        uploadImg:nowUploadImg.concat(tempImg),
                        loading: true
                      })
                    }else{
                      tempImg.splice(i,1)
                      isDelte = true
                      verify()
                    }
                  }else if(result0.result.errCode != 0){
                    wx.showModal({
                      title:'提示',
                      content: '你上传图片时出现问题，请稍候再试。也可能是服务端问题，可以联系开发人员反馈。',
                      showCancel: false,
                      confirmText: '我知道了',
                      success (res) {
                      }
                    })
                  }else{
                    if(tempImg.length == i+1){
                      wx.hideLoading()
                      if(isDelte){
                        wx.showToast({
                          title: '因包含敏感信息，部分图片已被删除。',
                        })
                      }
                      that.setData({
                        uploadImg:nowUploadImg.concat(tempImg),
                        loading: true
                      })
                    }else{
                      i++
                      verify()
                    }
                  }
                })
              }
            })
          }
          verify()
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
    if(that.data.flag_uploadMood){return false}
    that.setData({
      flag_uploadMood: true
    })
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
          mask: true
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
                mask: true
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
                        uploadImg: [],
                        flag_uploadMood:false,
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
          success: function(){
            that.setData({
              flag_uploadMood: false
            })
          }
        })
      }else if(res.result.errCode == 0){
        wx.hideLoading()
        upload()
      }else{
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '发生了一些意外错误，建议稍后再试。或者联系开发者反馈。',
          showCancel: false,
          confirmText: '我知道了',
          success: function(){
            that.setData({
              flag_uploadMood: false
            })
          }
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