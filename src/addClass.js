const whiteSpaceStartRE = /^\s*/;

module.exports = (node, name) => {
  if(node.type === "Element") {
    const attributes = node.attributes;
    let classNameArr = attributes.className;
    const classNameLiteral = attributes["mLiteral:class"];

    if(classNameArr === undefined && classNameLiteral === undefined) {
      attributes.className = [name];
    } else if(classNameLiteral !== undefined) {
      const type = classNameLiteral.replace(whiteSpaceStartRE, "")[0];

      if(type === "[") {
        className = `${classNameLiteral.substring(0, classNameLiteral.length - 1)}, "${name}"]`;
      } else if(type === "{") {
        className = `${classNameLiteral.substring(0, classNameLiteral.length - 1)}, "${name}": true}`;
      }

      attributes["mLiteral:class"] = className;
    } else {
      classNameArr.push(name);
    }

    const children = node.children;
    for(var i = 0; i < children.length; i++) {
      module.exports(children[i], name);
    }
  }
}
