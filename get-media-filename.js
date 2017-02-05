const fs = require('fs');
const path = require('path');

/**
 * Grabs the first @media declaration in the source file and returns the given filename with
 * the media_base64mediastring added to it.
 *
 * @example
 * ```js
 * const getMediaFileName = require('link-media-html-webpack-plugin/get-media-filename');
 *
 * getMediaFileName('./style.css'); // returns 'style.media_cHJpbnQ=.css'
 * ```
 */
module.exports = (filepath) => {
    const source = fs.readFileSync(filepath, 'utf8');
    const media = source.match(/@media (.*?) \{/);

    if (media) {
        const frags = path.basename(filepath).split('.');

        frags.splice(frags.length - 1, 0, `media_${new Buffer(media[1]).toString('base64')}`);

        return frags.join('.');
    }
};
