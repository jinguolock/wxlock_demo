var util = require('../../utils/util');
var blueApi = require('../../utils/ble.js').Ble;
var myApi = require('../../utils/myapi.js').MyServerApi;
var myProcess = require('../../utils/myprocess.js').MyProcess;

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
var cardlist
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
    myApi.webmain("datalist", "lock_card_offline", null, function (obj) {
      console.log(obj)
      cardlist = obj

      that.setData({
        findList: cardlist
      })
      // that.setMotto("ok")
    })

  },
  setMotto: function (str) {
    var obj = new Object();
    obj[selectNodeId] = str;
    mypage.setData({ motto: obj })
  },
  deletelockcard: function (e) {
    console.log("deletelockcard")
    selectNodeId = e.target.dataset.aid;
    var deviceId;
    var cardNostr;
    for (var i in cardlist){
      if (cardlist[i].Id == selectNodeId){
        deviceId = cardlist[i].NodeId;
        cardNostr = cardlist[i].CardNo;
        break;
      }
    }
    if(!deviceId){
      console.log("no found card id:" + selectNodeId)
      return
    }
    myProcess.deletelockcard(selectNodeId,deviceId, cardNostr, function(msg){
      mypage.setMotto(msg)
    })
  }


  //end method
})