import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into lines
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" = "ul";

  const parseInline = (text: string): React.ReactNode[] => {
    let currentText = text;

    // Regexp to match bold (**bold**), code (`code`), (+), (-)
    const regex = /(\*\*.*?\*\*|`.*?`|\(\+\)|\(-\))/g;
    const tokens = currentText.split(regex);

    return tokens.map((token, index) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-gray-900">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith("`") && token.endsWith("`")) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-primary font-semibold"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token === "(+)") {
        return (
          <span
            key={index}
            className="inline-flex items-center justify-center font-bold text-emerald-600 bg-emerald-50 px-1 rounded mr-1.5 text-xs select-none"
          >
            (+)
          </span>
        );
      }
      if (token === "(-)") {
        return (
          <span
            key={index}
            className="inline-flex items-center justify-center font-bold text-rose-500 bg-rose-50 px-1 rounded mr-1.5 text-xs select-none"
          >
            (-)
          </span>
        );
      }
      return token;
    });
  };

  const flushTable = (key: number) => {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      elements.push(
        <div
          key={`table-${key}`}
          className="w-full overflow-x-auto my-4 border border-gray-200/80 rounded-xl shadow-sm"
        >
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs border-collapse">
            {tableHeaders.length > 0 && (
              <thead className="bg-gray-100/80 border-b border-gray-200">
                <tr>
                  {tableHeaders.map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 font-bold text-gray-800 tracking-normal border-b border-gray-200 whitespace-nowrap"
                    >
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-gray-100 bg-white">
              {tableRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50/40 transition-colors odd:bg-white even:bg-gray-50/20"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-2.5 text-gray-600 leading-relaxed border-b border-gray-100 align-top"
                    >
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      const ListTag = listType;
      elements.push(
        <ListTag
          key={`list-${key}`}
          className={`my-3 pl-6 space-y-1.5 ${
            listType === "ul" ? "list-disc" : "list-decimal"
          }`}
        >
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-700 text-sm leading-relaxed">
              {item}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Check Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (inList) flushList(i);

      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());

      // Check if it's a separator line like |---| or |:---|
      const isSeparator = cells.every((c) => /^[:-]+$/.test(c));

      if (isSeparator) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // 2. Check Headings
    if (trimmed.startsWith("### ")) {
      if (inList) flushList(i);
      elements.push(
        <h3
          key={i}
          className="text-sm font-bold text-gray-800 mt-5 mb-2.5 flex items-center border-l-4 border-primary pl-2.5"
        >
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      if (inList) flushList(i);
      elements.push(
        <h2
          key={i}
          className="text-base font-bold text-gray-900 mt-6 mb-3 border-b border-gray-100 pb-1.5"
        >
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      if (inList) flushList(i);
      elements.push(
        <h1 key={i} className="text-lg font-extrabold text-gray-900 mt-7 mb-4">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    // 3. Check Bullet Lists
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      if (inTable) flushTable(i);
      if (!inList) {
        inList = true;
        listType = "ul";
      }
      listItems.push(parseInline(trimmed.slice(2)));
      continue;
    }

    // 4. Check Numbered Lists
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      if (inTable) flushTable(i);
      if (!inList) {
        inList = true;
        listType = "ol";
      }
      listItems.push(parseInline(numMatch[2]));
      continue;
    }

    // 5. Blank line
    if (!trimmed) {
      if (inTable) flushTable(i);
      if (inList) flushList(i);
      continue;
    }

    // 6. Regular Paragraph
    if (inList) flushList(i);
    elements.push(
      <p key={i} className="text-gray-700 text-sm leading-relaxed my-2">
        {parseInline(line)}
      </p>
    );
  }

  // Flush remaining blocks
  flushTable(lines.length);
  flushList(lines.length);

  return <div className="space-y-1 select-text">{elements}</div>;
}
