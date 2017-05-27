var map = window.MOON_HOT_RELOAD;

if(map === undefined) {
  map = {};
  window.MOON_HOT_RELOAD = map;
}

module.exports.init = function(name, CTor) {
  map[name] = {
    CTor: CTor,
    instances: []
  }

  var init = CTor.init;
  CTor.init = function() {
    map[name].instances.push(this);
    init.call(instance);
  }
}

module.exports.reload = function(name, CTor) {
  var item = map[name];
  var instances = item.instances;
  var oldCTor = item.CTor;

  oldCTor.prototype = CTor.prototype;

  for(var i = 0; i < instances.length; i++) {
    instances[i].build();
  }
}
