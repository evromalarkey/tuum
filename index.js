#!/usr/bin/env node
import esbuild from "esbuild";
import postCssPlugin from "esbuild-plugin-postcss2";
import CleanCSS from "clean-css";
import glob from "tiny-glob";
import fs from "fs";
import path from "path";
import fse from "fs-extra";
import lodash from "lodash";
import assetsManifest from "esbuild-plugin-assets-manifest";

const configPath = path.join(process.cwd(), "./vite.config.js");
const config = {
    tuum: {
        outDir: "./dist",
        assetsDir: "assets",
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
};

if (fs.existsSync(configPath)) {
    lodash.merge(config, (await import(configPath)).default)
}

const inputStyles = config.tuum.styles.input;
const inputScripts = config.tuum.scripts.input;
const outputDir = config.tuum.outDir;
const postcssPlugins = typeof config?.css?.postcss?.plugins !== 'undefined' ? config.css.postcss.plugins : [];

if (!fs.existsSync(path.join(outputDir, config.tuum.assetsDir))){
    fs.mkdirSync(path.join(outputDir, config.tuum.assetsDir));
} else {
    fse.emptyDirSync(path.join(outputDir, config.tuum.assetsDir));
}

async function Styles(input, output) {
    let start = new Date();

    let entryPoints = await glob(input);

    const result = await esbuild.build({
        entryPoints,
        plugins: [
            postCssPlugin.default({
                plugins: postcssPlugins
            }),
            assetsManifest({
                filename: `manifest.css.json`,
                path: output
            })
        ].concat(config.tuum.styles.plugins),
        metafile: true,
        entryNames: '[name].[hash]',
        outdir: path.join(outputDir, config.tuum.assetsDir),
        write: false
    });

    for (let out of result.outputFiles) {
        new CleanCSS(config.tuum.styles.cleanCss).minify(out.text, (errors, css) => {
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
        plugins: [
            assetsManifest({
                filename: `manifest.js.json`,
                path: output
            })
        ].concat(config.tuum.scripts.plugins),
        assetNames: '[name].[hash]',
        chunkNames: '[name].[hash]',
        entryNames: '[name].[hash]',
        metafile: true,
        outdir: path.join(outputDir, config.tuum.assetsDir),
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

async function JoinManifest() {
    return new Promise(resolve => {
        const manifestStyles = JSON.parse(fs.readFileSync(path.join(outputDir, "manifest.css.json")).toString())
        const manifestScripts = JSON.parse(fs.readFileSync(path.join(outputDir, "manifest.js.json")).toString())
        const manifest = lodash.merge(manifestStyles, manifestScripts)

        fs.unlinkSync(path.join(outputDir, "manifest.css.json"))
        fs.unlinkSync(path.join(outputDir, "manifest.js.json"))

        fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest))

        resolve()
    })
}

await Styles(inputStyles, outputDir)
await Scripts(inputScripts, outputDir)
await JoinManifest()


