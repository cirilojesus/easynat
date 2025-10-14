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
exports.RenderHTML = exports.renderHTML = void 0;
const ScrollView_1 = require("./ScrollView");
const Text_1 = require("./Text");
const Box_1 = require("./Box");
// ---------- Helpers ----------
const fontSizeMap = {
    "1": 10,
    "2": 12,
    "3": 14,
    "4": 18,
    "5": 24,
    "6": 32,
    "7": 48,
};
const justifyContentMap = {
    center: "center",
    right: "flex-end",
    left: "flex-start",
};
const htmlEntities = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
};
const parseAttributes = (str) => Object.fromEntries([...str.matchAll(/([a-zA-Z0-9-]+)\s*=\s*"(.*?)"/g)].map(([_, key, value]) => {
    if (key === "style") {
        return [
            key,
            Object.fromEntries(value
                .replace(/\s+/g, "")
                .split(";")
                .filter(Boolean)
                .map((x) => x.split(":").map((y) => y.trim()))),
        ];
    }
    return [key, value];
}));
function renderHTML(html) {
    const tagRegex = /<\/?([a-zA-Z1-6]+)([^>]*)>|([^<]+)/g;
    const selfClosing = /^(br|img|input|hr|meta|link|source|track|wbr|area|base|col|embed|param)$/i;
    const stack = [];
    let current = { name: "root", attrs: {}, children: [] };
    html.replace(tagRegex, (match, tagName, attrs, textContent) => {
        var _a, _b, _c, _d, _e, _f;
        if (textContent) {
            current.children.push(<Text_1.Text key={current.children.length}>
                    {textContent.replace(/&[a-zA-Z0-9#]+;/g, (m) => htmlEntities[m] || m)}
                </Text_1.Text>);
        }
        else if (tagName) {
            if (match.startsWith("</")) {
                const parent = stack.pop();
                parent === null || parent === void 0 ? void 0 : parent.children.push(renderNode(current));
                current = parent;
            }
            else {
                // Mutaciones de atributos según tag actual
                if (tagName === "li" && current.name === "ol")
                    attrs += ' type="ol"';
                if (tagName === "font" && ((_b = (_a = current.attrs) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b["text-align"]))
                    attrs += ` text-align="${current.attrs["style"]["text-align"]}"`;
                if (["b", "strong"].includes(tagName) || ((_c = current.attrs) === null || _c === void 0 ? void 0 : _c["bold"]))
                    attrs += ' bold="true"';
                if (["i", "em"].includes(tagName) || ((_d = current.attrs) === null || _d === void 0 ? void 0 : _d["italic"]))
                    attrs += ' italic="true"';
                if (tagName === "u" || ((_e = current.attrs) === null || _e === void 0 ? void 0 : _e["underline"]))
                    attrs += ' underline="true"';
                if (["strike", "s"].includes(tagName) || ((_f = current.attrs) === null || _f === void 0 ? void 0 : _f["strikeThrough"]))
                    attrs += ' strikeThrough="true"';
                const newNode = {
                    name: tagName,
                    attrs: parseAttributes(attrs),
                    children: [],
                };
                stack.push(current);
                current = newNode;
                if (selfClosing.test(tagName)) {
                    const parent = stack.pop();
                    parent === null || parent === void 0 ? void 0 : parent.children.push(renderNode(current));
                    current = parent;
                }
            }
        }
        return "";
    });
    return current.children;
}
exports.renderHTML = renderHTML;
// --- Render de cada nodo ---
function renderNode(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const key = Math.random().toString(36).slice(2); // o un contador global
    const size = fontSizeMap[String(parseFloat((_a = node.attrs) === null || _a === void 0 ? void 0 : _a.size) || 3)];
    const lineHeight = size > 14 ? size + 3 : size < 14 ? size * 2 : undefined;
    switch (node.name) {
        case "div":
            return (<Box_1.Box key={key} w="100%" flexWrap="wrap" flexDir="row" justifyContent={justifyContentMap[(_c = (_b = node.attrs) === null || _b === void 0 ? void 0 : _b.style) === null || _c === void 0 ? void 0 : _c["text-align"]]}>
                    {node.children}
                </Box_1.Box>);
        case "font":
        case "p":
            return (<Text_1.Text key={key} fontSize={size} lineHeight={lineHeight} textAlign={(_d = node.attrs) === null || _d === void 0 ? void 0 : _d["text-align"]}>
                    {node.children}
                </Text_1.Text>);
        case "b":
        case "strong":
        case "i":
        case "em":
        case "u":
        case "strike":
        case "s":
            return (<Text_1.Text key={key} style={{
                    fontWeight: ((_e = node.attrs) === null || _e === void 0 ? void 0 : _e["bold"]) ? "700" : "400",
                    fontStyle: ((_f = node.attrs) === null || _f === void 0 ? void 0 : _f["italic"]) ? "italic" : "normal",
                    textDecorationLine: ((_g = node.attrs) === null || _g === void 0 ? void 0 : _g["underline"])
                        ? "underline"
                        : ((_h = node.attrs) === null || _h === void 0 ? void 0 : _h["strikeThrough"])
                            ? "line-through"
                            : "none",
                }}>
                    {node.children}
                </Text_1.Text>);
        case "ul":
        case "ol":
            return (<Box_1.Box key={key} w="100%">
                    {node.children}
                </Box_1.Box>);
        case "li":
            return (<Box_1.Box key={key} flexDir="row" _text={{
                    mr: 1,
                    w: 5,
                    textAlign: "right",
                }}>
                    {((_j = node.attrs) === null || _j === void 0 ? void 0 : _j.type) === "ol" ? node.children.length + "." : "● "}
                    {node.children}
                </Box_1.Box>);
        case "input":
            return (<Box_1.Box key={key} borderWidth={1} rounded={5} px={1} mr={1} _text={{ color: "white", fontWeight: "bold" }} bg={((_k = node.attrs) === null || _k === void 0 ? void 0 : _k.checked) == '' ? 'primary' : "transparent"}>
                    ✓
                </Box_1.Box>);
        case "br":
            return <Box_1.Box key={key} w="100%" children=" "/>;
        default:
            return <Box_1.Box key={key}>{node.children}</Box_1.Box>;
    }
}
// ---------- Componente principal ----------
const RenderHTML = (_a) => {
    var props = __rest(_a, []);
    return (<ScrollView_1.ScrollView _android={{ removeClippedSubviews: true }} bounces={false} overScrollMode="never" {...props}>
            {renderHTML(props.html)}
        </ScrollView_1.ScrollView>);
};
exports.RenderHTML = RenderHTML;
