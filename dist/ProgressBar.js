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
exports.ProgressBar = void 0;
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const Box_1 = require("./Box");
const ProgressBar = (_a) => {
    var props = __rest(_a, []);
    const { theme } = (0, theme_provider_1.useTheme)();
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({ text: true }, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const { progress, color, text } = combinedProps;
    return (<Box_1.Box rounded={40} borderWidth={1} borderColor={'light'} overflow="hidden" _text={{ textAlign: "center" }} w={100} {...props}>
            <Box_1.Box bg={color} w={`${progress}%`} position="absolute" maxW="100%" h="100%"/>
            {text === true ? progress + "%" : text}
        </Box_1.Box>);
};
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=ProgressBar.js.map