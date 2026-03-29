import React, { useEffect, useState } from 'react';
import { FileText, MessageCircle, Send, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Comment {
  _id: string;
  author: { _id: string; username: string };
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  description: string;
  pdfUrl: string;
  author: { _id: string; username: string };
  createdAt: string;
  comments: Comment[];
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      // Assume API returns array of posts or { data: posts }
      setPosts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleComment = async (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      await api.post(`/posts/${postId}/comments`, { text });
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      fetchPosts(); // Refresh to see the new comment
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-primary-light">
        <div className="animate-pulse flex items-center gap-2 text-xl font-medium">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0f172a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
              Uninsta Feed
            </h1>
            <p className="text-textMuted mt-2">Discover and share academic resources.</p>
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span>New Post</span>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center bg-[#1e293b] p-12 rounded-2xl border border-white/5">
            <FileText className="mx-auto text-textMuted/50 mb-4" size={48} />
            <p className="text-textMuted text-lg">No posts available yet. Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post._id} className="bg-[#1e293b] rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <span className="bg-[#0f172a] px-3 py-1 rounded-full border border-white/5">
                        Author: {post.author?.username || 'Unknown'}
                      </span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-textLight mb-6 leading-relaxed bg-[#0f172a]/50 p-4 rounded-xl border border-white/5">
                  {post.description}
                </p>

                {post.pdfUrl && (
                  <a
                    href={post.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-secondary/50 text-secondary-light hover:bg-secondary/10 px-5 py-3 rounded-xl transition-all font-medium mb-8"
                  >
                    <FileText size={20} />
                    View Associated Resource File (PDF/Image)
                  </a>
                )}

                <hr className="border-white/5 mb-6" />

                <div>
                  <h3 className="flex items-center gap-2 text-lg font-medium text-white mb-4">
                    <MessageCircle className="text-textMuted" size={20} />
                    Comments ({post.comments?.length || 0})
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {post.comments?.map((comment) => (
                      <div key={comment._id} className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-primary-light text-sm">{comment.author?.username || 'Unknown User'}</span>
                          <span className="text-xs text-textMuted">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-textLight">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Add a thoughtful comment..."
                      value={commentText[post._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      className="flex-1 bg-[#0f172a] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none text-sm transition-all"
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      disabled={!commentText[post._id]?.trim()}
                      className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-white/5 text-primary-light px-6 py-3 rounded-xl border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:w-auto w-full"
                    >
                      <Send size={16} />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
