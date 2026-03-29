import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, MessageSquare } from 'lucide-react';
import api from '../api/axios';

interface MyComment {
  _id: string;
  text: string;
  createdAt: string;
  postHead: { title: string };
  post?: any; // Just in case it expands
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Student';
  const [comments, setComments] = useState<MyComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyComments = async () => {
    try {
      const response = await api.get('/posts/comments/me');
      setComments(response.data || []);
    } catch (err) {
      console.error('Failed to fetch user comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-full h-full bg-[#1e293b] border-r border-white/10 flex flex-col p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <User size={24} />
        </div>
        <div className="overflow-hidden">
          <h2 className="text-white font-bold text-lg truncate">{userName}</h2>
          <p className="text-emerald-400 text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
        <h3 className="text-textMuted text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageSquare size={14} /> My Recent Comments
        </h3>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#0f172a] rounded-xl border border-white/5"></div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center bg-[#0f172a]/50 p-6 rounded-xl border border-white/5">
            <MessageSquare className="mx-auto text-textMuted/40 mb-2" size={24} />
            <p className="text-textMuted text-sm">No comments yet. Start engaging!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-[#0f172a] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                <p className="text-xs text-primary-light font-medium truncate mb-1">
                  On: {comment.post?.title || 'Unknown Post'}
                </p>
                <p className="text-sm text-textLight line-clamp-2">{comment.text}</p>
                <p className="text-[10px] text-textMuted mt-2 text-right">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl transition-all font-medium border border-red-500/20"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
