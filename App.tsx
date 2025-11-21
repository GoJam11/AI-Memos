import React, { useState, useEffect, useMemo } from 'react';
import { Memo, extractTags } from './types';
import MemoEditor from './components/MemoEditor';
import MemoCard from './components/MemoCard';
import Heatmap from './components/Heatmap';
import AIChat from './components/AIChat';
import { Hash, Search, Bot, Settings, Layout } from 'lucide-react';

const App: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('gemini_memos');
    if (saved) {
      try {
        setMemos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load memos", e);
      }
    } else {
        // Initial dummy data
        const dummy: Memo[] = [
            { id: '1', content: 'Welcome to #Gemini Memos! This is a lightweight note-taking app.', createdAt: Date.now(), tags: ['Gemini'], visibility: 'PUBLIC' },
            { id: '2', content: 'You can ask the AI Assistant about your notes using the bot icon.', createdAt: Date.now() - 86400000, tags: [], visibility: 'PRIVATE' }
        ];
        setMemos(dummy);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('gemini_memos', JSON.stringify(memos));
  }, [memos]);

  const handleSaveMemo = (content: string) => {
    if (editingMemoId) {
      // Update existing
      setMemos(prev => prev.map(m => {
        if (m.id === editingMemoId) {
          return {
            ...m,
            content,
            tags: extractTags(content)
          };
        }
        return m;
      }));
      setEditingMemoId(null);
    } else {
      // Create new
      const newMemo: Memo = {
        id: Date.now().toString(),
        content,
        createdAt: Date.now(),
        tags: extractTags(content),
        visibility: 'PUBLIC',
      };
      setMemos(prev => [newMemo, ...prev]);
    }
  };

  const handleDeleteMemo = (id: string) => {
    if (window.confirm("Are you sure you want to delete this memo?")) {
      setMemos(prev => prev.filter(m => m.id !== id));
      if (editingMemoId === id) {
        setEditingMemoId(null);
      }
    }
  };

  const handleEditMemo = (id: string) => {
    setEditingMemoId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMemoId(null);
  };

  const activeMemo = useMemo(() => 
    memos.find(m => m.id === editingMemoId), 
  [memos, editingMemoId]);

  const filteredMemos = useMemo(() => {
    return memos.filter(memo => {
      const matchesSearch = memo.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = activeTag ? memo.tags.includes(activeTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [memos, searchQuery, activeTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    memos.forEach(m => m.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [memos]);

  return (
    <div className="flex h-screen w-full bg-gray-50 relative">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white p-6 flex-shrink-0 h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-8 text-gray-800 font-bold text-xl">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                <Layout size={20} />
            </div>
            GeminiMemos
        </div>
        
        <div className="mb-8">
            <Heatmap memos={memos} />
        </div>

        <div className="flex flex-col gap-2 mb-8">
             <button 
                onClick={() => { setActiveTag(null); setSearchQuery(''); }}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!activeTag ? 'bg-gray-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                All Memos
            </button>
            <button 
                onClick={() => setIsChatOpen(true)}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
                <Bot size={16} /> Ask AI Assistant
            </button>
        </div>

        <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
            <div className="flex flex-col gap-1">
                {allTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
                            activeTag === tag ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Hash size={14} />
                            <span className="truncate max-w-[120px]">{tag}</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {memos.filter(m => m.tags.includes(tag)).length}
                        </span>
                    </button>
                ))}
                {allTags.length === 0 && <span className="text-gray-400 text-sm px-3">No tags yet</span>}
            </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-4">
        <div className="font-bold text-lg flex items-center gap-2">
            <div className="bg-primary-600 text-white p-1 rounded">
                <Layout size={16} />
            </div>
            Memos
        </div>
        <button onClick={() => setIsChatOpen(true)} className="p-2 text-gray-600 bg-gray-100 rounded-full">
            <Bot size={20} />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full w-full md:px-8 pt-20 md:pt-8 pb-20">
        <div className="max-w-2xl mx-auto w-full px-4 md:px-0">
            
            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search memos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                />
            </div>

            {/* Editor */}
            <MemoEditor 
                onSave={handleSaveMemo} 
                memo={activeMemo}
                onCancel={handleCancelEdit}
            />

            {/* Active Filter Indicator */}
            {activeTag && (
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Filtered by:</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        #{activeTag}
                        <button onClick={() => setActiveTag(null)} className="hover:text-blue-900"><Settings size={12} /></button>
                    </span>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {filteredMemos.length > 0 ? (
                    filteredMemos.map(memo => (
                        <MemoCard 
                            key={memo.id} 
                            memo={memo} 
                            onDelete={handleDeleteMemo}
                            onEdit={handleEditMemo}
                            onTagClick={(t) => setActiveTag(t)}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>No memos found.</p>
                    </div>
                )}
            </div>
        </div>
      </main>

      {/* AI Chat Drawer */}
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        memos={memos}
      />
    </div>
  );
};

export default App;