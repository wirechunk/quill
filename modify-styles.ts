/*
 * ********************************************************
 * HOW THIS WORKS:
 * This file defines a bunch of precise changes we make to .styl files in this repo.
 * Run this script and then run `npm run -w quill build` to build the final CSS file,
 * which gets output at `packages/quill/dist/dist/quill.snow.css`. Then copy that file
 * to the wirechunk/quill-editor repo to include it in the dynamically loaded component.
 * ********************************************************
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ASSETS_PATH = join(import.meta.dirname, "packages/quill/src/assets");

// Helper function to update file content with validation.
function updateFile(
  filePath: string,
  replacements: Array<{ search: string; replace: string }>
) {
  let content = readFileSync(filePath, "utf8");

  replacements.forEach(({ search, replace }, index) => {
    // Count occurrences of the search pattern.
    let occurrences = 0;
    let pos = 0;
    while ((pos = content.indexOf(search, pos)) !== -1) {
      occurrences++;
      pos += search.length;
    }

    // Expect exactly one occurrence.
    if (occurrences === 0) {
      throw new Error(
        `Pattern not found in ${filePath} (replacement #${index + 1}):\n` +
          `Search pattern: ${search}\n` +
          `Expected to find exactly 1 occurrence, but found 0`
      );
    }

    if (occurrences > 1) {
      throw new Error(
        `Pattern found multiple times in ${filePath} (replacement #${index + 1}):\n` +
          `Search pattern: ${search}\n` +
          `Expected to find exactly 1 occurrence, but found ${occurrences}`
      );
    }

    content = content.replace(search, replace);
    console.log(`✓ Found and replaced pattern #${index + 1} in ${filePath}`);
  });

  writeFileSync(filePath, content, "utf8");
  console.log(`✅ Updated: ${filePath}\n`);
}

console.log("\n✨ All style updates completed successfully!");

try {
  console.log("🚀 Starting Quill style modifications...\n");

  console.log("Processing snow.styl...");
  const snowStylPath = join(ASSETS_PATH, "snow.styl");
  updateFile(snowStylPath, [
    {
      search: "borderColor = #ccc",
      replace: "borderColor = var(--color-border)",
    },
    {
      search: "    color: activeColor",
      replace: "",
    },
    {
      search: `.ql-container.ql-snow
  border: 1px solid borderColor`,
      replace: `.ql-container.ql-snow
  border: 1px solid borderColor
  border-radius: 0 0 4px 4px`,
    },
  ]);

  console.log("Processing snow/toolbar.styl...");
  const toolbarStylPath = join(ASSETS_PATH, "snow/toolbar.styl");
  updateFile(toolbarStylPath, [
    {
      search: `.ql-toolbar.ql-snow
  border: 1px solid borderColor
  box-sizing: border-box
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif
`,
      replace: `.ql-toolbar.ql-snow
  border: 1px solid borderColor
  border-radius: 4px 4px 0 0
  box-sizing: border-box
  font-family: var(--font-family)
`,
    },
  ]);

  console.log("Processing core.styl...");
  const coreStylPath = join(ASSETS_PATH, "core.styl");
  updateFile(coreStylPath, [
    // Update .ql-editor line-height
    {
      search: "  line-height: 1.42",
      replace: "  line-height: var(--default-line-height)",
    },
    {
      search: `  p, ol, pre, blockquote, h1, h2, h3, h4, h5, h6
    margin: 0
    padding: 0`,
      replace: "",
    },
    {
      search: "  font-family: Helvetica, Arial, sans-serif",
      replace: "  font-family: var(--font-family)",
    },
    {
      search: "  font-size: 13px",
      replace: "  font-size: var(--font-size-3)",
    },
    {
      search: "    font-family: monospace",
      replace: "    font-family: var(--code-font-family)",
    },
    {
      search: `  ol
    padding-left: 1.5em`,
      replace: "",
    },
  ]);

  console.log("Processing base.styl...");
  const baseStylPath = join(ASSETS_PATH, "base.styl");
  updateFile(baseStylPath, [
    // Remove all this styling that Wirechunk sets.
    {
      search: `  .ql-editor
    h1
      font-size: 2em
    h2
      font-size: 1.5em
    h3
      font-size: 1.17em
    h4
      font-size: 1em
    h5
      font-size: 0.83em
    h6
      font-size: 0.67em
    a
      text-decoration: underline
    blockquote
      border-left: 4px solid #ccc
      margin-bottom: 5px
      margin-top: 5px
      padding-left: 16px
    code, .ql-code-block-container
      background-color: #f0f0f0
      border-radius: 3px
    .ql-code-block-container
      margin-bottom: 5px
      margin-top: 5px
      padding: 5px 10px
    code
      font-size: 85%
      padding: 2px 4px
    .ql-code-block-container
      background-color: #23241f
      color: #f8f8f2
      overflow: visible
    img
      max-width: 100%`,
      replace: "",
    },
  ]);

  console.log("✨ All style updates completed successfully!");
} catch (error) {
  console.error("\n❌ Error during style modifications:");
  console.error(error.message);
  process.exit(1);
}
