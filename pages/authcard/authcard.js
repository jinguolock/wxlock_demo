
var myApi = require('../../utils/myapi.js').MyServerApi;
var blueApi = require('../../utils/ble.js').Ble;
var aeskey = [114, 61, 59, 120, 32, 11, 18, 92, 42, 54, 51, 35, 24, 34, 67, 61];
const app = getApp()
var mypage
var authapps
var selectAuth
var authappMap = new Object()
var userPhone
var userPwd
var lockPwd
var lockSn
var lockinfo
var flag
Page({
  data: {
    motto: "",
    findList: null,
    lockName: '',
    lockDesc: '',
    motto: '',
    index_auth: 0,
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
    let that = this
    userPhone = wx.getStorageSync('lock_username')
    userPwd = wx.getStorageSync('lock_pwd')
    if (userPhone == null || userPwd == null || userPhone == "" || userPhone == "") {
      wx.redirectTo({ url: "../login/login" })
    }
   // console.log("userPhone:" + lock_username)
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
        selectAuth = authapps[0]
      }
      //mypage.setData({ array_community: communitys })
      that.setData({
        findList: authapps
      })
    })

    blueApi.onNotifyListener = (function (msg) {
      console.log(msg)
      if ("01" == msg) {
        mypage.setData({ motto: "已授权！" })
      } else if ("02" == msg) {
        mypage.setData({ motto: "卡号不对，未授权！" })
      } else if ("03" == msg) {
        mypage.setData({ motto: "卡授权失败，未授权！" })
      } else if ("00" == msg) {
        mypage.setData({ motto: "没有卡，未授权！" })
      } else if ("04" == msg) {
        mypage.setData({ motto: "写卡失败，未授权！" })
      }else if ("05" == msg) {
        mypage.setData({ motto: "时间问题，未授权！" })
      } else if ("06" == msg) {
        mypage.setData({ motto: "密码问题，未授权！" })
      } 
      // setLockResultByAuth(user, pwd, authId, returnResult, lockinfo, locksn, callback, failback) 
      myApi.setLockResultByAuth(userPhone, userPwd, selectAuth.id, msg, lockinfo, lockSn, "authcard", null, null);
      blueApi.disconnect()
      flag = 1
    })

    blueApi.onOpenNotifyListener = (function () {
      console.log("notify is ready")
      mypage.setData({ motto: "链接完成，请刷卡……" })
      blueApi.sendHex(lockPwd)
    })
  },

  lock_card_auth: function (e) {
    console.log(e.detail.value);
    if ((e.detail.value["cardId"].length == 0)) {
      wx.showToast({
        title: "请输入卡号",
        icon: "none",
        duration: 2000
      });
      return;
    } 
    //console.log("current:"+e.detail.value["current"])
    var cardId = e.detail.value["cardId"]
    var endtime = e.detail.value["endtime"]
   // mypage.setData({ motto: e.detail.value["cardId"] })
    var same = e.detail.value["same"].length
   // getWriteCardLockInfo(user, pwd, authId, cardId, endtime, same, callback, failback)

    myApi.getWriteCardLockInfo(userPhone, userPwd, selectAuth.id, cardId, endtime, same, function (obj) {
      console.log(obj)
      if (obj.result =="noauth"){
        mypage.setData({ motto: "没有该授权，请联系管理员！" })
        return
      }
      if (obj.result == "datewrong") {
        mypage.setData({ motto: "日期格式错误！" })
        return
      }
      if (obj.result == "cardidwrong") {
        mypage.setData({ motto: "卡号格式错误！" })
        return
      }
      if (obj.result == "authtypewrong") {
        mypage.setData({ motto: "用户权限受限！" })
        return
      }
      if (obj.result == "nouser") {
        mypage.setData({ motto: "用户数据出错！" })
        return
      }
      if (obj.result == "nolock") {
        mypage.setData({ motto: "锁数据出错！" })
        return
      }
      if (obj.result == "expire") {
        lockSn = obj.sn;
        blueApi.blue_data.device_id = "IR" + lockSn;
        lockinfo = obj.lockinfo
        var textBytes = aesjs.utils.hex.toBytes(obj.lockinfo)
        var aesCtr = new aesjs.ModeOfOperation.ctr(aeskey, new aesjs.Counter(0));
        lockPwd = aesCtr.decrypt(textBytes);
        console.log(aesjs.utils.hex.fromBytes(lockPwd));

        blueApi.connect();
        setTimeout(function () {
          if (flag == 0) {
            blueApi.stopSearch()
            blueApi.disconnect()
            mypage.setData({ motto: "未连接门锁，授权失败！" })
          }
        }, 15000);


        mypage.setData({ motto: "此账号授权过期！" })
        return
      }
      if (obj.result == "success") {
        mypage.setData({ motto: "数据完成，准备授权……" })
        lockSn = obj.sn;
        blueApi.blue_data.device_id = "IR" + lockSn;
        lockinfo = obj.lockinfo
        var textBytes = aesjs.utils.hex.toBytes(obj.lockinfo)
        var aesCtr = new aesjs.ModeOfOperation.ctr(aeskey, new aesjs.Counter(0));
        lockPwd = aesCtr.decrypt(textBytes);
        console.log(aesjs.utils.hex.fromBytes(lockPwd));

        blueApi.connect();
        setTimeout(function () {
          if (flag == 0) {
            blueApi.stopSearch()
            blueApi.disconnect()
            mypage.setData({ motto: "未连接门锁，授权失败！" })
          }
        }, 15000);

       // mypage.setData({ motto: "已完成授权！" })
        return
      }
    })
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
