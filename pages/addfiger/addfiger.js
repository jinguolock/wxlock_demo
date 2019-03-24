
var myApi = require('../../utils/myapi.js').MyServerApi;
var myProcess = require('../../utils/myprocess.js').MyProcess;
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

  lock_addfiger: function (e) {
    console.log(e.detail.value);
    var lockId = wx.getStorageSync('addFigerLockId')
    if (lockId == null || lockId.length == 0) {
      wx.showToast({
        title: "没有锁id",
        icon: "none",
        duration: 2000
      });
      return;
    }
    if ((e.detail.value["name"].length == 0) || (e.detail.value["name"].length == 0)) {
      wx.showToast({
        title: "请输入名称",
        icon: "none",
        duration: 2000
      });
      return;
    }
    if ((e.detail.value["starttime"].length == 0) || (e.detail.value["starttime"].length == 0)) {
      wx.showToast({
        title: "请输入起始时间",
        icon: "none",
        duration: 2000
      });
      return;
    }
    if ((e.detail.value["endtime"].length == 0) || (e.detail.value["endtime"].length == 0)) {
      wx.showToast({
        title: "请输入结束时间",
        icon: "none",
        duration: 2000
      });
      return;
    }

    myProcess.addlockfiger(lockId, e.detail.value["name"], e.detail.value["starttime"], e.detail.value["endtime"], function (e) {
      mypage.setData({ motto: e })
    })


    // wx.showToast({
    //   title: e.detail.value["pwd"],
    //   icon: "none",
    //   duration: 2000
    // });
  },

})
