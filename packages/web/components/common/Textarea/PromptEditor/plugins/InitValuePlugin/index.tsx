import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import { textToEditorState } from '../../utils';

export default function InitValuePlugin({ defaultValue }: { defaultValue: string | undefined }) {
  const [editor] = useLexicalComposerContext();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && defaultValue) {
      isFirstRender.current = false;
      const initialEditorState = editor.parseEditorState(textToEditorState(defaultValue));
      editor.setEditorState(initialEditorState);
    }
  }, [isFirstRender.current, editor, defaultValue]);

  setTimeout(() => {
    isFirstRender.current = false;
  }, 200);

  return null;
}
