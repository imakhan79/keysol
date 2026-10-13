import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders CMS markdown. Raw HTML in content is ignored (react-markdown default), so
// editor input cannot inject scripts.
export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div
      className={`prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
