/**
 * Markdown — render a server-pre-rendered HTML fragment with the .prose-md
 * typography styles. The HTML is produced by the Python pipeline and trusted
 * because content lives in the repo (not user input).
 */

interface Props {
  html: string;
  className?: string;
}

export function Markdown({ html, className = "" }: Props) {
  return (
    <div
      className={`prose-md ${className}`}
      // Content originates from our own /content/*.md files compiled by
      // scripts/build_content.py. There is no user-submitted input path,
      // so HTML injection is safe by construction.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
