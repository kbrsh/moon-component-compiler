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

module.exports.reload = function(name, options, render) {
  var Moon = window.MOON_HOT_RELOAD;
  var item = map[name];
  var instances = item.instances;

  if(render === true) {
    item.CTor = Moon.component(name, options);

    var render = options.render;
    for(var i = 0; i < instances.length; i++) {
      var instance = instances[i];
      instance.$render = render;
      instance.build();
    }
  } else {
    var oldCTor = item.CTor;
    var newCTor = Moon.component(name, options);
    var el = null;

    item.CTor = newCTor;

    for(var i = 0; i < instances.length; i++) {
      var instance = instances[i];

      el = instance.$el;
      delete el.__moon__;
    }

    while(el.__moon__ === undefined || el.__moon__ === instance) {
      el = el.parentNode;
    }

    var rootInstance = el.__moon__;
    var dom = [rootInstance.$dom];

    while(dom.length !== 0) {
      var vnode = dom.pop();
      if(vnode.meta.component !== undefined && vnode.meta.component.CTor === oldCTor) {
        var componentInfo = vnode.meta.component;
        componentInfo.CTor = newCTor;
        componentInfo.options = options;
        dom = [];
      } else if(vnode.children.length !== 0) {
        dom = dom.concat(vnode.children);
      }
    }

    rootInstance.build();
  }
}
