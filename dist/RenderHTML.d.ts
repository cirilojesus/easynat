import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSScrollViewProps } from "./ScrollView";
export type EARenderHTMLProps = BSScrollViewProps & BSDefaultProps & {
    html: string;
    _ios?: EARenderHTMLProps;
    _android?: EARenderHTMLProps;
    _web?: EARenderHTMLProps;
};
export declare function renderHTML(html: string): React.ReactNode[];
export declare const RenderHTML: React.FC<EARenderHTMLProps>;
