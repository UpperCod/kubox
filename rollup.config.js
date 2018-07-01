import buble from "rollup-plugin-buble";

export default {
    input: "src/index.js",
    output: [
        {
            file: "build/kubox.js",
            format: "iife",
            name: "Kubox"
        },
        {
            file: "build/kubox.umd.js",
            format: "umd",
            name: "Kubox"
        },
        {
            file: "build/kubox.cjs.js",
            format: "cjs"
        },
        {
            file: "build/kubox.es.js",
            format: "es"
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
