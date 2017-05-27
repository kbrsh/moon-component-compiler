const htmlparser = require("htmlparser");

const compile = (component, options) => {
  const tree = htmlparser(component);
}

module.exports = compile;
