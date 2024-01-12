import {
  Box,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { VariableItemType } from '@fastgpt/global/core/module/type';
import { useState } from 'react';
import { editorStateToText, getVars } from './utils';
import Editor from './Editor';
import ComfirmVar from './modules/ComfirmVar';
import MyIcon from '../../Icon';

export default function PromptEditor({
  variables,
  defaultValue,
  onBlur,
  defaultVariable,
  setVariable,
  showOpenModal = true,
  height = '220px'
}: {
  variables: VariableItemType[];
  defaultValue: string;
  onBlur: (text: string) => void;
  defaultVariable: VariableItemType;
  setVariable: (variables: VariableItemType[]) => void;
  showOpenModal?: boolean;
  height?: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newVariables] = useState<string[]>([]);
  const [showConfirmVar, setShowConfirmVar] = useState(false);

  const [newDefaultValue, setNewDefaultValue] = useState(defaultValue);

  return (
    <>
      <Box position={'relative'} w={'full'} h={height}>
        <Editor
          variables={variables}
          defaultValue={newDefaultValue}
          onBlur={(editor) => {
            const text = editorStateToText(editor);
            onBlur(text);
            setNewDefaultValue(text);
            for (const item of getVars(text)) {
              if (
                variables.findIndex((v) => v.label === item) === -1 &&
                newVariables.findIndex((v) => v === item) === -1
              ) {
                newVariables.push(item);
              }
            }
            if (newVariables.length > 0) {
              setShowConfirmVar(true);
            }
          }}
        />
        {showConfirmVar && (
          <ComfirmVar
            newVariables={newVariables}
            onCancel={() => {
              setShowConfirmVar(false);
              newVariables.splice(0, newVariables.length);
            }}
            onConfirm={() => {
              const newVariablesList = [
                ...variables,
                ...newVariables.map((item) => ({ ...defaultVariable, label: item as string }))
              ];
              setVariable(newVariablesList);
              setShowConfirmVar(false);
              newVariables.splice(0, newVariables.length);
            }}
          />
        )}
        {showOpenModal && (
          <Box
            zIndex={1}
            position={'absolute'}
            bottom={1}
            right={2}
            cursor={'pointer'}
            onClick={onOpen}
          >
            <MyIcon name={'common/fullScreenLight'} w={'14px'} color={'myGray.600'} />
          </Box>
        )}
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
        <ModalOverlay />
        <ModalContent h={'500px'} m={'auto'}>
          <ModalHeader>prompt</ModalHeader>
          <ModalBody>
            <Box position={'relative'} w={'full'} h={'full'}>
              <Editor
                variables={variables}
                defaultValue={newDefaultValue}
                onBlur={(editor) => {
                  const text = editorStateToText(editor);
                  onBlur(text);
                  setNewDefaultValue(text);
                  for (const item of getVars(text)) {
                    if (
                      variables.findIndex((v) => v.label === item) === -1 &&
                      newVariables.findIndex((v) => v === item) === -1
                    ) {
                      newVariables.push(item);
                    }
                  }
                  if (newVariables.length > 0) {
                    setShowConfirmVar(true);
                  }
                }}
              />
              {showConfirmVar && (
                <ComfirmVar
                  newVariables={newVariables}
                  onCancel={() => {
                    setShowConfirmVar(false);
                    newVariables.splice(0, newVariables.length);
                  }}
                  onConfirm={() => {
                    const newVariablesList = [
                      ...variables,
                      ...newVariables.map((item) => ({ ...defaultVariable, label: item as string }))
                    ];
                    setVariable(newVariablesList);
                    setShowConfirmVar(false);
                    newVariables.splice(0, newVariables.length);
                  }}
                />
              )}
            </Box>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
