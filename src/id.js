module.exports = (name) => {
  name = name.split('').map((char) => {
    return char.charCodeAt(0);
  });
  name = name.reduce(function(prev, curr){
    return ((prev << 5) + prev) + curr;
  }, 5381);
  return name.toString(36);
}
