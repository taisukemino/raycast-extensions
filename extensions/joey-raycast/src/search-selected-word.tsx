import { Clipboard, getSelectedText, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { CommandRoot } from "./components/CommandRoot";

// Reason: getSelectedText() simulates Cmd+C internally. In apps that don't
// respond to Cmd+C for text selection (e.g. Linear), it returns stale clipboard
// content. We clear the clipboard first so we can detect whether the app
// actually copied anything, then restore the original clipboard afterward.
async function readSelectedText(): Promise<string> {
  const originalClipboard = await Clipboard.readText();

  await Clipboard.copy("");
  const text = await getSelectedText();
  const trimmed = text.trim();

  if (trimmed) {
    return trimmed;
  }

  // Restore original clipboard since nothing was selected
  if (originalClipboard) {
    await Clipboard.copy(originalClipboard);
  }

  throw new Error("No text selected");
}

export default function SearchSelectedWord() {
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    readSelectedText()
      .then(setSelectedText)
      .catch(async () => {
        await showToast({
          style: Toast.Style.Failure,
          title: "No text selected",
          message: "Select a word before running this command",
        });
      });
  }, []);

  return <CommandRoot initialSearchText={selectedText} />;
}
