import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Memo } from '../types';
import { Trash2, Clock, Globe, Lock, Edit3 } from 'lucide-react';

interface MemoCardProps {
  memo: Memo;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onTagClick: (tag: string) => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onDelete, onEdit, onTagClick }) => {
  const date = new Date(memo.createdAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <span className="text-gray-500">{timeString}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>{dateString}</span>
          <span className="ml-1">
            {memo.visibility === 'PUBLIC' ? <Globe size={12} /> : <Lock size={12} />}
          </span>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => onEdit(memo.id)}
            className="text-gray-300 hover:text-blue-600 p-1"
            title="Edit Memo"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => onDelete(memo.id)}
            className="text-gray-300 hover:text-red-500 p-1"
            title="Archive Memo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div 
        className="prose prose-sm prose-slate max-w-none mb-3 text-gray-800 break-words leading-relaxed"
        onDoubleClick={() => onEdit(memo.id)}
      >
        {/* Custom Markdown Rendering to highlight tags */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noreferrer" {...props} />,
            // Custom checkbox styling for task lists
            input: ({node, ...props}) => {
              if (props.type === 'checkbox') {
                return <input type="checkbox" className="mr-2 accent-primary-600" {...props} />
              }
              return <input {...props} />
            }
          }}
        >
          {memo.content}
        </ReactMarkdown>
      </div>

      {memo.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {memo.tags.map(tag => (
            <span 
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoCard;