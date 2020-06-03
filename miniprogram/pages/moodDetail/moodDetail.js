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
    uploadImg: [],
    loading: true,
    commentInput: '',
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
    db.collection('mood').doc(itemDoc).get().then(res => {
      if(res.data.delte){
        wx.showModal({
          title: '提示',
          content: '这条说说不见了哦~',
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

  // 预览图片
  preImg: function (e) {
    let files = e.currentTarget.dataset.files
    let fileid = e.currentTarget.dataset.fileid
    wx.previewImage({
      current: fileid,
      urls: files
    })
  },

  // 查看用户个人卡片
  watchUser: function (e) {
    wx.navigateTo({
      url: '../userCard/userCard?openid=' + e.currentTarget.dataset.openid + '&myOpenid=' + this.data.myInfo.openid + '&myDoc=' + this.data.myInfo._id,
    })
  },

  // 点赞
  zan: function(){
      this.setData({
        isZan: -1-this.data.isZan
      })
      db.collection('mood').doc(this.data.item._id).get().then(res => {
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
          collectionName: 'mood',
          doc: this.data.item._id,
          data: {
            zanList: nowItem.zanList
          }
        })
        update.then(res0 => {
          this.setData({
            item: nowItem,
            isZan: isZan
          })
          // wx.hideLoading()
        })
      })
    // }
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
    let that = this
    if (content == "" && that.data.uploadImg.length == 0) {
      wx.showToast({
        title: '评论内容为空',
        icon: 'none',
        duration: 1500,
      })
      return false
    }
    // 发布评论的人的信息
    let openid = this.data.myInfo.openid
    let avatar = this.data.myInfo.avatar
    let name = this.data.myInfo.name
    // 临时图片链接列表
    let filelist = this.data.uploadImg
    // 用于承接临时链接换为的云空间文件 id
    let upImgList = []
    // 将临时图片文件上传云空间，并且换出 fileid
    // 递归写法
    function upload() {
      if (filelist.length != 0) {
        wx.showLoading({
          title: '上传图片中...',
          mask: true
        })
      }
      // 没换完则继续
      if (upImgList.length < filelist.length) {
        let uploadImg = project.uploadImg('comment', filelist[upImgList.length])
        uploadImg.then(res => {
          // console.log(res.fileID)
          upImgList.push(res.fileID)
          upload()
        })
      } else {
        wx.showToast({
          title: filelist.length == 0 ? '发表评论中...' : '图片上传成功',
          icon: filelist.length == 0 ? 'loading' : 'success',
          success: function () {
            wx.showLoading({
              title: '发表评论中...',
              mask: true
            })
            let data = {
              openid: openid,
              authorName: name,
              authorAvatar: avatar,
              time: project.getNowTime(),
              content: content,
              imgList: upImgList,
            }
            let test = project.fun('databaseUnshiftArr', {
              collectionName: 'mood',
              doc: that.data.item._id,
              arrName: 'commentList',
              updateDate: data
            })
            test.then(res => {
              // console.log(res)
              wx.showToast({
                title: '发布成功！',
                success: function () {
                  wx.redirectTo({
                    url: '../moodDetail/moodDetail?itemDoc=' + that.data.item._id,
                  })
                }
              })
            })
          }
        })
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
          content: '你评论的内容包含敏感信息！',
          showCancel: false,
          confirmText: '我知道了',
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
        })
      }
    })
  },

  // 添加图片事件
  addImg: function () {
    let nowUploadImg = this.data.uploadImg
    let that = this
    if (nowUploadImg.length == 9) {
      wx.showModal({
        title: '提示',
        content: '最多上传9张图片哦！',
        showCancel: false,
        confirmText: '我知道了'
      })
    } else {
      wx.chooseImage({
        count: 9 - nowUploadImg.length,
        success: function (res) {
          // console.log(res.tempFilePaths)
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

  // 预览上传的图片
  watchImg: function (e) {
    let fileid = e.currentTarget.dataset.file
    wx.previewImage({
      current: fileid,
      urls: this.data.uploadImg,
    })
  },

  // 移除上传的图片
  removeImg: function (e) {
    let index = e.currentTarget.dataset.index
    let nowUploadImg = this.data.uploadImg
    let isLoad = true
    if(index == nowUploadImg.length-1){
      isLoad = false
    }
    nowUploadImg.splice(index, 1)
    this.setData({
      uploadImg: nowUploadImg,
      loading: isLoad,
    })
  },

  // 图片渲染完毕的事件
  loadend: function () {
    // 将图片上的遮挡去掉
    this.setData({
      loading: false
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