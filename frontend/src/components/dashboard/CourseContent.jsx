import { BookOpen } from "lucide-react";

const CourseContent = ({ course, activeLesson, setActiveLesson, onToggleComplete, isLessonComplete }) => {
  if (!course || course.lessons.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No lessons available yet.</p>
      </div>
    );
  }

  const currentLesson = course.lessons[activeLesson];

  const normalizeContent = (content) => {
    if (typeof content !== "string") return "";
    const normalized = content
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t");
    return transformStructuredContentString(normalized);
  };

  const jsonBlockToMarkdown = (title, block) => {
    const lines = [];
    if (title) lines.push(`## ${title}`);
    if (block && typeof block === "object" && !Array.isArray(block)) {
      if (typeof block.text === "string" && block.text.trim()) {
        lines.push(block.text.trim());
      }
      if (Array.isArray(block.keyPoints) && block.keyPoints.length > 0) {
        const items = block.keyPoints.map((item) => {
          if (typeof item === "string") return `- ${item}`;
          if (item && typeof item === "object") {
            const label = item.type || item.concept || item.point || item.title || item.name;
            const desc = item.description || item.details || item.text;
            if (label && desc) return `- **${label}**: ${desc}`;
            if (label) return `- ${label}`;
            if (desc) return `- ${desc}`;
            return `- ${JSON.stringify(item)}`;
          }
          return `- ${String(item)}`;
        });
        lines.push(items.join("\n"));
      }
      return lines;
    }
    if (Array.isArray(block)) {
      const items = block.map((item) => `- ${typeof item === "string" ? item : JSON.stringify(item)}`);
      lines.push(items.join("\n"));
      return lines;
    }
    if (block !== undefined && block !== null) {
      lines.push(String(block));
    }
    return lines;
  };

  const extractJsonBlock = (lines, startIndex) => {
    let buffer = "";
    let braceCount = 0;
    let inString = false;
    let escaped = false;
    let started = false;

    for (let i = startIndex; i < lines.length; i += 1) {
      const line = lines[i];
      buffer += (buffer ? "\n" : "") + line;

      for (let j = 0; j < line.length; j += 1) {
        const ch = line[j];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === "\"") {
          inString = !inString;
          continue;
        }
        if (inString) continue;
        if (ch === "{") {
          braceCount += 1;
          started = true;
        } else if (ch === "}") {
          braceCount -= 1;
          if (started && braceCount === 0) {
            return { jsonText: buffer, endIndex: i };
          }
        }
      }
    }
    return { jsonText: null, endIndex: startIndex };
  };

  const transformStructuredContentString = (content) => {
    const trimmed = content.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        const parsed = JSON.parse(trimmed);
        const md = [];
        if (Array.isArray(parsed)) {
          parsed.forEach((block, idx) => md.push(...jsonBlockToMarkdown(`Section ${idx + 1}`, block), ""));
        } else if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([key, value]) => {
            const title = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            md.push(...jsonBlockToMarkdown(title, value), "");
          });
        }
        const joined = md.join("\n").trim();
        if (joined) return joined;
      } catch (err) {
        // fall through to block parsing
      }
    }

    const lines = content.split("\n");
    const output = [];
    let found = false;
    let i = 0;
    const isTitleLine = (line) => {
      if (!line) return false;
      if (line.startsWith("#")) return false;
      if (line.startsWith("- ")) return false;
      if (line.startsWith("```")) return false;
      if (line.startsWith("|") && line.endsWith("|")) return false;
      return true;
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (trimmedLine === "") {
        output.push(line);
        i += 1;
        continue;
      }

      if (isTitleLine(trimmedLine)) {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j += 1;
        if (j < lines.length && lines[j].trim().startsWith("{")) {
          const { jsonText, endIndex } = extractJsonBlock(lines, j);
          if (jsonText) {
            try {
              const parsed = JSON.parse(jsonText);
              output.push(...jsonBlockToMarkdown(trimmedLine, parsed), "");
              found = true;
              i = endIndex + 1;
              continue;
            } catch (err) {
              // fall through to default handling
            }
          }
        }
      }

      output.push(line);
      i += 1;
    }

    if (found) return output.join("\n").trim();
    return content;
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs sm:text-sm"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderContentBlocks = (content) => {
    const normalized = normalizeContent(content);
    const lines = normalized.split("\n");
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("```")) {
        const language = line.slice(3).trim();
        i += 1;
        const codeLines = [];
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i += 1;
        }
        if (i < lines.length && lines[i].startsWith("```")) {
          i += 1;
        }
        blocks.push({ type: "code", language, code: codeLines.join("\n") });
        continue;
      }

      if (line.startsWith("# ")) {
        blocks.push({ type: "h1", text: line.slice(2) });
        i += 1;
        continue;
      }

      if (line.startsWith("## ")) {
        blocks.push({ type: "h2", text: line.slice(3) });
        i += 1;
        continue;
      }

      if (line.startsWith("### ")) {
        blocks.push({ type: "h3", text: line.slice(4) });
        i += 1;
        continue;
      }

      if (line.startsWith("- ")) {
        const items = [];
        while (i < lines.length && lines[i].startsWith("- ")) {
          items.push(lines[i].slice(2));
          i += 1;
        }
        blocks.push({ type: "list", items });
        continue;
      }

      if (line.startsWith("|") && line.endsWith("|")) {
        const header = line;
        const separator = lines[i + 1];
        if (separator && separator.includes("|") && /-+/.test(separator)) {
          const rows = [];
          i += 2;
          while (i < lines.length && lines[i].startsWith("|") && lines[i].endsWith("|")) {
            rows.push(lines[i]);
            i += 1;
          }
          blocks.push({ type: "table", header, rows });
          continue;
        }
      }

      if (line.trim() === "") {
        i += 1;
        continue;
      }

      const paragraphLines = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !lines[i].startsWith("# ") &&
        !lines[i].startsWith("## ") &&
        !lines[i].startsWith("- ") &&
        !lines[i].startsWith("```")
      ) {
        paragraphLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "p", text: paragraphLines.join(" ") });
    }

    return blocks.map((block, index) => {
      if (block.type === "h1") {
        return (
          <h1
            key={index}
            className="text-2xl sm:text-3xl font-bold text-foreground mt-6 mb-3"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {block.text}
          </h1>
        );
      }

      if (block.type === "h2") {
        return (
          <h2 key={index} className="text-lg sm:text-xl font-semibold text-foreground mt-5 mb-2">
            {block.text}
          </h2>
        );
      }

      if (block.type === "h3") {
        return (
          <h3 key={index} className="text-base sm:text-lg font-semibold text-foreground mt-4 mb-2">
            {block.text}
          </h3>
        );
      }

      if (block.type === "code") {
        return (
          <pre
            key={index}
            className="bg-primary/5 border border-primary/10 px-3 sm:px-4 py-3 rounded-xl overflow-x-auto text-xs sm:text-sm text-primary"
          >
            <code className="font-mono">
              {block.code || (block.language ? `// ${block.language}` : "")}
            </code>
          </pre>
        );
      }

      if (block.type === "list") {
        return (
          <ul key={index} className="list-disc ml-6 text-muted-foreground space-y-1">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      }

      if (block.type === "table") {
        const parseRow = (row) =>
          row
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim());
        const headers = parseRow(block.header);
        const rows = block.rows.map(parseRow);
        return (
          <div key={index} className="overflow-x-auto border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-white/5">
                <tr>
                  {headers.map((h, hIndex) => (
                    <th key={hIndex} className="px-3 py-2 font-semibold text-foreground">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIndex) => (
                  <tr key={rIndex} className="border-t border-white/5">
                    {row.map((cell, cIndex) => (
                      <td key={cIndex} className="px-3 py-2 text-muted-foreground">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return (
        <p key={index} className="text-muted-foreground leading-relaxed">
          {renderInline(block.text)}
        </p>
      );
    });
  };

  return (
    <>
      {/* Lesson Tabs */}
      <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        {course.lessons.map((l, i) => (
          <button 
            key={l.id} 
            onClick={() => setActiveLesson(i)} 
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all ${
              i === activeLesson 
                ? "bg-primary/10 border border-primary/30 text-primary font-medium" 
                : "border border-border/30 text-muted-foreground hover:border-primary/20"
            }`}
          >
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted flex items-center justify-center text-xs font-mono">
              {i + 1}
            </span>
            <span className="hidden xs:inline">{l.title}</span>
          </button>
        ))}
      </div>

      {/* Lesson Content */}
      {currentLesson && (
        <div className="prose prose-invert max-w-none space-y-3 text-sm sm:text-base">
          <div className="flex items-center justify-between gap-4 not-prose">
            <div className="text-xs sm:text-sm text-white/50">
              Lesson {activeLesson + 1} of {course.lessons.length}
            </div>
            <button
              onClick={onToggleComplete}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                isLessonComplete
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                  : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
              }`}
            >
              {isLessonComplete ? "Completed" : "Mark Complete"}
            </button>
          </div>
          {renderContentBlocks(currentLesson.content)}
        </div>
      )}

    </>
  );
};

export default CourseContent;
