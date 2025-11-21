export interface Memo {
  id: string;
  content: string;
  createdAt: number;
  tags: string[];
  visibility: 'PUBLIC' | 'PRIVATE';
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

// Helper to extract tags from content like "#tag"
export const extractTags = (content: string): string[] => {
  const regex = /#(\w+)/g;
  const matches = content.match(regex);
  if (!matches) return [];
  return matches.map(tag => tag.substring(1)); // remove #
};