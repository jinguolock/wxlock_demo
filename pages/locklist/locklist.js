var util = require('../../utils/util');
var blueApi = require('../../utils/ble.js').Ble;
var myApi = require('../../utils/myapi.js').MyServerApi;
var myProcess = require('../../utils/myprocess.js').MyProcess;

const app = getApp()
var mypage
var selectApartment
var selectAuthId
var authapps
var authappMap=new Object()
var userPhone
var userPwd
var flag = 0
var lockPwd
var lockVersion
var lockSn
var lockinfo
var locklist
var selectNodeId
var willsendbyte
Page({
  data:{
    motto:"",
    findList:null,
    lockName: '',
    lockDesc: '',
    motto: {},
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    array: []
    
  },

  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let that = this;
    mypage = this;
    myApi.webmain("datalist", "lock_node",null, function (obj) {
      console.log(obj)
      locklist = obj

      that.setData({
        findList: locklist
      })
      // that.setMotto("ok")
    })

  },
  setMotto:function(str){
    var obj = new Object();
    obj[selectNodeId] = str;
    mypage.setData({ motto: obj })
  },
  clearcard: function (e) {
    console.log("clearcard")
    selectNodeId = e.target.dataset.aid;
    mypage.setMotto("正在准备数据……")
    selectNodeId = e.target.dataset.aid;
    myProcess.clearlockcard(selectNodeId,  function (msg) {
        mypage.setMotto(msg)
      }
    )
  },
  clearfiger: function (e) {
    console.log("clearfiger")
    selectNodeId = e.target.dataset.aid;
    mypage.setMotto("正在准备数据……")
    selectNodeId = e.target.dataset.aid;
    myProcess.clearlockfiger(selectNodeId, function (msg) {
      mypage.setMotto(msg)
    }
    )
  }

    
  //end method
})