import esbuild from "esbuild";
import postCssPlugin from "esbuild-plugin-postcss2";
import CleanCSS from "clean-css";
import glob from "tiny-glob";
import fs from "fs";
import path from "path";
import fse from "fs-extra";
import lodash from "lodash";

const type = process.argv[2];
const configPath = path.join(process.cwd(), "./vite.config.js");
const config = {
    build: {
        tuum: {
            outDir: "./dist",
            styles: {
                input: "./main.js",
                plugins: []
            },
            scripts: {
                input: "./main.css",
                plugins: []
            }
        }
    }
};

if (fs.existsSync(configPath)) {
    lodash.merge(config, (await import(configPath)).default)
}

const inputStyles = config.build.tuum.styles.input;
const inputScripts = config.build.tuum.scripts.input;
const outputDir = config.build.tuum.outDir;
const postcssPlugins = typeof config?.css?.postcss?.plugins !== 'undefined' ? config.css.postcss.plugins : [];

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
        ].concat(config.build.tuum.styles.plugins),
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
        plugins: config.build.tuum.scripts.plugins,
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
