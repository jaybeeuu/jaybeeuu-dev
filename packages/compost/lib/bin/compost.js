"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var getopts_1 = __importDefault(require("getopts"));
var posts_1 = require("../posts");
var options = getopts_1["default"](process.argv, {
    alias: {
        manifestFileName: "m",
        outputDir: "o",
        sourceDir: "s"
    },
    "default": {
        manifestFileName: "post-manifest.json",
        outputDir: "./lib",
        sourceDir: "./src"
    }
});
posts_1.update(options);
//# sourceMappingURL=compost.js.map