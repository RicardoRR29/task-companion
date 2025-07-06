import DOMPurify from "dompurify";

interface Props {
  html: string;
  css: string;
  js: string;
}

export default function CustomRenderer({ html, css, js }: Props) {
  const srcDoc = `
    <html>
      <head>
        <style>${DOMPurify.sanitize(css, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}</style>
      </head>
      <body>
        ${DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            "div",
            "span",
            "p",
            "ul",
            "li",
            "a",
            "input",
            "label",
          ],
          ALLOWED_ATTR: [
            "href",
            "target",
            "rel",
            "class",
            "style",
            "checked",
            "readonly",
          ],
        })}
        <script>
          ${js}
        </script>
      </body>
    </html>
  `;

  return (
    <iframe
      sandbox="allow-scripts allow-popups"
      srcDoc={srcDoc}
      style={{ width: "100%", height: "200px", border: "none" }}
    />
  );
}
