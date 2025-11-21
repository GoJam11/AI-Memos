import React, { useState, useCallback, useEffect } from 'react';
import { Send, Sparkles, Tag, X, Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateSmartTags } from '../services/geminiService';
import { Memo } from '../types';

interface MemoEditorProps {
  onSave: (content: string) => void;
  memo?: Memo;
  onCancel: () => void;
}

const MemoEditor: React.FC<MemoEditorProps> = ({ onSave, memo, onCancel }) => {
  const [content, setContent] = useState('');
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (memo) {
      setContent(memo.content);
      setIsPreviewMode(false);
    } else {
      setContent('');
      setIsPreviewMode(false);
    }
  }, [memo]);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(content);
    if (!memo) {
        setContent('');
        setIsPreviewMode(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape' && memo) {
      onCancel();
    }
  };

  const handleSmartTags = useCallback(async () => {
    if (!content.trim() || isGeneratingTags) return;
    
    // Switch to edit mode to show changes
    if (isPreviewMode) setIsPreviewMode(false);

    setIsGeneratingTags(true);
    try {
      const tags = await generateSmartTags(content);
      if (tags.length > 0) {
        const tagString = tags.map(t => `#${t}`).join(' ');
        setContent(prev => `${prev}\n\n${tagString}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingTags(false);
    }
  }, [content, isGeneratingTags, isPreviewMode]);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 transition-all focus-within:shadow-md ${memo ? 'ring-2 ring-primary-50 border-primary-200' : ''}`}>
      {memo && (
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-primary-100">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Editing Memo</span>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
                <X size={14} />
            </button>
        </div>
      )}
      
      {isPreviewMode ? (
        <div 
            className="w-full h-24 overflow-y-auto prose prose-sm prose-slate max-w-none text-gray-700 text-base bg-transparent py-1 px-1 border border-transparent cursor-pointer"
            onClick={() => setIsPreviewMode(false)}
            title="Click to edit"
        >
             {content.trim() ? (
                 <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" {...props} />,
                    input: ({node, ...props}) => {
                      if (props.type === 'checkbox') {
                        return <input type="checkbox" className="mr-2 accent-primary-600" {...props} />
                      }
                      return <input {...props} />
                    }
                  }}>
                    {content}
                  </ReactMarkdown>
             ) : (
                 <span className="text-gray-400 italic">Nothing to preview</span>
             )}
        </div>
      ) : (
        <textarea
            className="w-full h-24 resize-none border-none outline-none text-gray-700 text-base placeholder-gray-400 bg-transparent py-1 px-1"
            placeholder={memo ? "Edit your memo..." : "What's on your mind?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={!!memo}
        />
      )}

      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <div className="flex gap-2 items-center">
           <button 
            onClick={handleSmartTags}
            disabled={!content.trim() || isGeneratingTags}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
              isGeneratingTags ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
            title="Generate tags with Gemini"
          >
            <Sparkles size={14} />
            {isGeneratingTags ? 'Thinking...' : 'AI Tags'}
          </button>

          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                isPreviewMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
            }`}
            title={isPreviewMode ? "Switch to Edit" : "Switch to Preview"}
          >
             {isPreviewMode ? <EyeOff size={14} /> : <Eye size={14} />}
             {isPreviewMode ? 'Edit' : 'Preview'}
          </button>

          <span className="text-xs text-gray-400 flex items-center gap-1 hidden sm:flex">
            <Tag size={14} />
            Type #tag
          </span>
        </div>
        <div className="flex gap-2">
            {memo && (
                <button 
                    onClick={onCancel}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                    Cancel
                </button>
            )}
            <button
                onClick={handleSave}
                disabled={!content.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {memo ? 'Update' : 'Memo'} <Send size={14} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default MemoEditor;