const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function fetchURL(url, callback) {
  return fetch(url)
    .then(function (response) {
      if (response.status == 200) {
        return response.json();
      }
    }).then(function (data) {
      if (typeof callback == 'function') {
        callback(data);
      }
    })
}
module.exports = {
  formatTime: formatTime
}



