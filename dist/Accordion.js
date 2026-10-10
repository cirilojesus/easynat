"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.Accordion = void 0;
const react_1 = __importStar(require("react"));
const Collapse_1 = require("./Collapse");
const Box_1 = require("./Box");
const useThemeProps_1 = require("./utils/useThemeProps");
const AccordionItem = () => null;
const toList = (v) => (v == null ? [] : Array.isArray(v) ? v : v < 0 ? [] : [v]);
const Accordion = (rawProps) => {
    // Defaults → theme.components.Accordion → variante → props → plataforma (el variant no pasa al Box)
    const [_a] = (0, useThemeProps_1.useThemeProps)('Accordion', rawProps, { defaults: { gap: 8 } }), { children, defaultIndex, showIndex, index, onChange, allowMultiple, variant: _variant } = _a, props = __rest(_a, ["children", "defaultIndex", "showIndex", "index", "onChange", "allowMultiple", "variant"]);
    // Cada item es un Collapse controlado: el Accordion decide cuáles están abiertos
    const [inner, setInner] = (0, react_1.useState)(() => toList(defaultIndex !== null && defaultIndex !== void 0 ? defaultIndex : showIndex));
    const openList = index !== undefined ? toList(index) : inner;
    const toggle = (i, open) => {
        var _a;
        const next = open
            ? (allowMultiple ? [...openList.filter(x => x !== i), i] : [i])
            : openList.filter(x => x !== i);
        if (index === undefined)
            setInner(next);
        onChange === null || onChange === void 0 ? void 0 : onChange(allowMultiple ? next : ((_a = next[0]) !== null && _a !== void 0 ? _a : -1));
    };
    const items = react_1.default.Children.toArray(children).filter(react_1.default.isValidElement);
    return (<Box_1.Box {...props}>
            {items.map((item, i) => {
            var _a;
            return (<Collapse_1.Collapse key={(_a = item.key) !== null && _a !== void 0 ? _a : i} {...item.props} isOpen={openList.includes(i)} onChange={open => {
                    var _a, _b;
                    toggle(i, open);
                    (_b = (_a = item.props).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, open);
                }}/>);
        })}
        </Box_1.Box>);
};
exports.Accordion = Accordion;
exports.Accordion.Item = AccordionItem;
