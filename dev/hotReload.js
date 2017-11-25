var map = window.MOON_HOT_RELOAD_MAP;

if(map === undefined) {
  map = {};
  window.MOON_HOT_RELOAD_MAP = map;
}

module.exports.init = function(Moon, name, options) {
  var CTor = Moon.extend(name, options);

  var init = CTor.prototype.init;
  CTor.prototype.init = function() {
    var item = map[name];

    var options = item.options;
    if(options !== undefined) {
      for(var option in options) {
        if(option === "data") {
          this[option] = options[option]();
        } else if(option === "render") {
          this.compiledRender = options[option];
        } else {
          this[option] = options[option];
        }
      }
    }

    item.instances.push(this);
    init.call(this);
  }

  map[name] = {
    options: undefined,
    instances: []
  }
}

module.exports.reload = function(name, options, render) {
  var item = map[name];
  var instances = item.instances;

  if(render === true) {
    var render = options.render;
    for(var i = 0; i < instances.length; i++) {
      var instance = instances[i];
      instance.compiledRender = render;
      instance.build();
    }

    item.options.compiledRender = render;
  } else {
    var data = options.data;
    var methods = options.methods;
    var computed = options.computed;
    var hooks = options.hooks;
    var render = options.render;

    item.options = options;

    for(var i = 0; i < instances.length; i++) {
      var instance = instances[i];
      instance.data = data();
      instance.methods = methods;
      instance.computed = computed;
      instance.hooks = hooks;
      instance.compiledRender = render;
      instance.build();
    }
  }
}
