import esbuild from "esbuild";
import postCssPlugin from "esbuild-plugin-postcss2";
import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssNesting from "postcss-nesting/dist/index.mjs";
import postcssCustomSelectors from "postcss-custom-selectors";
import postcssCustomMedia from "postcss-custom-media";
import postcssMixins from "postcss-mixins";
import CleanCSS from "clean-css";
import glob from "tiny-glob";
import fs from "fs";
import fse from "fs-extra";
import config from "./config.js";


const inputStyles = config.styles.input;
const inputScripts = config.scripts.input;
const outputDir = config.outputDir;

const type = process.argv[2];

let postcssPlugins = [postcssImport, postcssNesting, postcssCustomMedia, postcssCustomSelectors, postcssMixins, autoprefixer]

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
} else {
    fse.emptyDirSync(outputDir);
}

async function Styles(input, output) {
    let start = new Date();

    let entryPoints = await glob(input);

    const result = await esbuild.build({
        entryPoints,
        plugins: [
            postCssPlugin.default({
                plugins: postcssPlugins
            })
        ],
        entryNames: '[name].[hash]',
        outdir: output,
        write: false
    });

    for (let out of result.outputFiles) {
        new CleanCSS({
            inline: [ 'all' ],
            level: { '1': { specialComments: 0 }, '2': { all: true } }
        }).minify(out.text, (errors, css) => {
            css.warnings.length !== 0 && console.log(css.warnings);

            fs.writeFileSync(out.path, css.styles, 'utf8');
        });
    }

    setTimeout(() => console.info("\x1b[34m", `styles`, "\x1b[33m", `${new Date() - start}ms`, "\x1b[0m"), 1);
}

async function Scripts(input, output) {
    let start = new Date();

    let entryPoints = await glob(input);

    const result = await esbuild.build({
        entryPoints,
        assetNames: '[name].[hash]',
        chunkNames: '[name].[hash]',
        entryNames: '[name].[hash]',
        outdir: output,
        format: 'esm',
        splitting: true,
        minify: true,
        bundle: true,
        write: false
    });

    for (let out of result.outputFiles) {
        fs.writeFileSync(out.path, out.text, 'utf8');
    }

    setTimeout(() => console.info("\x1b[34m", `scripts`, "\x1b[33m", `${new Date() - start}ms`, "\x1b[0m"), 1);
}

type === "styles" && Styles(inputStyles, outputDir)

type === "scripts" && Scripts(inputScripts, outputDir)

if (typeof type === "undefined") {
    await Styles(inputStyles, outputDir)
    await Scripts(inputScripts, outputDir)
}