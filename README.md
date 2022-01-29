<a href="https://npmjs.com/package/tuum"><img src="https://img.shields.io/npm/v/tuum.svg" alt="npm package"></a>
<a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/tuum.svg" alt="node compatility"></a>

# 🛠 Tuum

Estonian word for "core", it should be set of tools to build modern web apps. 
It's also an alternative build approach with esbuild for Vite.

## Installation
```shell
npm i
```

## Build (esbuild)
```shell
npx tuum
```
or separately
```shell
npx tuum styles
npx tuum scripts
```

## Serve (vite)
```shell
npx vite
```

## Default config (vite.config.js)

```js
  tuum: {
    outDir: "./dist",
    styles: {
      input: "./main.css",
      plugins: [],
      cleanCss: {
        inline: [ 'all' ],
        level: { '1': { specialComments: 0 }, '2': { all: true } }
      }
    },
    scripts: {
      input: "./main.js",
      plugins: []
    }
  }
```
