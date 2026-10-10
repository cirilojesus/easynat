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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const react_1 = __importDefault(require("react"));
const useThemeProps_1 = require("./utils/useThemeProps");
const Box_1 = require("./Box");
const ProgressBar = (props) => {
    // Defaults → theme.components.ProgressBar → variante → props → plataforma
    const [_a] = (0, useThemeProps_1.useThemeProps)('ProgressBar', props, { defaults: { text: true, color: 'primary.100' } }), { variant: _variant } = _a, combinedProps = __rest(_a, ["variant"]);
    const { progress, color, text } = combinedProps;
    return (<Box_1.Box rounded={40} borderWidth={1} borderColor={'light.100'} overflow="hidden" w={'100%'} {...combinedProps} _text={Object.assign({ textAlign: "center", fontSize: 12 }, combinedProps._text)}>
            <Box_1.Box bg={color} w={`${progress}%`} position="absolute" maxW="100%" h="100%"/>
            {text === true ? progress + "%" : text}
        </Box_1.Box>);
};
exports.ProgressBar = ProgressBar;
