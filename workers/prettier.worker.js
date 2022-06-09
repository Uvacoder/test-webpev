import prettier from "prettier";

let current;

/**
 * @type  {Record<string,import("prettier").Options>}  options
 */
const options = {
  html: async () => ({
    parser: "html",
    htmlWhitespaceSensitivity: "strict",
    plugins: [await import("prettier/parser-html")],
    printWidth: 100000,
    tabWidth: 2,
  }),
  css: async () => ({
    parser: "css",
    plugins: [await import("prettier/parser-postcss")],
    printWidth: 100,
  }),
  javascript: async () => ({
    parser: "babel",
    plugins: [await import("prettier/parser-babel")],
    printWidth: 100,
    semi: true,
    singleQuote: true,
  }),
  typescript: async () => ({
    parser: "typescript",
    plugins: [await import("prettier/parser-typescript")],
    printWidth: 100,
    semi: true,
    singleQuote: true,
  }),
};

addEventListener("message", async (event) => {
  if (event.data._current) {
    current = event.data._current;
    return;
  }

  function respond(data) {
    setTimeout(() => {
      if (event.data._id === current) {
        postMessage({ _id: event.data._id, ...data });
      } else {
        postMessage({ _id: event.data._id, canceled: true });
      }
    }, 0);
  }
  const opts = await options[event.data.language]();

  try {
    respond({
      pretty: prettier.format(event.data.text, {
        ...opts,
        endOfLine: "auto",
        useTabs: false,
        trailingComma: "es5",
      }),
    });
  } catch (error) {
    respond({ error });
  }
});
