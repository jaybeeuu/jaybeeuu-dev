"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var chokidar_1 = __importDefault(require("chokidar"));
var getopts_1 = __importDefault(require("getopts"));
var log = __importStar(require("../log"));
var posts_1 = require("../posts");
var debounce_1 = __importDefault(require("../utility/debounce"));
var options = getopts_1["default"](process.argv, {
    alias: {
        manifestFileName: "m",
        outputDir: "o",
        sourceDir: "s",
        watch: "w"
    },
    "default": {
        manifestFileName: "manifest.json",
        outputDir: "./lib",
        sourceDir: "./src",
        watch: false
    }
});
if (options.watch) {
    log.info("Starting compost in watch mode...");
    chokidar_1["default"].watch(options.sourceDir).on("all", debounce_1["default"](function () {
        log.info("Rebuilding posts...");
        posts_1.update(options);
    }, 1500));
}
else {
    log.info("Composting...");
    posts_1.update(options);
}
//# sourceMappingURL=compost.js.map