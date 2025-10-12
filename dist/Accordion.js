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
const FlatList_1 = require("./FlatList");
const AccordionItem = () => null;
const Accordion = (_a) => {
    var { children, showIndex } = _a, props = __rest(_a, ["children", "showIndex"]);
    const refs = (0, react_1.useRef)([]);
    const lastIndex = (0, react_1.useRef)(null);
    return (<FlatList_1.FlatList removeClippedSubviews initialNumToRender={5} windowSize={10} nestedScrollEnabled scrollEnabled={false} {...props} data={react_1.default.Children.toArray(children)} keyExtractor={(_, i) => i.toString()} renderItem={({ item, index }) => <Collapse_1.Collapse {...item.props} ref={(ref) => {
                refs.current[index] = ref;
            }} trigger={(_a) => {
                var { onPress } = _a, rest = __rest(_a, ["onPress"]);
                const handlePress = (e) => {
                    var _a;
                    if (lastIndex.current !== null && lastIndex.current !== index) {
                        (_a = refs.current[lastIndex.current]) === null || _a === void 0 ? void 0 : _a.close();
                    }
                    lastIndex.current = index;
                    onPress === null || onPress === void 0 ? void 0 : onPress(e);
                };
                return item.props.trigger
                    ? item.props.trigger(Object.assign({ onPress: handlePress }, rest))
                    : null;
            }}/>}/>);
};
exports.Accordion = Accordion;
exports.Accordion.Item = AccordionItem;
//# sourceMappingURL=Accordion.js.map