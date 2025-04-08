import { lexer, type Token, type Tokens } from "marked";
import {
  Fragment,
  memo,
  useId,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "../utils";

function render(token: Token, key: string): ReactNode {
  const renderChild = (token: Token, index: number) => {
    const nextKey = `${key}-${token.type}-${index}`;
    return render(token, nextKey);
  };
  switch (token.type) {
    case "blockquote": {
      const blockquote = token as Tokens.Blockquote;
      return <blockquote key={key}>{blockquote.tokens.map(renderChild)}</blockquote>;
    }
    case "br": {
      return <br key={key} />;
    }
    case "code": {
      const code = token as Tokens.Code;
      return (
        <pre key={key}>
          <code>{code.text}</code>
        </pre>
      );
    }
    case "codespan": {
      const codespan = token as Tokens.Codespan;
      return <code key={key}>{codespan.text}</code>;
    }
    case "def": {
      console.warn("Definition token is not implemented", token);
      return null;
    }
    case "del": {
      const del = token as Tokens.Del;
      return <del key={key}>{del.tokens.map(renderChild)}</del>;
    }
    case "em": {
      const em = token as Tokens.Em;
      return <em key={key}>{em.tokens.map(renderChild)}</em>;
    }
    case "escape": {
      const escape = token as Tokens.Escape;
      return <Fragment key={key}>{escape.text}</Fragment>;
    }
    case "heading": {
      const heading = token as Tokens.Heading;
      const Heading = `h${heading.depth}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return <Heading key={key}>{heading.tokens.map(renderChild)}</Heading>;
    }
    case "hr": {
      return <hr key={key} />;
    }
    case "html": {
      // not implemented
      console.warn("HTML token is not implemented", token);
      return null;
    }
    case "image": {
      const image = token as Tokens.Image;
      return <img key={key} src={image.href} alt={image.text} loading="lazy" />;
    }
    case "link": {
      const link = token as Tokens.Link;
      return (
        <a key={key} href={link.href} target="_blank" rel="noopener noreferrer">
          {link.tokens.map(renderChild)}
        </a>
      );
    }
    case "list": {
      const list = token as Tokens.List;
      const List = list.ordered ? "ol" : "ul";
      return <List key={key}>{list.items.map(renderChild)}</List>;
    }
    case "list_item": {
      const listItem = token as Tokens.ListItem;
      return <li key={key}>{listItem.tokens.map(renderChild)}</li>;
    }
    case "paragraph": {
      const paragraph = token as Tokens.Paragraph;
      return <p key={key}>{paragraph.tokens.map(renderChild)}</p>;
    }
    case "space": {
      return <Fragment key={key} />;
    }
    case "strong": {
      const strong = token as Tokens.Strong;
      return <strong key={key}>{strong.tokens.map(renderChild)}</strong>;
    }
    case "table": {
      const table = token as Tokens.Table;
      return (
        <table key={key}>
          <thead>
            <tr>
              {table.header.map((header, index) => (
                <th key={index} style={{ textAlign: header.align ?? undefined }}>
                  {header.tokens.map(renderChild)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={{ textAlign: cell.align ?? undefined }}>
                    {cell.tokens.map(renderChild)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case "text": {
      const text = token as Tokens.Text;
      return text.tokens?.map(renderChild) ?? text.text;
    }
  }
  return null;
}

/**
 * @see https://sdk.vercel.ai/cookbook/next/markdown-chatbot-with-memoization#memoized-markdown-component
 */
const MemoizedMarkdownBlock = memo(
  (props: { children: Token }) => {
    const id = useId();
    return render(props.children, id);
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

/**
 * @see https://sdk.vercel.ai/cookbook/next/markdown-chatbot-with-memoization#memoized-markdown-component
 */
export const MemoizedMarkdown = memo(
  ({ className, children, ...props }: ComponentProps<"div"> & { children: string }) => {
    const id = useId();
    const blocks = useMemo(() => lexer(children, { gfm: true }), [children]);
    return (
      <div className={cn("prose dark:prose-invert max-w-none", className)} {...props}>
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock key={`${id}-block-${index}`}>
            {block}
          </MemoizedMarkdownBlock>
        ))}
      </div>
    );
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
