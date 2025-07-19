import { parseMarkdown } from "../utils/markdown";

interface Props {
  content: string;
  className?: string;
}

export default function Markdown({ content, className }: Props) {
  const html = parseMarkdown(content);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
