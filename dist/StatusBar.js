"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBar = void 0;
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const StatusBar = (_a) => {
    var props = __rest(_a, []);
    const { theme } = (0, theme_provider_1.useTheme)();
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    return (<react_native_1.StatusBar backgroundColor={theme.colors[combinedProps.bg] || combinedProps.bg || 'transparent'} translucent {...combinedProps}/>);
};
exports.StatusBar = StatusBar;
