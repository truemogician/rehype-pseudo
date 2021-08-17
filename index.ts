import "basic-type-extensions";
import Lexer from "pseudocode/src/Lexer.js";
import Parser from "pseudocode/src/Parser.js";
import Renderer from "pseudocode/src/Renderer.js";
import { unified, Plugin, Transformer } from "unified";
import { Root, Element } from "hast";
import { toString as htmlAstToString } from "hast-util-to-string";
import { visit } from "unist-util-visit";
import parseHtml from "rehype-parse";

export interface PseudoOptions {
	/**
	 * The indent size of inside a control block, e.g. if, for, etc. The unit must be in 'em'. Default value: '1.2em'.
	 */
	identSize?: string;
	/**
	 * The delimiters used to start and end a comment region. Note that only line comments are supported. Default value: '//'.
	 */
	commentDelimiter?: string;
	/**
	 * The punctuation that follows line number. Default value: ':'.
	 */
	lineNumberPunc?: string;
	/**
	 * Whether line numbering is enabled. Default value: false.
	 */
	lineNumber?: boolean;
	/**
	 * Whether block ending, like `end if`, end `procedure`, etc., are showned. Default value: false.
	 */
	noEnd?: boolean;
	/**
	 * Set the caption counter to this new value.
	 */
	captionCount?: number;
	/**
	 * The prefix in the title of the algorithm. Default value: 'Algorithm'.
	 */
	titlePrefix?: string;

	mathEngine?: "katex" | "mathjax";

	mathRenderer?: (input: string) => string;
}

function renderToString(input: string, options?: PseudoOptions): string {
	if (String.isNullOrEmpty(input))
		throw new Error("Input cannot be empty");
	const lexer = new Lexer(input);
	const parser = new Parser(lexer);
	const renderer = new Renderer(parser, options);
	if (options?.mathEngine || options?.mathRenderer) {
		renderer.backend ??= {};
		renderer.backend.name ??= options?.mathEngine;
		renderer.backend.driver ??= {};
		renderer.backend.driver.renderToString ??= options?.mathRenderer;
	}
	return renderer.toMarkup();
}

const rehypePseudo: Plugin<[PseudoOptions?], Root, Root> = function (options): Transformer<Root, Root> {
	const parser = unified().use(parseHtml, { fragment: true });
	return root => visit(root, "element", (element: Element) => {
		if (element.tagName != "code" || !(element.properties?.className as (string[] | undefined))?.includes("language-pseudo"))
			return;
		try {
			const markup = renderToString(htmlAstToString(element), options);
			const dom = parser.parse(markup) as unknown as Element;
			element.children
			Object.innerAssign(element, {
				children: dom.children,
				properties: {},
				tagName: "div"
			});
		}
		catch (error) {
			console.log(error);
		}
	});
}

export default rehypePseudo;