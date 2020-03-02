let myApi = {
  server: {
    url: "https://api.sagewont.cn/islocking/wx"
  },
  test1(callback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: '2' },
      success: function (res) {
        callback && callback(res.data);
      }
    })
  },
  login(phone,pwd,callback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'login', u:phone,p:pwd},
      success: function (res) {
        callback && callback(res.data);
      }
    })
  },
  regester(user, pwd, callback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'regester', user: user, pwd: pwd },
      success: function (res) {
        callback && callback(res.data);
      }
    })
  },
  webmain(requestName,cmd, paramObj, callback) {
    var _this = this;
    if(paramObj==null){
      paramObj=new Object();
    }
    paramObj["webmain_name"] = requestName;
    paramObj["cmd"] = cmd;
    paramObj["c"] = "webmainRequest";
    wx.request({
      url: _this.server.url,
      data: paramObj,
      success: function (res) {
        console.log(res)
        callback && callback(res.data);
      }
    })
  },
  getCommunity(user, pwd, callback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'getallcommunity', u: user, p: pwd },
      success: function (res) {
        callback && callback(res.data);
      }
    })
  },
  getAuthApp(user, pwd, callback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'getallauthapp', u: user, p: pwd },
      success: function (res) {
        callback && callback(res.data);
      }
    })
  },
  getLockInfo(user, pwd,apartmentId, callback,failback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'getopendoorinfo', u: user, p: pwd, apartmentid: apartmentId },
      success: function (res) {
        callback && callback(res.data);
      },
      fail:function(res){
        
        failback && failback(res.data);
      }
    })
  },
  getLockInfoByAuth(user, pwd, authId, callback, failback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'getopendoorinfobyauth', u: user, p: pwd, authid: authId },
      success: function (res) {
        callback && callback(res.data);
      },
      fail: function (res) {
        failback && failback(res.data);
      }
    })
  },
  getWriteCardLockInfo(user, pwd, authId,cardId,endtime,same, callback, failback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'getwritecardinfobyauth', u: user, p: pwd, authid: authId, cardid: cardId, endtime: endtime,same:same },
      success: function (res) {
        callback && callback(res.data);
      },
      fail: function (res) {
        failback && failback(res.data);
      }
    })
  },
  setLockResult(user, pwd, apartmentId, returnResult, lockinfo,locksn, callback, failback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'setopenlockresult', u: user, p: pwd, apartmentid: apartmentId, result: returnResult, lockinfo: lockinfo,locksn:locksn },
      success: function (res) {
        callback && callback(res.data);
      },
      fail: function (res) {
        failback && failback(res.data);
      }
    })
  },
  setLockResultByAuth(user, pwd, authId, returnResult, lockinfo, locksn,optype, callback, failback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'setopenlockresultbyauth', u: user, p: pwd, authid: authId, result: returnResult, lockinfo: lockinfo, locksn: locksn,type:optype },
      success: function (res) {
        callback && callback(res.data);
      },
      fail: function (res) {
        failback && failback(res.data);
      }
    })
  },
  addAuthApp(user, pwd, authId, phone, starttime, endtime, same, callback, failback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'addapp', u: user, p: pwd, authid: authid, phone: phone, starttime: starttime, endtime: endtime, same: same },
      success: function (res) {
        callback && callback(res.data);
      },
      fail: function (res) {
        failback && failback(res.data);
      }
    })
  },
  addAuthCard(user, pwd, authId, endtime, same, callback, failback) {
    var _this = this;
    wx.request({
      url: _this.server.url,
      data: { c: 'addcard', u: user, p: pwd, authid: authid, endtime: endtime, same: same },
      success: function (res) {
        callback && callback(res.data);
      },
      fail: function (res) {
        failback && failback(res.data);
      }
    })
  },
  /*其他辅助模块*/
}
module.exports.MyServerApi = myApi;
