# Moon Component Compiler

Compiler for Moon Single File Components

### Single File Components

Single file components are a way to declare Moon components. Each can have a top level `template`, `style`, and `script` tag.

For example:

```html
<template>
  <div>
    <h1>Component!</h1>
    <p>{{someProp}}</p>
  </div>
</template>

<style lang="stylus" scoped>
h1
  color blue
</style>

<script>
exports = {
  props: ['someProp']
}
</script>
```

As you can see, you can have scoped CSS, preprocessors, and organize your code!

### Compiling

To compile a single file component (a `.moon`file), you can do:

```js
const compile = require("moon-component-compiler");
const compiled = compile("Head", component, {
  hotReload: true
});
```

The result will be an object containing:

* The Moon component, exported through `module.exports`;
* The styles extracted from the component

For example:

```js
{
  component: "",
  style: ""
}
```

### License

Licensed under the [MIT License](https://kbrsh.github.io/license) by [Kabir Shah](https://kabir.ml)
