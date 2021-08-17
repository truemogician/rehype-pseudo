import { unified } from "unified";
import remark2rehype from "remark-rehype";
import markdown from "remark-parse";
import html from "rehype-stringify";
import { toVFile as VFile } from "to-vfile";
import rehypePseudo from "../index.js";

const vFile = unified()
	.use(markdown)
	.use(remark2rehype)
	.use(rehypePseudo, {
		identSize: "2em",
		mathEngine: "katex",
		mathRenderer: math => `<span class="math math-inline">${math}</span>`
	})
	.use(html)
	.processSync(VFile.readSync("test/pseudo.md"));

vFile.extname = ".html";
VFile.writeSync(vFile);
