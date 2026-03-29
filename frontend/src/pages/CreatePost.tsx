import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, ArrowLeft, File } from 'lucide-react';
import api from '../api/axios';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [subjectCategory, setSubjectCategory] = useState('General');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please attach a PDF file for your resource.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subjectCategory', subjectCategory);
    formData.append('pdf', file);

    try {
      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-primary-light hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Feed
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/50">
              <UploadCloud className="text-primary-light" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
                Share a Resource
              </h1>
              <p className="text-textMuted mt-1 text-sm">Upload a PDF and share your knowledge.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Calculus Notes"
                className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Category</label>
              <select
                value={subjectCategory}
                onChange={(e) => setSubjectCategory(e.target.value)}
                className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none transition-all appearance-none"
              >
                <option value="General">General</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Literature">Literature</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide details about what you are sharing..."
                className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none transition-all resize-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Resource File (PDF Only)</label>
              <label className={`w-full flex-col flex items-center justify-center p-8 border-2 ${file ? 'border-primary-light bg-primary/5' : 'border-dashed border-white/20 bg-[#0f172a]/50 hover:bg-white/5'} rounded-2xl cursor-pointer transition-all`}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <File size={40} className="text-primary-light mb-3" />
                    <span className="text-white font-medium">{file.name}</span>
                    <span className="text-textMuted text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="text-primary-light text-sm mt-4 font-medium hover:underline">Change File</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <UploadCloud size={40} className="text-textMuted mb-3" />
                    <span className="text-white font-medium">Click to upload or drag and drop</span>
                    <span className="text-textMuted text-sm mt-1">Maximum file size: 10MB</span>
                  </div>
                )}
              </label>
            </div>

            <hr className="border-white/5 my-8" />

            <div className="flex justify-end gap-4">
              <Link
                to="/"
                className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
