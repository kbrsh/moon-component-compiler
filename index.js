const Moon = require("moonjs");
const himalaya = require("himalaya");
const toHTML = require("himalaya/translate").toHTML;
const newlineRE = /\n/g;
const selectorRE = /([\#\.\w\-\,\s\n\r\t:]+?)\s*(?=\s*\{)/g;

const id = require('./src/id.js');
const addClass = require('./src/addClass.js');
const compileLanguage = require('./src/compile.js');

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
  let script = undefined;

  for(let i = 0; i < tree.length; i++) {
    const node = tree[i];

    if(node.type === "Element") {
      const tagName = node.tagName;
      if(tagName === "template" && template === undefined) {
        template = node;

        node = himalaya.parse(node.children[0].content);

        const children = node.children;
        for(let i = 0; i < children.length; i++) {
          const child = children[i];
          if(child.type === "Element") {
            templateRoot = child;
            break;
          }
        }
      } else if(tagName === "style" && style === undefined) {
        style = node;
      } else if(tagName === "script" && script === undefined) {
        script = node;
      }
    }
  }

  if(style !== undefined) {
    const scoped = style.attributes.scoped === "scoped";
    style = compileLanguage(style.children[0].content, style.attributes.lang);

    if(scoped === true) {
      const scopeID = `m-scope-${id(name)}`;
      style = style.replace(selectorRE, `$1.${scopeID}`);
      if(template !== undefined) {
        addClass(templateRoot, scopeID);
      }
    }

    if(development === true) {
      output += `var injectStyle = require('moon-component-compiler/dev/injectStyle'); var removeStyle = injectStyle("${style.replace(newlineRE, "")}");\n`;
    }
  }

  if(script !== undefined) {
    output += `options = (function(exports) {${compileLanguage(script.children[0].content, script.attributes.lang)} return exports;})({});\n`;
  }

  if(template !== undefined && templateRoot !== undefined) {
    output += `options.render = ${Moon.compile(compileLanguage(toHTML(templateRoot), template.attributes.lang)).toString().replace("function anonymous(h\n/**/)", "function(h)")}\n`;
  }

  if(development === true) {
    output += `var hotReload = require("moon-component-compiler/dev/hotReload");\n`;
    output += `module.exports = function(Moon) {var instance = Moon.component("${name}", options); if(module.hot) {module.hot.accept(); `;
    if(style !== undefined) {
      output += `module.hot.dispose(removeStyle); `;
    }
    output += `if(module.hot.data) {hotReload.reload("${name}", instance);} else {hotReload.init("${name}", instance)};};};`;
  } else {
    output += `module.exports = function(Moon) {Moon.component("${name}", options);};`;
  }

  return {
    component: output,
    style: style
  }
}

module.exports = compile;
