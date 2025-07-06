function sanitizeHtml(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  for (const script of template.content.querySelectorAll("script")) {
    script.remove();
  }
  for (const element of template.content.querySelectorAll("*")) {
    for (const attr of Array.from(element.attributes)) {
      if (attr.name.startsWith("on")) {
        element.removeAttribute(attr.name);
      }
    }
  }
  return template.innerHTML;
}

function sanitizeCss(css: string) {
  return css.replace(/<[^>]*>?/gm, "");
}

interface Props {
  html: string;
  css: string;
  js: string;
}

export default function CustomRenderer({ html, css, js }: Props) {
  const srcDoc = `
    <html>
      <head>
        <style>${sanitizeCss(css)}</style>
      </head>
      <body>
        ${sanitizeHtml(html)}
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
