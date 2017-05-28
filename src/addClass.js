module.exports = (node, name) => {
  if(node.type === "Element") {
    const attributes = node.attributes;
    if(attributes.className === undefined) {
      attributes.className = [name];
    } else {
      attributes.className.push(name);
    }

    const children = node.children;
    for(var i = 0; i < children.length; i++) {
      module.exports(children[i], name);
    }
  }
}
