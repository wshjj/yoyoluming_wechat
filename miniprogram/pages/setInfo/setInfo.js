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
      qq: '未填',
      wechat: '未填',
      avatarHistory: []
    },
    array:['保密','男','女'],
    textarea: false,
    textarea_name: "",
    textarea_len:0,
    textarea_place:'',
    tapHead: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '载入页面中...',
      mask: true
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
        nowUserInfo.avatarHistory = res0.data[0].avatarHistory
        nowUserInfo.qq = res0.data[0].qq
        nowUserInfo.wechat = res0.data[0].wechat
        nowUserInfo.openid = res.result.openid
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
    // 根据不同的类别，确定不同的限定长度
    switch(name){
      case '昵称':
        this.setData({
          textarea_len: 15,
          textarea_place: '昵称最长15字'
        })
        break;
      case '个性签名':
        this.setData({
          textarea_len: 30,
          textarea_place: '个性签名最长30字'
        })
        break;
      case '爱好':
        this.setData({
          textarea_len: 30,
          textarea_place: '爱好最长30字'
        })
        break;
      case '自我介绍':
        this.setData({
          textarea_len: 80,
          textarea_place: '自我介绍最长80字'
        })
        break;
      case 'QQ':
        this.setData({
          textarea_len: 11,
          textarea_place: 'QQ最长11字'
        })
        break;
      case '微信':
        this.setData({
          textarea_len: 20,
          textarea_place: '微信最长20字'
        })
        break;
    }
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
    // 为了方便下面调用this.data数据
    let that = this
    // 用户要修改的类目
    let name = this.data.textarea_name
    // 用户填写的修改信息
    let changeMsg = e.detail.value.text
    if(changeMsg == ''){
      wx.showModal({
        title: '提示',
        content: '内容不能为空！',
        showCancel: false,
        confirmText: '我知道了',
      })
    }
    // 将调用更新用户数据的过程放在这个函数中
    let updataProcess = function(data){
      wx.showLoading({
        title: '修改中。。。',
      })
      // 调用更新用户数据的云函数
      let updateDate = project.fun('databaseUpdate', {
        collectionName: 'user',
        doc: that.data.userInfo.doc,
        data: data
      })
      // 调用完后显示修改成功，并更新当前页面
      updateDate.then(res => {
        // console.log(res)
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
    wx.showLoading({
      title: '检测中...',
      mask: true
    })
    let verify = project.fun('checkText',{
      content: changeMsg
    })
    verify.then(res => {
      console.log(res.result)
      if(res.result.errCode == 87014){
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '你的' + name + '包含敏感信息！',
          showCancel: false,
          confirmText: '我知道了',
        })
      }else if(res.result.errCode == 0){
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
            updataProcess({ intro: changeMsg });
            break;
          case 'QQ':
            updataProcess({ qq: changeMsg });
            break;
          case '微信':
            updataProcess({ wechat: changeMsg });
            break;
        }
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

  // 点击头像触发事件
  tapHead:function(){
    this.setData({
      tapHead:true
    })
  },

  // 查看我的头像事件
  watchHead:function(){
    let that = this
    wx.previewImage({
      current:this.data.userInfo.avatar,
      urls: [this.data.userInfo.avatar],
      complete: function(){
        that.setData({
          tapHead: false
        })
      }
    })
  },

  // 查看历史头像事件
  historyHead:function(){
    this.setData({
      tapHead: false
    })
    wx.showLoading({
      title: '跳转中...',
      mask: true
    })
    wx.navigateTo({
      url: '../historyHead/historyHead',
    })
  },

  // 弹出头像的选项后取消
  cancelHead:function(){
    this.setData({
      tapHead: false
    })
  },

  // 更换头像
  changeHead:function(){
    // 为了方便下面调用this.data数据
    let that = this
    // 保留一下旧的头像，下面加入历史头像
    let oldAvatar = that.data.userInfo.avatar
    // 调用选择图片的 api
    wx.chooseImage({
      // 图片数量为1
      count: 1,
      // 选取图片成功后的程序
      success: function (res) {
        wx.showLoading({
          title: '正在检测。。。',
          mask: true
        })
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePaths[0],
          success: buffer => {
            let test = project.fun('checkImg',{buffer: buffer.data})
            test.then(result0 => {
              console.log(result0.result)
              if(result0.result.errCode == 87014){
                wx.hideLoading()
                wx.showModal({
                  title:'警告',
                  content: '你上传的头像包含敏感信息！',
                  showCancel: false,
                  confirmText: '我知道了',
                  success (res) {
                    that.setData({tapHead: false})
                  }
                })
              }else if(result0.result.errCode != 0){
                wx.hideLoading()
                wx.showModal({
                  title:'提示',
                  content: '你上传的头像出现问题，请稍候再试。也可能是服务端问题，可以联系开发人员反馈。',
                  showCancel: false,
                  confirmText: '我知道了',
                  success (res) {
                    that.setData({tapHead: false})
                  }
                })
              }else{
                wx.showLoading({
                  title: '上传中...',
                  mask: true
                })
                // 如果历史头像记录中满了10个，就删掉一个后再进行下一步
                if (that.data.userInfo.avatarHistory.length == 10){
                  let deleteHistoryHead = project.fun('deleteHistoryHead', {
                    doc: that.data.userInfo.doc,
                    fileid: that.data.userInfo.avatarHistory[9]
                  })
                  deleteHistoryHead.then(result1 => {
                    // console.log(res.tempFilePaths[0])
                    let uploadImg = project.uploadImg('head', res.tempFilePaths[0])
                    uploadImg.then(res0 => {
                      // console.log(res0.fileID)
                      // 调用更新用户数据的云函数
                      let updateDate = project.fun('databaseUpdate', {
                        collectionName: 'user',
                        doc: that.data.userInfo.doc,
                        data: {
                          avatar: res0.fileID,
                        }
                      })
                      // 再将旧的头像加入历史头像记录
                      updateDate.then(res1 => {
                        // console.log(res1)
                        let unshiftDate = project.fun('databaseUnshiftArr', {
                          collectionName: 'user',
                          doc: that.data.userInfo.doc,
                          arrName: 'avatarHistory',
                          updateDate: oldAvatar,
                        })
                        //调用完后显示修改成功，并更新当前页面
                        unshiftDate.then(res2 => {
                          // console.log(res2)
                          wx.showToast({
                            title: '修改成功！',
                            icon: 'success',
                            mask: true,
                            complete: function () {
                              let nowUserInfo = that.data.userInfo
                              let nowHistory = nowUserInfo.avatarHistory
                              nowHistory.unshift(nowUserInfo.avatar)
                              nowHistory.pop()
                              nowUserInfo.avatar = res0.fileID
                              nowHistory.historyHead = nowHistory
                              that.setData({
                                tapHead: false,
                                userInfo: nowUserInfo
                              })
                            }
                          })
                        })
                      })
                    })
                  })
                }else{
                  // console.log(res.tempFilePaths[0])
                  let uploadImg = project.uploadImg('head', res.tempFilePaths[0])
                  uploadImg.then(res0 => {
                    // console.log(res0.fileID)
                    // 调用更新用户数据的云函数
                    let updateDate = project.fun('databaseUpdate', {
                      collectionName: 'user',
                      doc: that.data.userInfo.doc,
                      data: {
                        avatar: res0.fileID,
                      }
                    })
                    // 再将旧的头像加入历史头像记录
                    updateDate.then(res1 => {
                      // console.log(res1)
                      let unshiftDate = project.fun('databaseUnshiftArr', {
                        collectionName: 'user',
                        doc: that.data.userInfo.doc,
                        arrName: 'avatarHistory',
                        updateDate: oldAvatar,
                      })
                      //调用完后显示修改成功，并更新当前页面
                      unshiftDate.then(res2 => {
                        // console.log(res2)
                        wx.showToast({
                          title: '修改成功！',
                          icon: 'success',
                          mask: true,
                          complete: function () {
                            let nowUserInfo = that.data.userInfo
                            let nowHistory = nowUserInfo.avatarHistory
                            nowHistory.unshift(nowUserInfo.avatar)
                            nowUserInfo.avatar = res0.fileID
                            nowHistory.historyHead = nowHistory
                            that.setData({
                              tapHead: false,
                              userInfo: nowUserInfo
                            })
                          }
                        })
                      })
                    })
                  })
                }
              }
            })
          }
        })
      },
      fail:function(){
        wx.showToast({
          title: '修改失败',
          icon: 'none',
          complete:function(){
            that.setData({tapHead: false})
          }
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
            mask: true
          })
          // console.log('用户点击确定')
          // 调用更新用户数据的云函数
          let updateDate = project.fun('databaseUpdate', {
            collectionName: 'user',
            doc: that.data.userInfo.doc,
            data: { gender: e.detail.value }
          })
          // 调用完后显示修改成功，并更新当前页面
          updateDate.then(res => {
            // console.log(res)
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
            mask: true
          })
          // console.log('用户点击确定')
          // 调用更新用户数据的云函数
          let updateDate = project.fun('databaseUpdate', {
            collectionName: 'user',
            doc: that.data.userInfo.doc,
            data: { birth: e.detail.value }
          })
          // 调用完后显示修改成功，并更新当前页面
          updateDate.then(res => {
            // console.log(res)
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
    wx.hideLoading()
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