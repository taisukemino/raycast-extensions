import { Clipboard, getSelectedText, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { CommandRoot } from "./components/CommandRoot";

// Reason: Raycast's getSelectedText() simulates Cmd+C internally. When nothing
// is selected, it returns whatever was already on the clipboard. We compare
// against the current clipboard to detect this false positive.
async function readSelectedText(): Promise<string> {
  const currentClipboardText = await Clipboard.readText();
  const text = await getSelectedText();
  const trimmed = text.trim();

  if (trimmed && trimmed !== currentClipboardText?.trim()) {
    return trimmed;
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
