Page({
  data:{
    loginIn:true ,//登录状态
    lock_name:"",
    lock_username: "",
    lock_address: "",
    lock_email: "",
    lock_id: "",
    lock_idsn: "",
    lock_phone: "",
    lock_type: "",
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if(!that.data.loginIn){
      wx.navigateTo({
        url:'../login/login'
      });
    }
    this.setData({ lock_name: wx.getStorageSync('lock_name') })
    this.setData({ lock_username: wx.getStorageSync('lock_username2') })
    this.setData({ lock_address: wx.getStorageSync('lock_address') })
    this.setData({ lock_email: wx.getStorageSync('lock_email') })
    this.setData({ lock_idsn: wx.getStorageSync('lock_idsn') })
    this.setData({ lock_phone: wx.getStorageSync('lock_phone') })
    this.setData({ lock_type: wx.getStorageSync('lock_type') })
  },

  relogin: function (e) {
    wx.navigateTo({ url: "../login/login" })
  },
})