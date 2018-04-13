'use strict';

const assert = require('assert');
const assign = require('object-assign');

const inferMediaFromCSSFilename = (filename) => {
    const matches = filename.match(/\bmedia_([A-Z0-9=]*)/i);

    if (matches) {
        // Node 5.10+
        if (typeof Buffer.from === 'function') {
            return Buffer.from(matches[1], 'base64');
        }

        // older Node versions
        return new Buffer(matches[1], 'base64');
    }

    return false;
};

const isStylesheetLink = (def) => def.tagName === 'link' && def.attributes.rel === 'stylesheet';

const addMediaAttribute = (definition) => {
    if (isStylesheetLink(definition) && definition.attributes.href) {
        return assign({}, definition, {
            attributes: assign({}, definition.attributes, {
                media: inferMediaFromCSSFilename(definition.attributes.href),
            }),
        });
    }

    return definition;
};

class LinkMediaHTMLWebpackPlugin {
    constructor(options) {
        assert.equal(options, undefined, 'The LinkMediaHTMLWebpackPlugin does not accept any options');
    }

    apply(compiler) {
				// Hook into the html-webpack-plugin processing
				compiler.hooks.compilation.tap('LinkMediaHtmlWebpackPlugin', (compilation) => {
            compilation.hooks.htmlWebpackPluginAlterAssetTags.tap('LinkMediaHtmlWebpackPlugin', (htmlPluginData) => {
                return assign({}, htmlPluginData, {
                    body: htmlPluginData.body.map(addMediaAttribute),
                    head: htmlPluginData.head.map(addMediaAttribute),
                });
            });
        });
    }
}

module.exports = LinkMediaHTMLWebpackPlugin;
