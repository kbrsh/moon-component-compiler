const compilers = require("./compilers.js");
const error = require("./error.js");

module.exports = (item, lang) => {
  if(lang === undefined) {
    return item;
  } else {
    const compile = compilers[lang];
    if(compile === undefined) {
      error(`Unknown language: ${lang}`);
    } else {
      return compile(item);
    }
  }
}
