module.exports = function(css) {
  var html = document.createElement('div');
  html.innerHTML = "<style>" + css + "</style>";
  var style = html.childNodes[0];
  document.getElementsByTagName('head')[0].appendChild(style);
  return function() {
    document.getElementsByTagName('head')[0].removeChild(style);
  }
}
