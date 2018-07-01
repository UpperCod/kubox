import buble from "rollup-plugin-buble";

export default {
    input: "src/index.js",
    output: [
        {
            file: "dist/iife.js",
            format: "iife",
            name: "KuboxPreact"
        },
        {
            file: "dist/umd.js",
            format: "umd",
            name: "KuboxPreact"
        },
        {
            file: "dist/cjs.js",
            format: "cjs"
        }
    ],
    sourceMap: true,
    external: ["preact"],
    watch: {
        chokidar: {},
        exclude: ["node_modules/**"]
    },
    plugins: [
        buble({
            objectAssign: "Object.assign"
        })
    ]
};
