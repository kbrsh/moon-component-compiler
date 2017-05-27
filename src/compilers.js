module.exports = {
  pug: function(str) {
    return require("pug").compile(str, {})();
  },
  stylus: function(str) {
    return require("stylus")(str).render();
  },
  babel: function(str) {
    const babel = require("babel-core");
    const babelConfigPath = path.join(process.cwd(), '.babelrc');
    const babelOptions = fs.existsSync(babelConfigPath) ? json.parse(fs.readFileSync(babelConfigPath, 'utf-8')) : {
      presets: ['es2015-nostrict']
    }
    return babel.transform(str, babelOptions).code;
  }
}
