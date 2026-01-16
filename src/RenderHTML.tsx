import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSScrollViewProps, ScrollView } from "./ScrollView";
import { Text } from "./Text";
import { Box } from "./Box";

export type EARenderHTMLProps = BSScrollViewProps & BSDefaultProps & {
    html: string;
    _ios?: EARenderHTMLProps;
    _android?: EARenderHTMLProps;
    _web?: EARenderHTMLProps;
};

// ---------- Helpers ----------
const fontSizeMap: Record<string, number> = {
    "1": 10,
    "2": 12,
    "3": 14,
    "4": 18,
    "5": 24,
    "6": 32,
    "7": 48,
};

const justifyContentMap: Record<string, "center" | "flex-end" | "flex-start" | "space-between" | "space-around" | "space-evenly"> = {
    center: "center",
    right: "flex-end",
    left: "flex-start",
};

const htmlEntities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
};

type NodeCtx = {
    name: string;
    attrs: Record<string, any>;
    children: React.ReactNode[];
};

const parseAttributes = (str: string) => Object.fromEntries(
    [...str.matchAll(/([a-zA-Z0-9-]+)\s*=\s*"(.*?)"/g)].map(([_, key, value]) => {
        if (key === "style") {
            return [
                key,
                Object.fromEntries(
                    value
                        .replace(/\s+/g, "")
                        .split(";")
                        .filter(Boolean)
                        .map((x) => x.split(":").map((y) => y.trim()))
                ),
            ];
        }
        return [key, value];
    })
);

export function renderHTML(html: string): React.ReactNode[] {
    const tagRegex = /<\/?([a-zA-Z1-6]+)([^>]*)>|([^<]+)/g;
    const selfClosing = /^(br|img|input|hr|meta|link|source|track|wbr|area|base|col|embed|param)$/i;

    const stack: NodeCtx[] = [];
    let current: NodeCtx = { name: "root", attrs: {}, children: [] };

    html.replace(tagRegex, (match, tagName, attrs, textContent) => {
        if (textContent) {
            current.children.push(
                <Text key={current.children.length}>
                    {textContent.replace(/&[a-zA-Z0-9#]+;/g, (m) => htmlEntities[m] || m)}
                </Text>
            );
        } else if (tagName) {
            if (match.startsWith("</")) {
                const parent = stack.pop();
                parent?.children.push(renderNode(current));
                current = parent!;
            } else {
                // Mutaciones de atributos según tag actual
                if (tagName === "li" && current.name === "ol") attrs += ' type="ol"';
                if (tagName === "font" && current.attrs?.style?.["text-align"])
                    attrs += ` text-align="${current.attrs["style"]["text-align"]}"`;
                if (["b", "strong"].includes(tagName) || current.attrs?.["bold"])
                    attrs += ' bold="true"';
                if (["i", "em"].includes(tagName) || current.attrs?.["italic"])
                    attrs += ' italic="true"';
                if (tagName === "u" || current.attrs?.["underline"])
                    attrs += ' underline="true"';
                if (["strike", "s"].includes(tagName) || current.attrs?.["strikeThrough"])
                    attrs += ' strikeThrough="true"';

                const newNode: NodeCtx = {
                    name: tagName,
                    attrs: parseAttributes(attrs),
                    children: [],
                };
                stack.push(current);
                current = newNode;

                if (selfClosing.test(tagName)) {
                    const parent = stack.pop();
                    parent?.children.push(renderNode(current));
                    current = parent!;
                }
            }
        }
        return "";
    });

    return current.children;
}

// --- Render de cada nodo ---
function renderNode(node: { name: string; attrs: any; children: React.ReactNode[] }): React.ReactNode {
    const key = Math.random().toString(36).slice(2); // o un contador global
    const size = fontSizeMap[String(parseFloat(node.attrs?.size) || 3)];
    const lineHeight = size > 14 ? size + 3 : size < 14 ? size * 2 : undefined;

    switch (node.name) {
        case "div":
            return (
                <Box
                    key={key}
                    w="100%"
                    flexWrap="wrap"
                    flexDir="row"
                    justifyContent={justifyContentMap[node.attrs?.style?.["text-align"]]}
                >
                    {node.children}
                </Box>
            );
        case "font":
        case "p":
            return (
                <Text key={key} fontSize={size} lineHeight={lineHeight} textAlign={node.attrs?.["text-align"]}>
                    {node.children}
                </Text>
            );
        case "b":
        case "strong":
        case "i":
        case "em":
        case "u":
        case "strike":
        case "s":
            return (
                <Text
                    key={key}
                    style={{
                        fontWeight: node.attrs?.["bold"] ? "700" : "400",
                        fontStyle: node.attrs?.["italic"] ? "italic" : "normal",
                        textDecorationLine: node.attrs?.["underline"]
                            ? "underline"
                            : node.attrs?.["strikeThrough"]
                                ? "line-through"
                                : "none",
                    }}>
                    {node.children}
                </Text>
            );
        case "ul":
        case "ol":
            return (
                <Box key={key} w="100%">
                    {node.children}
                </Box>
            );
        case "li":
            return (
                <Box
                    key={key}
                    flexDir="row"
                    _text={{
                        mr: 1,
                        w: 5,
                        textAlign: "right",
                    }}>
                    {node.attrs?.type === "ol" ? node.children.length + "." : "● "}
                    {node.children}
                </Box>
            );
        case "input":
            return (
                <Box
                    key={key}
                    borderWidth={1}
                    rounded={5}
                    px={1}
                    mr={1}
                    _text={{ color: "white", fontWeight: "bold" }}
                    bg={node.attrs?.checked == '' ? 'primary.100' : "transparent"}>
                    ✓
                </Box>
            );
        case "br":
            return <Box key={key} w="100%" children=" " />;
        default:
            return <Box key={key}>{node.children}</Box>;
    }
}

// ---------- Componente principal ----------
export const RenderHTML: React.FC<EARenderHTMLProps> = ({ ...props }) => {

    return (
        <ScrollView
            _android={{ removeClippedSubviews: true }}
            bounces={false}
            overScrollMode="never"
            {...props}
        >
            {renderHTML(props.html)}
        </ScrollView>
    );
};
