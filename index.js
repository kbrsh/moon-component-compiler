const Moon = require("moonjs");
const himalaya = require("himalaya");
const toHTML = require("himalaya/translate").toHTML;

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
        const children = node.children;
        if(children.length !== 0) {
          template = toHTML(node.children[0]);
        }
      } else if(tagName === "style" && style === undefined) {
        const children = node.children;
        if(children.length !== 0) {
          style = toHTML(node.children[0]);
        }
      } else if(tagName === "script" && script === undefined) {
        const children = node.children;
        if(children.length !== 0) {
          script = toHTML(node.children[0]);
        }
      }
    }
  }

  if(script !== undefined) {
    output += `options = (function(exports) {${script} return exports;})({});\n`;
  }

  if(template !== undefined) {
    output += `options.render = ${Moon.compile(template).toString().replace("function anonymous(h\n/**/)", "function(h)")}\n`;
  }

  if(style !== undefined) {
    output +=
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
