export function parseMarkdown(text: string): string {
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const processInline = (str: string) =>
    str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = escaped.split(/\n/);
  const htmlLines: string[] = [];
  let inList = false;
  for (const line of lines) {
    const listMatch = /^\s*[-*] (.+)/.exec(line);
    if (listMatch) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      htmlLines.push('<li>' + processInline(listMatch[1]) + '</li>');
      continue;
    }
    if (inList) {
      htmlLines.push('</ul>');
      inList = false;
    }
    let m;
    if ((m = /^### (.+)/.exec(line))) {
      htmlLines.push('<h3>' + processInline(m[1]) + '</h3>');
    } else if ((m = /^## (.+)/.exec(line))) {
      htmlLines.push('<h2>' + processInline(m[1]) + '</h2>');
    } else if ((m = /^# (.+)/.exec(line))) {
      htmlLines.push('<h1>' + processInline(m[1]) + '</h1>');
    } else if (line.trim() === '') {
      htmlLines.push('');
    } else {
      htmlLines.push('<p>' + processInline(line) + '</p>');
    }
  }
  if (inList) htmlLines.push('</ul>');
  return htmlLines.join('\n');
}
