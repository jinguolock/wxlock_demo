var nus_service = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
var char_tx = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
var char_rx = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"
var myNusDataCache = new Uint8Array(8000);
var myNusDataCache_length = 0;
var timerId;
let blueApi = {
  blue_data: {
    device_id: "",
    service_id: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
    write_id: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
    notify_id: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
    startTransfer:0,
    currentLength:0
  },
  getCacheReturnContent(){
    var re = new Uint8Array(myNusDataCache_length);
    for (var i = 0; i < myNusDataCache_length;i++){                                       
      re[i] = myNusDataCache[i];
    }
    return re;
  },
  simpleSendBleMsg(deviceName,content,crypt,command,timeout,isCloseFinish,reFunc,msgFunc,sendFinishFunc,failFunc){
    var _this = this;
    clearTimeout(timerId);
    _this.blue_data.device_id = deviceName;
    _this.onOpenNotifyListener = (function () {
      console.log("notify is ready")
      clearTimeout(timerId);
      _this.sendProtoHex(content, crypt, command);
      sendFinishFunc && sendFinishFunc();
    })
    _this.completeTransfer = (function (msg) {
      if (isCloseFinish){
        _this.disconnect()
      }
      _this.blue_data.runFlag = 1
      reFunc && reFunc(msg)
    })
    _this.connect();
    timerId=setTimeout(function () {
    _this.stopSearch();
    _this.disconnect();
    msgFunc && msgFunc("未连接门锁，蓝牙失败！");
    failFunc && failFunc();
    }, 15000);
  },
  connect() {
    if (!wx.openBluetoothAdapter) {
      this.showError("当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。");
      return;
    }
    
    var _this = this;
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log("ble ready complete")
        _this.startSearch();
       }
    })
  },
  //发送消息
  sendMsg(msg, toArrayBuf = true) {
    let _this = this;
    let buf = toArrayBuf ? this.hexStringToArrayBuffer(msg) : msg;
    wx.writeBLECharacteristicValue({
      deviceId: _this.blue_data.device_id,
      serviceId: _this.blue_data.service_id,
      characteristicId: _this.blue_data.write_id,
      value: buf,
      success: function (res) {
        console.log(res);
      }
    })
  },
  sendHex(bs) {
    let _this = this;
    var buf = new ArrayBuffer(bs.length);
    let dataView = new DataView(buf)
    for (var i = 0, len = bs.length; i < len; i ++) {
      dataView.setUint8(i,bs[i])
    }
    wx.writeBLECharacteristicValue({
      deviceId: _this.blue_data.device_id,
      serviceId: _this.blue_data.service_id,
      characteristicId: _this.blue_data.write_id,
      value: buf,
      success: function (res) {
       // console.log(res);
      }
    })
  },
  
  getcheck(bs,start,end) {
    var temp = bs[start];
    for (var i = start + 1; i < end; i++) {
      temp^=bs[i];
    }
    return temp;
  },
  sleep(milliSeconds){
    var startTime = new Date().getTime(); // get the current time
    while (new Date().getTime() < startTime + milliSeconds); // hog cpu
  },
  checkReceiveIsStart(buff){
    if(buff==null||buff.length!=8){
      return false;
    }
    if(buff[0]!=0xcf){
      return false;
    }
    if(buff[7] != 0xcc) {
      return false;
    }
    var crc=this.getcheck(buff,1,6);
    if(crc!=buff[6]){
      console.log("crc is wrong crc in package is:" + buff[6]+",should be:"+crc);
      return false;
    }
    
    return true;
  },
  checkReceiveIsEnd(buff) {
    if (buff == null || buff.length != 6) {
      return false;
    }
    if (buff[0] != 0xdf) {
      return false;
    }
    if (buff[5] != 0xdc) {
      return false;
    }
    var crc = this.getcheck(buff, 1, 4);
    if (crc != buff[4]) {
      console.log("crc is wrong crc in package is:" + buff[4] + ",should be:" + crc);
      return false;
    }
    return true;
  },
  sendProtoHex(bs,cryptobs,command) {
    var start = new Uint8Array(17);
    var end = new Uint8Array(7);
    var numbers=0;
    var hasmod=true;
    if(bs.length%20==0){
      hasmod=false;
      numbers = Math.floor(bs.length / 20);
    }else{
      hasmod=true;
      numbers = Math.floor(bs.length / 20 + 1);
    }
    
    var length=bs.length;
    start[0]=0xcf;
    start[16]=0xcc;
    for (var i = 0; i < cryptobs.length;i++){
      start[i + 1] = cryptobs[i];
    }
    start[9]=0xFF&command;
    start[11]=(numbers>>8)&0xff;
    start[12] = (numbers) & 0xff;
    start[13] = (length >> 8) & 0xff;
    start[14] = (length) & 0xff;
    start[15] = this.getcheck(start,1,15)&0xff

    end[0]=0xdf;
    end[6]=0xdc;
    end[1]=0x00;
    end[2] = 0x00;
    end[3] = this.getcheck(bs, 0, bs.length) & 0xff;
    end[5] = this.getcheck(end, 1, 5) & 0xff;
    this.sendHex(start);
    var temp=0;
    for (var i = 0; i < numbers; i++) {
      if(hasmod&&(i==(numbers-1))){
        var ll = bs.length % 20;
        var send = new Uint8Array(ll);
        for(var j=0;j<ll;j++){
          send[j]=bs[i*20+j];
        }
        this.sendHex(send);
      }else{
        var send = new Uint8Array(20);
        for (var j = 0; j < 20; j++) {
          send[j] = bs[i * 20 + j];
        }
        this.sendHex(send);
      }
     // this.sleep(1);
    }
    this.sendHex(end);

  },
  onNotifyChange() {
    var _this = this;
    wx.onBLECharacteristicValueChange(function (res) {
      _this.addToCache(res.value);
    })
  },
  disconnect() {
    var _this = this;
    wx.closeBLEConnection({
      deviceId: _this.blue_data.device_id,
      success(res) {
        console.log("disconnect ble:" + _this.blue_data.device_id)
      }
    })
    wx.closeBluetoothAdapter({
      success: function (res) {
        console.log(res)
      }
    })
  },
  getBlueState() {
    var _this = this;
    if (_this.blue_data.device_id != "") {
      console.log("ble cannot used")
      _this.connectDevice();
      return;
    }

    wx.getBluetoothAdapterState({
      success: function (res) {
        if (!!res && res.available) { 
          console.log("ble can used")
          _this.startSearch();
        }
      }
    })
  },
  startSearch() {
    var _this = this;
    wx.startBluetoothDevicesDiscovery({
      services: [],
      success(res) {
        wx.onBluetoothDeviceFound(function (res) {
          
          if (res.devices[0].name == _this.blue_data.device_id) {
            _this.blue_data.device_id = res.devices[0].deviceId;
            _this.connectDevice();
            _this.stopSearch();
            
          }
        });
      }
    })
  },
  connectDevice() {
    var _this = this;
    wx.createBLEConnection({
      deviceId: _this.blue_data.device_id,
      success(res) {
        console.log("connectDevice success:" + _this.blue_data.device_id)
        _this.getDeviceService();


      }
    })
  },
  getDeviceService() {
    var _this = this;
    wx.getBLEDeviceServices({
      deviceId: _this.blue_data.device_id,
      success: function (res) {
        for (var i = 0; i < res.services.length;i++){
          var service_id = res.services[i].uuid
          if (service_id == nus_service) {
            _this.getDeviceCharacter()
          }
        }
        
      }
    })
  },
  getDeviceCharacter() {
    let _this = this;
    wx.getBLEDeviceCharacteristics({
      deviceId: _this.blue_data.device_id,
      serviceId: _this.blue_data.service_id,
      success: function (res) {
        _this.openNotify();
      }
    })
  },
  openNotify() {
    var _this = this;
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: _this.blue_data.device_id,
      serviceId: _this.blue_data.service_id,
      characteristicId: _this.blue_data.notify_id,
      complete(res) {
        
        console.log("notify enable")
        _this.onNotifyChange()
        _this.onOpenNotifyListener && _this.onOpenNotifyListener();
      }
    })
  }, 
  stopSearch() {
    var _this = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("stop search success!")
      }
    })
  },
  addToCache(buffer) {
    var _this = this;
    let bufferType = Object.prototype.toString.call(buffer)
    if (buffer != '[object ArrayBuffer]') {
      return
    }
    let dataView = new DataView(buffer);
    if (_this.blue_data.currentLength>0){
      for (var i = 0; i < dataView.byteLength && myNusDataCache_length < 8000; i++) {
        var vv = dataView.getUint8(i);
        myNusDataCache[myNusDataCache_length] = vv;
        myNusDataCache_length++;
      }
      _this.blue_data.currentLength--;
      return;
    }
    var myNusTransCache_length = dataView.byteLength;
    var myNusTransCache = new Uint8Array(myNusTransCache_length);
    for (var i = 0; i < dataView.byteLength; i++) {
      var vv = dataView.getUint8(i);
      myNusTransCache[i] = vv;
    }

    if (_this.checkReceiveIsStart(myNusTransCache)) {
      myNusDataCache = new Array(8000);
      myNusDataCache_length = 0;
      _this.blue_data.currentLength = (myNusTransCache[2] << 8 & 0xff00) | (myNusTransCache[3]&0xff);
      var ll = (myNusTransCache[4] << 8 & 0xff00) | (myNusTransCache[5] & 0xff);
    }else if (_this.checkReceiveIsEnd(myNusTransCache)) {
      //_this.blue_data.startTransfer = 0;
      _this.blue_data.currentLength =0;
      _this.completeTransfer && _this.completeTransfer(_this.getCacheReturnContent());
    }else{
      for (var i = 0; i < myNusTransCache_length && myNusDataCache_length<8000; i++) {
        myNusDataCache[myNusDataCache_length] = myNusTransCache[i];
        myNusDataCache_length++;
      }
    }

  },
  arrayBufferToHexString(buffer) {
    let bufferType = Object.prototype.toString.call(buffer)
    if (buffer != '[object ArrayBuffer]') {
      return
    }
    let dataView = new DataView(buffer)

    var hexStr = '';
    for (var i = 0; i < dataView.byteLength; i++) {
      var str = dataView.getUint8(i);
      var hex = (str & 0xff).toString(16);
      hex = (hex.length === 1) ? '0' + hex : hex;
      hexStr += hex;
    }

    return hexStr.toUpperCase();
  },
  hexStringToArrayBuffer(str) {
    if (!str) {
      return new ArrayBuffer(0);
    }

    var buffer = new ArrayBuffer(str.length);
    let dataView = new DataView(buffer)

    let ind = 0;
    for (var i = 0, len = str.length; i < len; i += 2) {
      let code = parseInt(str.substr(i, 2), 16)
      dataView.setUint8(ind, code)
      ind++
    }

    return buffer;
  }
}
module.exports.Ble = blueApi;
