import postcssImport from "postcss-import";
import postcssNesting from "postcss-nesting/dist/index.mjs";
import postcssCustomMedia from "postcss-custom-media";
import postcssCustomSelectors from "postcss-custom-selectors";
import postcssMixins from "postcss-mixins";
import autoprefixer from "autoprefixer";

export default {
    css: {
        postcss: {
            plugins: [postcssImport, postcssNesting, postcssCustomMedia, postcssCustomSelectors, postcssMixins, autoprefixer]
        }
    }
}