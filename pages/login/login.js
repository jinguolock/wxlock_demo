
var myApi = require('../../utils/myapi.js').MyServerApi;
const app = getApp()
var mypage

Page({

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    mypage = this


    // var text = '123456';
    // var textBytes = aesjs.utils.utf8.toBytes(text);

    // // The counter is optional, and if omitted will begin at 1
    // var aesCtr = new aesjs.ModeOfOperation.ctr(aeskey, new aesjs.Counter(0));
    // var encryptedBytes = aesCtr.encrypt(textBytes);
    // console.log(encryptedBytes)
  },

  lock_login: function (e) {
    console.log(e.detail.value);
    if ((e.detail.value["phone"].length == 0) || (e.detail.value["pwd"].length == 0)) {
      wx.showToast({
        title: "请输入手机号和密码",
        icon: "none",
        duration: 2000
      });
    } else {
      myApi.login(e.detail.value["phone"], e.detail.value["pwd"], function (obj) {
        console.log(obj)
        if (obj.result == "fail") {
          var de = "未知原因"
          if (obj.desc == "nolock") {
            de = "此用户未绑定锁"
          } else if (obj.desc == "nouser") {
            de = "未注册用户"
          } else if (obj.desc == "pwderror") {
            de = "密码错误"
          }
          wx.showToast({
            title: "验证失败-" + de,
            icon: "none",
            duration: 2000
          });
        } else if (obj.result == "success") {
          wx.setStorageSync('lock_username', e.detail.value["phone"])
          wx.setStorageSync('lock_pwd', e.detail.value["pwd"])

          wx.setStorageSync('lock_username2', decodeURI(obj.username))
          wx.setStorageSync('lock_name', decodeURI(obj.name))
          wx.setStorageSync('lock_address', decodeURI(obj.address))
          wx.setStorageSync('lock_email', obj.email)
          wx.setStorageSync('lock_id', obj.id)
          wx.setStorageSync('lock_idsn', obj.idsn)
          wx.setStorageSync('lock_phone', obj.phone)
          wx.setStorageSync('lock_type', obj.type)
          wx.switchTab({
            url: '../index/index'
          })
        }
      })
    }

    // wx.showToast({
    //   title: e.detail.value["pwd"],
    //   icon: "none",
    //   duration: 2000
    // });
  },
  register: function (e) {
    console.log(e.detail.value);
    wx.navigateTo({ url: "../register/register" })
  },
})
