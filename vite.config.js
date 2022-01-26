import postcssImport from "postcss-import";
import postcssNesting from "postcss-nesting";
import postcssCustomMedia from "postcss-custom-media";
import postcssCustomSelectors from "postcss-custom-selectors";
import autoprefixer from "autoprefixer";

export default {
    css: {
        postcss: {
            plugins: [postcssImport, postcssNesting, postcssCustomMedia, postcssCustomSelectors, autoprefixer]
        }
    },
    build: {
        tuum: {
            styles: {
                input: "./node_modules/@newlogic-digital/ui/src/styles/!(tailwind).css"
            },
            scripts: {
                input: "./node_modules/@newlogic-digital/ui/src/scripts/*.js"
            }
        }
    }
}
