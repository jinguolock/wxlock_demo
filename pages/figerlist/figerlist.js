var util = require('../../utils/util');
var blueApi = require('../../utils/ble.js').Ble;
var myApi = require('../../utils/myapi.js').MyServerApi;
var myProcess = require('../../utils/myprocess.js').MyProcess;

var aeskey = [114, 61, 59, 120, 32, 11, 18, 92, 42, 54, 51, 35, 24, 34, 67, 61];
const app = getApp()
var mypage
var selectApartment
var selectAuthId
var authapps
var authappMap = new Object()
var userPhone
var userPwd
var flag = 0
var lockPwd
var lockVersion
var lockSn
var lockinfo
var figerlist
var selectNodeId
var willsendbyte
Page({
  data: {
    motto: "",
    findList: null,
    lockName: '',
    lockDesc: '',
    motto: {},
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    array: []

  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    let that = this;
    mypage = this;
    myApi.webmain("datalist", "lock_finger", null, function (obj) {
      console.log(obj)
      figerlist = obj

      that.setData({
        findList: figerlist
      })
      // that.setMotto("ok")
    })

  },
  setMotto: function (str) {
    var obj = new Object();
    obj[selectNodeId] = str;
    mypage.setData({ motto: obj })
  },
  deletefiger: function (e) {
    console.log("deletefiger")
    selectNodeId = e.target.dataset.aid;
    var deviceId;
    var figerNo;
    for (var i in figerlist) {
      if (figerlist[i].Id == selectNodeId) {
        deviceId = figerlist[i].NodeId;
        figerNo = figerlist[i].FingerNo;
        break;
      }
    }
    if (!deviceId) {
      console.log("no found finger id:" + selectNodeId)
      return
    }
    myProcess.deletelockfiger(selectNodeId, deviceId, figerNo, function (msg) {
      mypage.setMotto(msg)
    })
  }


  //end method
})