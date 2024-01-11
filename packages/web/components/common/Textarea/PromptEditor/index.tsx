import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import VariablePickerPlugin from './plugins/VariablePickerPlugin';
import { Box } from '@chakra-ui/react';
import styles from './index.module.scss';
import VariablePlugin from './plugins/VariablePlugin';
import { VariableNode } from './plugins/VariablePlugin/node';
import { VariableItemType } from '@fastgpt/global/core/module/type';

export default function PromptEditor({ variables }: { variables: VariableItemType[] }) {
  const initialConfig = {
    namespace: 'promptEditor',
    nodes: [VariableNode],
    onError: (error: Error) => {
      throw error;
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Box width={'full'} className={styles.editorWrapper}>
        <PlainTextPlugin
          contentEditable={<ContentEditable className={styles.contentEditable} />}
          placeholder={<div className={styles.placeholder}>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <VariablePickerPlugin variables={variables} />
        <VariablePlugin />
      </Box>
    </LexicalComposer>
  );
}
