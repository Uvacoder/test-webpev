import { Monaco } from "@monaco-editor/react";
import { createWorkerQueue } from "../../../workers";
import { ICodeEditor } from "../../typings/types";

export function registerJsxHighlighter(editor: ICodeEditor, monaco: Monaco) {
	const { worker: syntaxWorker } = createWorkerQueue(
		new Worker(new URL("../../../workers/syntax-highlight.worker.js", import.meta.url))
	);

	const highlightHandler = () => {
		const title = "app.js";
		const model = editor.getModel();
		const version = model!.getVersionId();
		// @ts-ignore
		const lang = model._languageIdentifier.language;

		if (lang === "javascript" || "typescript") {
			const code = model?.getValue();
			syntaxWorker.postMessage({
				code,
				title,
				version,
			});
		}
	};

	editor.onDidChangeModel(highlightHandler);

	editor.onDidChangeModelContent(highlightHandler);

	let oldDecor = editor.getModel()?.getAllDecorations();

	syntaxWorker.addEventListener("message", (event) => {
		const { classifications } = event.data;

		requestAnimationFrame(() => {
			const decorations = classifications.map((classification) => ({
				range: new monaco.Range(
					classification.startLine,
					classification.start,
					classification.endLine,
					classification.end
				),
				options: {
					inlineClassName: classification.type
						? `ayu-dark ${classification.kind} ${classification.type}-of-${classification.parentKind}`
						: classification.kind,
				},
			}));

			// @ts-ignore
			oldDecor = editor.deltaDecorations(oldDecor, decorations);
		});
	});
}
