import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { textToEditorState } from '../../utils';
import { CLEAR_HISTORY_COMMAND } from 'lexical';

export default function InitValuePlugin({ defaultValue }: { defaultValue: string | undefined }) {
  const [editor] = useLexicalComposerContext();
  const hasFocus = editor.getRootElement() === document.activeElement;

  useEffect(() => {
    if (!hasFocus && defaultValue) {
      const initialEditorState = editor.parseEditorState(textToEditorState(defaultValue));
      editor.setEditorState(initialEditorState);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    }
  }, [editor, defaultValue]);

  return null;
}
