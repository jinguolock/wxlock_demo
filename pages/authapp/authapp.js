
var myApi = require('../../utils/myapi.js').MyServerApi;
const app = getApp()
var mypage
var authapps
var selectAuth
var authappMap = new Object()
var userPhone
var userPwd
Page({
  data: {
    motto: "",
    findList: null,
    lockName: '',
    lockDesc: '',
    motto: '',
    index_auth:0,
    userInfo: {},
    hasUserInfo: false,
    array: []

  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    mypage = this
    let that=this
    userPhone = wx.getStorageSync('lock_username')
    userPwd = wx.getStorageSync('lock_pwd')
    if (userPhone == null || userPwd == null || userPhone == "" || userPhone == "") {
      wx.redirectTo({ url: "../login/login" })
    }

    myApi.getAuthApp(userPhone, userPwd, function (obj) {
      console.log(obj)
      authapps = obj
      if (authapps != null && authapps.length > 0) {
        for (var i = 0; i < authapps.length; i++) {
          var auth = authapps[i];
          auth.local = decodeURI(auth.local);
          //auth.msg = ""
          authappMap[auth.id] = auth;
        }
      }
      //mypage.setData({ array_community: communitys })
      that.setData({
        findList: authapps
      })
    })
  },

  auth_app_submit: function (e) {
    console.log(e.detail.value);
    if ((e.detail.value["phone"].length == 0)) {
      wx.showToast({
        title: "请输入手机号和密码",
        icon: "none",
        duration: 2000
      });
    } else {
     // addAuthApp(user, pwd, authId, phone, starttime, endtime, same, callback, failback) 
      var same = e.detail.value["same"].length
      myApi.addAuthApp(userPhone, userPwd, selectAuth.id, e.detail.value["phone"], e.detail.value["starttime"], e.detail.value["endtime"],
        same, function (obj) {
        console.log(obj)

          var de = "未知原因"
          if (obj.result == "noauth") {
            de = "没有该公寓授权"
          } else if (obj.result == "authtypewrong") {
            de = "用户类型不可授权"
          } else if (obj.result == "nophone") {
            de = "该手机号没有用户"
          } else if (obj.result == "datewrong"){
            de="时间格式错误"
          }else if (obj.result == "success") {
            de="添加成功"
         
          // wx.switchTab({
          //   url: '../index/index'
          // })
          }

        wx.showToast({
          title: "结果-" + de,
          icon: "none",
          duration: 2000
        });
      })
    }

    // wx.showToast({
    //   title: e.detail.value["pwd"],
    //   icon: "none",
    //   duration: 2000
    // });
  },
  bindPickerChange_apartment: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    selectAuth = authapps[e.detail.value];
    //this.setData({ index_apartment: e.detail.value })
    //selectApartment = this.data.array_apartment[index_apartment]
  },
})
