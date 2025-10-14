"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceLocaleInfo = exports.getDeviceLanguage = exports.renderChild = exports.mergeTheme = exports.calcSize = void 0;
const Text_1 = require("../Text");
const react_1 = __importDefault(require("react"));
const calcSize = (size) => {
    const sizes = [1, 2, 3, 4, 5, 6];
    if (typeof size == "number" && sizes.includes(size))
        return size * 4;
    return size;
};
exports.calcSize = calcSize;
const mergeTheme = (libTheme, theme) => {
    const merge = Object.assign(Object.assign({}, theme), libTheme);
    Object.keys(merge).map(x => {
        Object.keys(libTheme[x]).map(y => {
            merge[x][y] = Object.assign(Object.assign({}, merge[x][y]), theme[x][y]);
        });
        Object.keys(theme[x]).map(y => {
            merge[x][y] = Object.assign(Object.assign({}, merge[x][y]), theme[x][y]);
        });
    });
    return merge;
};
exports.mergeTheme = mergeTheme;
const renderChild = (children, props) => react_1.default.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === 'number')
        return <Text_1.Text {...props}>{child}</Text_1.Text>;
    return child;
});
exports.renderChild = renderChild;
function getDeviceLanguage() {
    return Intl.DateTimeFormat().resolvedOptions().locale.split(/[-_]/)[0];
}
exports.getDeviceLanguage = getDeviceLanguage;
function getDeviceLocaleInfo(options = {}) {
    const formatter = new Intl.DateTimeFormat(undefined, options);
    return formatter.resolvedOptions();
}
exports.getDeviceLocaleInfo = getDeviceLocaleInfo;
