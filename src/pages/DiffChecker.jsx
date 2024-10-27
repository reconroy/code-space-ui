import React, { useState, useRef, useEffect } from 'react';
import Monaco from '@monaco-editor/react';
import axios from 'axios';
import useThemeStore from '../store/useThemeStore';
import * as monaco from 'monaco-editor';
import '../styles/diffChecker.css';

const DiffChecker = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [originalCode, setOriginalCode] = useState('');
  const [modifiedCode, setModifiedCode] = useState('');
  const [activeTab, setActiveTab] = useState('original');
  const [diffResult, setDiffResult] = useState([]);
  const originalEditorRef = useRef(null);
  const modifiedEditorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco, isOriginal) => {
    if (isOriginal) {
      originalEditorRef.current = editor;
    } else {
      modifiedEditorRef.current = editor;
    }
    updateEditorTheme(editor);
    setupScrollSync(editor, isOriginal);
  };

  const setupScrollSync = (editor, isOriginal) => {
    editor.onDidScrollChange(() => {
      const scrollInfo = editor.getScrollTop();
      const otherEditor = isOriginal ? modifiedEditorRef.current : originalEditorRef.current;
      if (otherEditor) {
        otherEditor.setScrollTop(scrollInfo);
      }
    });
  };

  const updateEditorTheme = (editor) => {
    if (editor) {
      monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs-light');
    }
  };

  useEffect(() => {
    updateEditorTheme(originalEditorRef.current);
    updateEditorTheme(modifiedEditorRef.current);
  }, [isDarkMode]);

  const fetchDiff = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/diff', { original: originalCode, modified: modifiedCode });
      setDiffResult(response.data);
    } catch (error) {
      console.error('Error fetching diff:', error);
    }
  };

  useEffect(() => {
    if (originalCode && modifiedCode) {
      fetchDiff();
    }
  }, [originalCode, modifiedCode]);

  useEffect(() => {
    const applyDecorations = () => {
      if (originalEditorRef.current && modifiedEditorRef.current) {
        const originalDecorations = [];
        const modifiedDecorations = [];

        let originalLineNumber = 1;
        let modifiedLineNumber = 1;

        diffResult.forEach((part) => {
          if (part.removed) {
            originalDecorations.push({
              range: new monaco.Range(originalLineNumber, 1, originalLineNumber + part.value.split('\n').length - 1, 1),
              options: { 
                isWholeLine: true, 
                className: 'diff-line-deleted',
                linesDecorationsClassName: 'diff-line-deleted-gutter'
              }
            });
            originalLineNumber += part.value.split('\n').length - 1;
          } else if (part.added) {
            modifiedDecorations.push({
              range: new monaco.Range(modifiedLineNumber, 1, modifiedLineNumber + part.value.split('\n').length - 1, 1),
              options: { 
                isWholeLine: true, 
                className: 'diff-line-added',
                linesDecorationsClassName: 'diff-line-added-gutter'
              }
            });
            modifiedLineNumber += part.value.split('\n').length - 1;
          } else {
            originalLineNumber += part.value.split('\n').length - 1;
            modifiedLineNumber += part.value.split('\n').length - 1;
          }
        });

        originalEditorRef.current.deltaDecorations([], originalDecorations);
        modifiedEditorRef.current.deltaDecorations([], modifiedDecorations);
      }
    };

    applyDecorations();
  }, [diffResult]);

  const editorOptions = {
    padding: { top: 20, bottom: 20 },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    minimap: { enabled: false },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    autoClosingBrackets: 'always',
    autoIndent: 'full',
    formatOnType: true,
    formatOnPaste: true,
    scrollbar: {
      useShadows: false,
      verticalHasArrows: true,
      horizontalHasArrows: true,
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 17,
      horizontalScrollbarSize: 17,
    }
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="md:hidden flex justify-center space-x-4 my-4">
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'original' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab('original')}
        >
          Original
        </button>
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'modified' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setActiveTab('modified')}
        >
          Modified
        </button>
      </div>

      <div className="flex-grow flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 px-4 py-4">
        <div className={`w-full md:w-1/2 ${activeTab === 'original' ? 'block' : 'hidden md:block'}`}>
          <h2 className="text-xl font-bold mb-2 text-center md:text-left">Original Code</h2>
          <Monaco
            height="calc(100vh - 160px)"
            language="javascript"
            theme={isDarkMode ? 'vs-dark' : 'vs-light'}
            value={originalCode}
            onChange={(value) => setOriginalCode(value)}
            onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, true)}
            options={editorOptions}
          />
        </div>

        <div className={`w-full md:w-1/2 ${activeTab === 'modified' ? 'block' : 'hidden md:block'}`}>
          <h2 className="text-xl font-bold mb-2 text-center md:text-left">Modified Code</h2>
          <Monaco
            height="calc(100vh - 160px)"
            language="javascript"
            theme={isDarkMode ? 'vs-dark' : 'vs-light'}
            value={modifiedCode}
            onChange={(value) => setModifiedCode(value)}
            onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, false)}
            options={editorOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default DiffChecker;