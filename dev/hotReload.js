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
      instance.$dom = {};
      instance.$render = render;
      instance.build();
    }
  } else {
    var oldCTor = item.CTor;
    var newCTor = Moon.component(name, options);
    var el = null;
    var rootInstance = null;
    var dom = null;
    var meta = null;
    var children = null;
    var render = null;

    item.CTor = newCTor;

    var reloadInstance = function(instance) {
      var el = instance.$el;
      el.__moon__ = undefined;

      el = el.parentNode;
      while(el.__moon__ === undefined) {
        el = el.parentNode;
      }

      rootInstance = el.__moon__;
      dom = [rootInstance.$dom];

      while(dom.length !== 0) {
        var vnode = dom.pop();
        if((componentInfo = (meta = vnode.meta).component) !== undefined && componentInfo.CTor === oldCTor) {
          componentInfo.CTor = newCTor;
          componentInfo.options = options;
          dom = [];
        } else if((children = vnode.children).length !== 0) {
          dom = dom.concat(children);
        }
      }

      render = rootInstance.$render;
      rootInstance.$render = function(m) {
        var dom = render(m);
        var meta = null;
        var children = null;
        var componentInfo = null;

        var update = function(vnodes) {
          for(var i = 0; i < vnodes.length; i++) {
            var vnode = vnodes[i];

            if((componentInfo = (meta = vnode.meta).component) !== undefined && componentInfo.CTor === newCTor) {
              meta.shouldRender = true;
            }

            if((children = vnode.children).length !== 0) {
              update(children);
            }

          }
        }

        update(dom.children);

        this.$render = render;
        return dom;
      }

      rootInstance.build();
    }

    for(var i = 0; i < instances.length; i++) {
      reloadInstance(instances[i]);
    }
  }
}
