var map = window.MOON_HOT_RELOAD_MAP;

if(map === undefined) {
  map = {};
  window.MOON_HOT_RELOAD_MAP = map;
}

module.exports.init = function(Moon, name, options) {
  if(window.MOON_HOT_RELOAD === undefined) {
    window.MOON_HOT_RELOAD = Moon;
  }

  var CTor = Moon.component(name, options);

  var init = CTor.prototype.init;
  CTor.prototype.init = function() {
    map[name].instances.push(this);
    init.call(this);
  }

  map[name] = {
    CTor: CTor,
    instances: []
  }
}

module.exports.reload = function(name, options) {
  var Moon = window.MOON_HOT_RELOAD;

  var item = map[name];
  var instances = item.instances;

  item.CTor.prototype = Moon.component(name, options).prototype;

  for(var i = 0; i < instances.length; i++) {
    instances[i].build();
  }
}
