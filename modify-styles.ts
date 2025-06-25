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

// Helper function to update file content with validation
function updateFile(
  filePath: string,
  replacements: Array<{ search: string | RegExp; replace: string }>
) {
  let content = readFileSync(filePath, "utf8");

  replacements.forEach(({ search, replace }, index) => {
    // Count occurrences of the search pattern
    let occurrences = 0;
    if (search instanceof RegExp) {
      const matches = content.match(new RegExp(search, "g"));
      occurrences = matches ? matches.length : 0;
    } else {
      let pos = 0;
      while ((pos = content.indexOf(search, pos)) !== -1) {
        occurrences++;
        pos += search.length;
      }
    }

    // Validate exactly one occurrence
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

    // Perform the replacement
    content = content.replace(search, replace);
    console.log(`✓ Found and replaced pattern #${index + 1} in ${filePath}`);
  });

  writeFileSync(filePath, content, "utf8");
  console.log(`✅ Updated: ${filePath}\n`);
}

console.log("\n✨ All style updates completed successfully!");

// Main execution with error handling
try {
  console.log("🚀 Starting Quill style modifications...\n");

  console.log("Processing snow.styl...");
  const snowStylPath = join(ASSETS_PATH, "snow.styl");
  updateFile(snowStylPath, [
    {
      search: /borderColor = #ccc/,
      replace: "borderColor = var(--color-border)",
    },
    {
      search: /\.ql-container\.ql-snow\n  border: 1px solid borderColor/,
      replace: `.ql-container.ql-snow
  border: 1px solid borderColor
  border-radius: 0 0 4px 4px`,
    },
  ]);

  console.log("Processing snow/toolbar.styl...");
  const toolbarStylPath = join(ASSETS_PATH, "snow/toolbar.styl");
  updateFile(toolbarStylPath, [
    {
      search:
        /\.ql-toolbar\.ql-snow\n  border: 1px solid borderColor\n  box-sizing: border-box\n  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif\n  padding: 8px/,
      replace: `.ql-toolbar.ql-snow
  border: 1px solid borderColor
  border-radius: 4px 4px 0 0
  box-sizing: border-box
  font-family: var(--font-family)
  padding: 8px`,
    },
  ]);

  console.log("Processing core.styl...");
  const coreStylPath = join(ASSETS_PATH, "core.styl");
  updateFile(coreStylPath, [
    // Update .ql-editor line-height
    {
      search:
        /\.ql-editor\n  box-sizing: border-box\n  counter-reset: resets\(0\.\.MAX_INDENT\)\n  line-height: 1\.42/,
      replace: `.ql-editor
  box-sizing: border-box
  counter-reset: resets(0..MAX_INDENT)
  line-height: var(--default-line-height)`,
    },
    // Update .ql-container font-size and font-family
    {
      search:
        /\.ql-container\n  box-sizing: border-box\n  font-family: Helvetica, Arial, sans-serif\n  font-size: 13px/,
      replace: `.ql-container
  box-sizing: border-box
  font-family: var(--font-family)
  font-size: var(--font-size-3)`,
    },
    // Update .ql-code-block-container font-family
    {
      search: /  \.ql-code-block-container\n    font-family: monospace/,
      replace: `  .ql-code-block-container
    font-family: var(--code-font-family)`,
    },
  ]);

  console.log("Processing base.styl...");
  const baseStylPath = join(ASSETS_PATH, "base.styl");
  updateFile(baseStylPath, [
    // Remove font-size from h1-h6 elements
    {
      search:
        /    h1\n      font-size: 2em\n    h2\n      font-size: 1\.5em\n    h3\n      font-size: 1\.17em\n    h4\n      font-size: 1em\n    h5\n      font-size: 0\.83em\n    h6\n      font-size: 0\.67em\n/,
      replace: "",
    },
    // Remove text-decoration from a elements
    {
      search: /    a\n      text-decoration: underline/,
      replace: "    a",
    },
    // First occurrence in .ql-editor context
    {
      search:
        /    \.ql-code-block-container\n      margin-bottom: 5px\n      margin-top: 5px\n      padding: 5px 10px/,
      replace: `    .ql-code-block-container
      margin-bottom: 5px
      margin-top: 5px
      padding: var(--space-3)`,
    },
    // Second occurrence with background and color
    {
      search:
        /    \.ql-code-block-container\n      background-color: #23241f\n      color: #f8f8f2\n      overflow: visible/,
      replace: `    .ql-code-block-container
      background-color: var(--surface-ground)
      color: var(--gray-12)
      border-radius: var(--radius-3)
      overflow: visible`,
    },
  ]);

  console.log("✨ All style updates completed successfully!");
} catch (error) {
  console.error("\n❌ Error during style modifications:");
  console.error(error.message);
  process.exit(1);
}
