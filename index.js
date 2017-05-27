const Moon = require("moonjs");
const himalaya = require("himalaya");
const toHTML = require("himalaya/translate").toHTML;
const selectorRE = /([\#\.\w\-\,\s\n\r\t:]+?)\s*(?=\s*\{)/g;

const id = require('./src/id.js');
const compileLanguage = require('./src/compile.js');

const compile = (name, component, options) => {
  // Parsed HTML Tree
  const tree = himalaya.parse(component);

  // Component Output
  let output = `var Moon = require("moonjs");var options = {};\n`;

  // Extract Items
  let template = undefined;
  let style = undefined;
  let script = undefined;

  for(let i = 0; i < tree.length; i++) {
    const node = tree[i];

    if(node.type === "Element") {
      const tagName = node.tagName;
      if(tagName === "template" && template === undefined) {
        template = node;
      } else if(tagName === "style" && style === undefined) {
        style = node;
      } else if(tagName === "script" && script === undefined) {
        script = node;
      }
    }
  }

  if(script !== undefined) {
    output += `options = (function(exports) {${compileLanguage(script.children[0].content, script.attributes.lang)} return exports;})({});\n`;
  }

  if(template !== undefined) {
    output += `options.render = ${Moon.compile(compileLanguage(template.children[0].content, template.attributes.lang)).toString().replace("function anonymous(h\n/**/)", "function(h)")}\n`;
  }

  if(style !== undefined) {
    const scoped = style.attributes.scoped === "scoped";
    style = compileLanguage(style.children[0].content, style.attributes.lang);

    if(scoped === true) {
      style = style.replace(selectorRE, `$1.${id(name)}`);
    }
  }

  if(options.hotReload === true) {
    output += `module.exports = `;
  } else {
    output += `module.exports = Moon.component("${name}", options);`;
  }

  return {
    component: output,
    style: style
  }
}

module.exports = compile;
