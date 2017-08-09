const Moon = require("moonjs");
const himalaya = require("himalaya");
const toHTML = require("himalaya/translate").toHTML;

const id = require('./src/id.js');
const addClass = require('./src/addClass.js');
const compileLanguage = require('./src/compile.js');

const selectorRE = /([\#\.\w\-\,\s\n\r\t:]+?)\s*(?=\s*\{)/g;

let cache = {};

const compile = (name, component, options) => {
  // Parsed HTML Tree
  const tree = himalaya.parse(component);

  // Check for development
  const development = options.development;

  // Component Output
  let output = `var options = {};\n`;

  // Extract Items
  let template = undefined;
  let templateRoot = undefined;
  let style = undefined;
  let styleRoot = undefined;
  let script = undefined;
  let scriptRoot = undefined;

  for(let i = 0; i < tree.length; i++) {
    const node = tree[i];

    if(node.type === "Element") {
      const tagName = node.tagName;
      if(tagName === "template" && template === undefined) {
        template = node;

        const children = himalaya.parse(node.children[0].content);
        for(let i = 0; i < children.length; i++) {
          const child = children[i];
          if(child.type === "Element") {
            templateRoot = child;
            break;
          }
        }
      } else if(tagName === "style" && style === undefined) {
        style = node;
        styleRoot = compileLanguage(style.children[0].content, style.attributes.lang);
      } else if(tagName === "script" && script === undefined) {
        script = node;
        scriptRoot = compileLanguage(script.children[0].content, script.attributes.lang);
      }
    }
  }

  let cached = cache[name];
  let render = "false";

  if(cached === undefined) {
    cache[name] = {
      styleRoot: styleRoot,
      scriptRoot: scriptRoot
    }
  } else if(development === true && cached.styleRoot === styleRoot && cached.scriptRoot === scriptRoot) {
    render = "true";
  }

  if(style !== undefined) {
    const scoped = style.attributes.scoped === "scoped";
    style = styleRoot;

    if(scoped === true) {
      const scopeID = `m-scope-${id(name).toLowerCase()}`;
      style = style.replace(selectorRE, function(match, selectors) {
        return `${selectors.split(",").map((selector) => `${selector}.${scopeID}`).join(",")} `
      });
      if(template !== undefined) {
        addClass(templateRoot, scopeID);
      }
    }

    if(development === true) {
      output += `var injectStyle = require('moon-component-compiler/dev/injectStyle'); var removeStyle = injectStyle(${JSON.stringify(style)});\n`;
    }
  }

  if(script !== undefined) {
    output += `options = (function(exports) {${scriptRoot} return exports;})({});\n`;
  }

  if(template !== undefined && templateRoot !== undefined) {
    output += `options.render = ${Moon.compile(compileLanguage(toHTML(templateRoot), template.attributes.lang)).toString().replace("function anonymous(m\n/**/)", "function(m)")}\n`;
  }

  if(development === true) {
    output += `var hotReload = require("moon-component-compiler/dev/hotReload"); if(module.hot) {module.hot.accept(); `;
    if(style !== undefined) {
      output += `module.hot.dispose(removeStyle); `;
    }
    output += `if(module.hot.data) {hotReload.reload("${name}", options, ${render});};};\n`;
    output += `module.exports = function(Moon) {hotReload.init(Moon, "${name}", options);};`;
  } else {
    output += `module.exports = function(Moon) {Moon.component("${name}", options);};`;
  }

  return {
    component: output,
    style: style
  }
}

module.exports = compile;
