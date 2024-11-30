import React, { useEffect, useRef, useState, useCallback } from 'react';
import Monaco from '@monaco-editor/react';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import useThemeStore from '../store/useThemeStore';
import useFontSizeStore from '../store/useFontSizeStore';
import useLanguageDetectionStore from '../store/useLanguageDetectionStore';
import useMinimapStore from '../store/useMinimapStore';
import { jwtDecode } from 'jwt-decode';

// Import languages for highlight.js detection
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import csharp from 'highlight.js/lib/languages/csharp';
import typescript from 'highlight.js/lib/languages/typescript';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import scala from 'highlight.js/lib/languages/scala'; 
import php from 'highlight.js/lib/languages/php';
import sql from 'highlight.js/lib/languages/sql';
import react from 'highlight.js/lib/languages/xml';
import angular from 'highlight.js/lib/languages/typescript';

// Register languages with highlight.js
const languages = { javascript, python, css, java, cpp, xml, json, markdown, csharp, typescript, ruby, go, rust, swift, kotlin, scala, php, sql, react, angular };
Object.entries(languages).forEach(([name, lang]) => hljs.registerLanguage(name, lang));

const CodeEditor = ({ 
  code, 
  setCode, 
  language, 
  setLanguage, 
  socket, 
  slug, 
  isAuthenticated,
  codespace
}) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const editorRef = useRef(null);
  const { fontSize } = useFontSizeStore();
  const [decorations, setDecorations] = useState([]);
  const isLanguageDetectionEnabled = useLanguageDetectionStore(
    (state) => state.isLanguageDetectionEnabled
  );
  const { isMinimapEnabled } = useMinimapStore();

  const getCurrentUserId = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        return decoded.id;
      }
      return null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  const canEdit = useCallback(() => {
    if (!codespace) return false;
    if (!isAuthenticated) return false;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;

    // Owner can always edit
    if (parseInt(codespace.owner_id) === parseInt(currentUserId)) return true;
    
    // For shared codespaces, anyone with access can edit
    if (codespace.access_type === 'shared' && codespace.hasAccess) return true;
    
    // For public codespaces, any authenticated user can edit
    if (codespace.access_type === 'public') return true;
    
    return false;
  }, [codespace, isAuthenticated]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ 
        theme: isDarkMode ? 'vs-dark' : 'light',
        fontSize: fontSize,
        minimap: { enabled: isAuthenticated ? isMinimapEnabled : false }
      });
    }
  }, [isDarkMode, fontSize, isMinimapEnabled, isAuthenticated]);

  const detectLanguage = (content) => {
    if (!isAuthenticated || !isLanguageDetectionEnabled) {
      return 'plaintext';
    }

    if (!content || content.trim() === '') return 'plaintext';

    try {
      const result = hljs.highlightAuto(content, Object.keys(languages));
      console.log('Language detection:', result.language, 'Relevance:', result.relevance);
      
      if (result.relevance > 1) {
        return result.language;
      }
      return 'plaintext';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'plaintext';
    }
  };

  const handleEditorChange = (value) => {
    if (!canEdit()) return;
    
    setCode(value);
    if (value && value.length > 10 && isLanguageDetectionEnabled) {
      const detectedLang = detectLanguage(value);
      if (detectedLang !== language) {
        console.log('Changing language from', language, 'to', detectedLang);
        setLanguage(detectedLang);
      }
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Initial language detection
    if (code) {
      const detectedLang = detectLanguage(code);
      if (detectedLang !== language) {
        setLanguage(detectedLang);
      }
    }

    editor.updateOptions({ 
      theme: isDarkMode ? 'vs-dark' : 'light',
      fontSize: fontSize,
      minimap: { enabled: isAuthenticated ? isMinimapEnabled : false }
    });

    editor.onDidChangeCursorSelection((e) => {
      if (socket) {
        const selection = editor.getSelection();
        if (selection.isEmpty()) {
          socket.emit('clearSelection', { slug });
        } else {
          socket.emit('selectionChange', { slug, selection });
        }
      }
    });

    editor.onDidChangeModelContent((e) => {
      clearRemoteSelection();
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare var console: {
        log(message?: any, ...optionalParams: any[]): void;
      };
    `, 'ts:filename/console.d.ts');
  };

  const clearRemoteSelection = () => {
    if (editorRef.current) {
      const clearedDecorations = editorRef.current.deltaDecorations(decorations, []);
      setDecorations(clearedDecorations);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('selectionUpdate', ({ selection }) => {
        if (editorRef.current) {
          clearRemoteSelection();
          const newDecorations = editorRef.current.deltaDecorations([], [
            {
              range: selection,
              options: {
                className: 'remote-selection',
                hoverMessage: { value: 'Remote selection' }
              }
            }
          ]);
          setDecorations(newDecorations);
        }
      });

      socket.on('clearSelection', () => {
        clearRemoteSelection();
      });
    }

    return () => {
      if (socket) {
        socket.off('selectionUpdate');
        socket.off('clearSelection');
      }
    };
  }, [socket]);

  return (
    <div className="h-[calc(100vh-7.5rem)] w-full">
      <Monaco
        height="100%"
        width="100%"
        language={language}
        theme={isDarkMode ? 'vs-dark' : 'light'}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: fontSize,
          padding: { top: 20, bottom: 20 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          minimap: { enabled: isAuthenticated ? isMinimapEnabled : false },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true, 
          autoClosingBrackets: 'always',
          autoIndent: 'full',
          formatOnType: true,
          formatOnPaste: true,
          readOnly: !canEdit()
        }}
      />
    </div>
  );
};

export default CodeEditor;