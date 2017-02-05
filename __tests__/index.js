const fs = require('fs');
const path = require('path');
const MemoryFileSystem = require('memory-fs');
const webpack = require('webpack');
const ExtractPlugin = require('extract-text-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const LinkMediaHTMLPlugin = require('../');
const getMediaFilename = require('../get-media-filename');

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, '../dist');

describe('file name creator utility', () => {
    it('correctly extracts and encodes the media rule from the given source file', () => {
        expect(
            getMediaFilename(path.join(FIXTURE_DIR, 'style.print.css'))
        ).toBe('style.print.media_cHJpbnQ=.css');
    });
});

describe('LinkMediaHTMLPlugin', () => {
    it('adds media attributes to link tags of CSS assets with annotated filenames', (done) => {
        const mainStyleExtractor = new ExtractPlugin('style.css');
        const printStyleExtractor = new ExtractPlugin(getMediaFilename(path.join(FIXTURE_DIR, 'style.print.css')));

        const expected = fs.readFileSync(path.resolve(FIXTURE_DIR, 'expected.html')).toString().trim();
        const compiler = webpack({
            entry: path.join(FIXTURE_DIR, 'entry.js'),
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
        }, (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            expect(result.compilation.assets['index.html'].source().trim()).toBe(expected);
            done();
        });

        compiler.outputFileSystem = new MemoryFileSystem();
    });
});
