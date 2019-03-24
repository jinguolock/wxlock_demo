var util = require('util');
var blueApi = require('ble.js').Ble;
var myApi = require('myapi.js').MyServerApi;
let myProcess = {

  sendBleByAuth(deviceId, content, command, reFunc, msgFunc, sendFinishFunc,failFunc) {
    var _this = this;
    var willsendbyte;
    myApi.webmain("lock", "getlockpwd", { id: deviceId }, function (obj) {
      if (obj != null && obj.pwd != null) {
        msgFunc && msgFunc("数据完成，准备操作……")
        willsendbyte = _this.getHexByStr(obj.pwd);
        blueApi.simpleSendBleMsg("IR" + deviceId, content, willsendbyte, command, 30000, true, reFunc, msgFunc, sendFinishFunc,failFunc)
      }
    }, function (err) {
      msgFunc && msgFunc("准备数据失败，网络错误:"+err)
    }
    )
  },
  syncDoor(deviceId,msgFunc) {
    var _this = this;
     var content = new Uint8Array(1);
     content[0]=1;
    this.sendBleByAuth(deviceId, content, 0x27,
      function (msg) {
        console.log("recivelength::" + (msg.length) + "::" + (_this.getStrByHex(msg)))
      }, msgFunc)
  },
  configDoor(deviceId, msgFunc) {
    var _this = this;

    myApi.webmain("lock", "get_config_data", { id: deviceId }, function (obj) {
      if (obj != null && obj.data != null) {
        msgFunc && msgFunc("数据完成，准备操作……")
        console.log(obj.data)
        var content = _this.getHexByStr(obj.data);
        _this.sendBleByAuth(deviceId, content, 0x28,
          function (msg) {
            console.log("recivelength::" + (msg.length) + "::" + (_this.getStrByHex(msg)))
            myApi.webmain("lock", "configdatafinish", { id: deviceId, value: _this.getStrByHex(msg) })
          }, msgFunc)
      }
    }, function (err) {
      msgFunc && msgFunc("准备数据失败，网络错误:" + err)
    }
    )
  },
  addlockcard(deviceId,name,starttime,endtime, msgFunc) {
    var _this = this;
    var startDate = _this.getDateByStr(starttime)
    var endDate = _this.getDateByStr(endtime)
    var startNum = Math.floor((startDate.getTime())/1000);
    var endNum = Math.floor((endDate.getTime())/1000);
    var content = new Uint8Array(8);
    content[0] = startNum&0xff;
    content[1] = (startNum>>8) & 0xff;
    content[2] = (startNum>>16) & 0xff;
    content[3] = (startNum>>24) & 0xff;
    content[4] = endNum & 0xff;
    content[5] = (endNum >> 8) & 0xff;
    content[6] = (endNum >> 16) & 0xff;
    content[7] = (endNum >> 24) & 0xff;
    this.sendBleByAuth(deviceId, content, 0x29,
      function (msg) {
        console.log("recivelength::" + (msg.length) + "::" + (_this.getStrByHex(msg)))
        if(msg.length>3){
          var sendObj=new Object();
          sendObj.id=deviceId;
          sendObj.name=name;
          sendObj.cardno = _this.getStrByHex2(msg);
          sendObj.start=starttime;
          sendObj.end=endtime;
          sendObj.total="10000";
          if(msg.length==4){
            sendObj.type ="AM1";
          } else if (msg.length == 8) {
            sendObj.type = "BID";
          }
          sendObj.offtype="offline";
          console.log(sendObj)
          myApi.webmain("lock", "addcard", sendObj,function(reobj){
            console.log(reobj)
            msgFunc && msgFunc("添加成功！")
          })
        }else if(msg.length==1){
          console.log("add card error")
          if(msg[0]==0x01){
            msgFunc && msgFunc("添加失败！")
          }
        }
        
      }, msgFunc,function(){
        msgFunc && msgFunc("请在10秒内刷卡")
      })
  },
  deletelockcard(id,deviceId, cardNostr, msgFunc) {
    var _this = this;
    var cardNo = _this.getHexByStr2(cardNostr)
    
    this.sendBleByAuth(deviceId, cardNo, 0x2B,
      function (msg) {
        console.log("recivelength::" + (msg.length) + "::" + (_this.getStrByHex(msg)))
        if (msg[0] >0) {
          
          myApi.webmain("lock", "deletecard", {id:id}, function (reobj) {
            console.log(reobj)
            msgFunc && msgFunc("删除成功，" + msg[0])
          })
        }else{
          msgFunc && msgFunc("删除失败！")
        }
      })
  },
  addlockfiger(deviceId, name, starttime, endtime, msgFunc) {
    var _this = this;
    var startDate = _this.getDateByStr(starttime)
    var endDate = _this.getDateByStr(endtime)
    var startNum = Math.floor((startDate.getTime()) / 1000);
    var endNum = Math.floor((endDate.getTime()) / 1000);
    var content = new Uint8Array(8);
    content[0] = startNum & 0xff;
    content[1] = (startNum >> 8) & 0xff;
    content[2] = (startNum >> 16) & 0xff;
    content[3] = (startNum >> 24) & 0xff;
    content[4] = endNum & 0xff;
    content[5] = (endNum >> 8) & 0xff;
    content[6] = (endNum >> 16) & 0xff;
    content[7] = (endNum >> 24) & 0xff;
    this.sendBleByAuth(deviceId, content, 0x2A,
      function (msg) {
        console.log("recivelength::" + (msg.length) + "::" + (_this.getStrByHex(msg)))
        if (msg[0] <100) {
          var sendObj = new Object();
          sendObj.id = deviceId;
          sendObj.name = name;
          sendObj.fingerno = msg[0].toString(10);
          sendObj.start = starttime;
          sendObj.end = endtime;
          sendObj.total = "10000";
          sendObj.type = "normal";
          console.log(sendObj)
          myApi.webmain("lock", "addfinger", sendObj, function (reobj) {
            console.log(reobj)
            msgFunc && msgFunc("添加成功！")
          })
        } else {
          console.log("add figer error")
          if (msg[0] == 0x01) {
            msgFunc && msgFunc("添加失败！")
          }
        }

      }, msgFunc, function () {
        msgFunc && msgFunc("请在10秒内刷指纹")
      })
  },
  deletelockfiger(id, deviceId, figerNo, msgFunc) {
    var _this = this;
    var content = new Uint8Array(1);
    content[0] = parseInt(figerNo, 10) & 0xff;
    this.sendBleByAuth(deviceId, content, 0x2C,
      function (msg) {
        console.log("recivelength::" + (msg.length) + "::" + (_this.getStrByHex(msg)))
        if (msg[0] > 0) {

          myApi.webmain("lock", "deletefinger", { id: id }, function (reobj) {
            console.log(reobj)
            msgFunc && msgFunc("删除成功，" + msg[0])
          })
        } else {
          msgFunc && msgFunc("删除失败！")
        }
      })
  },
  clearlockfiger(deviceId, msgFunc) {
    var _this = this;
    var content = new Uint8Array(1);
    content[0] = 1;
    this.sendBleByAuth(deviceId, content, 0x2E,
      function (msg) {
        console.log("recivelength::" + (msg.length) + "::" + (_this.getStrByHex(msg)))
        if (msg[0] > 0) {
          myApi.webmain("lock", "clearfinger", { id: deviceId}, function (reobj) {
            console.log(reobj)
            msgFunc && msgFunc("删除成功，" + msg[0])
          })
        } else {
          msgFunc && msgFunc("删除失败！")
        }
      })
  },
  clearlockcard(deviceId, msgFunc) {
    var _this = this;
    var content = new Uint8Array(1);
    content[0] = 1;
    this.sendBleByAuth(deviceId, content, 0x2D,
      function (msg) {
        console.log("recivelength::" + (msg.length) + "::" + (_this.getStrByHex(msg)))
        if (msg[0] > 0) {
          myApi.webmain("lock", "clearcard", { id: deviceId }, function (reobj) {
            console.log(reobj)
            msgFunc && msgFunc("删除成功，" + msg[0])
          })
        } else {
          msgFunc && msgFunc("删除失败！")
        }
      })
  },
  openDoor(deviceId, msgFunc) {
    var _this = this;
    var content = new Uint8Array(1);
    content[0] = 1;
    this.sendBleByAuth(deviceId, content, 0x20,
      function (msg) {
        console.log("recivelength::" + (msg.length) + "::"+(msg))
        msgFunc && msgFunc("开门成功！")
      }, msgFunc)
  },
  getStrByHex(hexArr){
    var hexStr = '';
    for (var i = 0; i < hexArr.length; i++) {
      var str = hexArr[i];
      var hex = (str & 0xff).toString(16);
      hex = (hex.length === 1) ? '0' + hex : hex;
      hexStr += hex;
      if (i!=(hexArr.length-1)){
        hexStr+=',';
      }
    }

    return hexStr;
  },
  getStrByHex2(hexArr) {
    var hexStr = '';
    for (var i = 0; i < hexArr.length; i++) {
      var str = hexArr[i];
      var hex = (str & 0xff).toString(16);
      hex = (hex.length === 1) ? '0' + hex : hex;
      hexStr += hex;
    }
    return hexStr;
  },
  getHexByStr(hexStr) {
    var strs = hexStr.split(",");
    var re = new Uint8Array(strs.length);
    for (var i = 0; i < strs.length; i++) {
      re[i] = parseInt(strs[i], 16) & 0xff;
    }

    return re;
  },
  getHexByStr2(hexStr) {
    if (!hexStr) {
      return new Uint8Array(0);
    }
    var content = new Uint8Array(hexStr.length/2);
    let ind = 0;
    for (var i = 0, len = hexStr.length; i < len; i += 2) {
      let code = parseInt(hexStr.substr(i, 2), 16)
      content[ind]=code;
      ind++
    }

    return content;
  },
  getArrayBuffByStr(hexStr){
    var strs = hexStr.split(",");
    var buf = new ArrayBuffer(bs.length);
    let dataView = new DataView(buf)
    for (var i = 0; i < strs.length; i++) {
      dataView.setUint8(i, parseInt(strs[i], 16) & 0xff)
    }
    return re
  },
  getDateByStr(dateStr) {
    var strs = dateStr.split("_");
    var d1 = strs[0].split("-");
    var d2 = strs[1].split(":");
    var re=new Date();
    re.setFullYear(parseInt(d1[0], 10), parseInt(d1[1], 10) - 1, parseInt(d1[2], 10));
    re.setHours(parseInt(d2[0], 10), parseInt(d2[1], 10), parseInt(d2[2], 10));
    return re
  }
}
module.exports.MyProcess = myProcess;
