Link Media HTML Webpack Plugin
==============================

[![Build Status](https://travis-ci.org/yaycmyk/link-media-html-webpack-plugin.svg?branch=master)](https://travis-ci.org/yaycmyk/link-media-html-webpack-plugin) [![codecov](https://codecov.io/gh/yaycmyk/link-media-html-webpack-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/yaycmyk/link-media-html-webpack-plugin)


This is an extension plugin for the [webpack](http://webpack.github.io) plugin [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin).

It automatically adds the [media attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#Attributes) to generated `<link>` HTML elements, inferred from the CSS filename according to the pattern `media_{base64MediaString}`:

```
style.media_KG1pbi13aWR0aDogNzAwcHgpLCBoYW5kaGVsZCBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUp.css

will be injected into the HTML template as:

<link src="styles.media_KG1pbi13aWR0aDogNzAwcHgpLCBoYW5kaGVsZCBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUp.css" rel="stylesheet" media="(min-width: 700px), handheld and (orientation: landscape)" />
```

This is useful for print stylesheets or desktop/mobile-specific styles that the browser should only load depending on the @media match.

Installation
------------

You must be running webpack on node 4.x or higher

Install the plugin with npm:

```shell
$ npm install --save-dev link-media-html-webpack-plugin
```

Basic Usage
-----------

Load the plugin

```js
const LinkMediaHtmlWebpackPlugin = require('link-media-html-webpack-plugin');
```

and add it to your webpack config as follows:

```js
plugins: [
    new HtmlWebpackPlugin(),
    new LinkMediaHtmlWebpackPlugin(),
]
```

you'll probably want to use this in conjunction with [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin) to split up the loaded assets so the browser can do its thing. Here's a sample webpack 2.x config:

```js
const path = require('path');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const LinkMediaHTMLPlugin = require('link-media-html-webpack-plugin');

const ExtractPlugin = require('extract-text-webpack-plugin');

// a utility provided by this plugin for easily forming the requisite filename syntax
const getMediaFilename = require('link-media-html-webpack-plugin/get-media-filename');

const getFilePath = (filename) => path.join(__dirname, 'src', filename);

const mainStyleExtractor = new ExtractPlugin('style.css');
const printStyleExtractor = new ExtractPlugin(getMediaFilename(getFilePath('style.print.css')));

webpack({
    entry: getFilePath('entry.js'),
    module: {
      loaders: [
        {
            test: /print\.css$/,
            use: printStyleExtractor.extract('css-loader'),
        }, {
            test: /\.css$/,
            exclude: /print\.css$/,
            use: mainStyleExtractor.extract('css-loader'),
        },
      ],
    },
    output: {
        path: OUTPUT_DIR,
    },
    plugins: [
        mainStyleExtractor,
        printStyleExtractor,
        new HTMLPlugin({
            minify: {
                collapseWhitespace: true,
            },
        }),
        new LinkMediaHTMLPlugin(),
    ],
});
```
