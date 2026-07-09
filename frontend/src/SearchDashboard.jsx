import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, Database, ToggleLeft, ToggleRight, UploadCloud, X, FileUp, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ResultsGrid from './ResultsGrid';
import UploadHistory from './UploadHistory';

const DEPARTMENTS = ['Exploration', 'Drilling', 'Production', 'Engineering', 'HR', 'Finance'];

const SearchDashboard = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('OR'); // 'OR' | 'AND'
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const [searchDepartment, setSearchDepartment] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(DEPARTMENTS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Admin Portal State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Normal');
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminStatus, setAdminStatus] = useState(null);

  // RBAC checks
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const canUpload = user?.role === 'MasterAdmin' || user?.role === 'Uploader';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    setIsRegistering(true);
    setAdminStatus(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/register', 
        { username: newUsername, password: newPassword, role: newUserRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminStatus({ type: 'success', msg: 'User created successfully!' });
      setNewUsername('');
      setNewPassword('');
      setNewUserRole('Normal');
      setTimeout(() => setAdminStatus(null), 3000);
    } catch (err) {
      console.error('Register failed:', err);
      setAdminStatus({ type: 'error', msg: err.response?.data?.error || 'Registration failed.' });
    } finally {
      setIsRegistering(false);
    }
  };

  const fetchResults = async (pageToFetch = 1) => {
    if (!query.trim() && searchDepartment === 'All') return;

    setIsSearching(true);
    setError(null);
    try {
      const response = await axios.post(`http://localhost:5000/api/search?page=${pageToFetch}&limit=10`, {
        query,
        mode,
        department: searchDepartment
      });
      setResults(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
      setTotalResults(response.data.totalResults || 0);
      setHasSearched(true);
    } catch (err) {
      console.error('Search failed:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResults(1);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus(null);
    
    const formData = new FormData();
    // Intentionally using 'file' to perfectly match the backend multer logic: upload.single('file')
    formData.append('file', selectedFile);
    formData.append('department', selectedDepartment);

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus({ type: 'success', msg: 'File uploaded successfully!' });
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus(null);
        setSelectedFile(null);
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadStatus({ type: 'error', msg: err.response?.data?.error || 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const closeUploadModal = () => {
    if (!isUploading) {
      setShowUploadModal(false);
      setUploadStatus(null);
      setSelectedFile(null);
    }
  };

  return (
    <div className="w-full flex-grow flex flex-col relative">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4 relative">
        
        {/* Action Buttons (Top Right corner fixed over header) */}
        <div className="fixed top-6 right-8 z-50 flex items-center gap-4">
          {canUpload && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold rounded-xl border border-indigo-500/30 transition-all shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_-2px_rgba(99,102,241,0.4)]"
            >
              <UploadCloud className="w-5 h-5" />
              Upload PDF
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold rounded-xl border border-slate-700/50 transition-all shadow-lg"
          >
            Logout
          </button>
        </div>

        {/* Admin Portal */}
        {user?.role === 'MasterAdmin' && (
          <div className="mb-12 max-w-3xl mx-auto bg-slate-900/50 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative mt-4">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl pointer-events-none"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-100">Admin Portal: Add User</h2>
              </div>
              
              <form onSubmit={handleRegister} className="flex flex-col sm:flex-row gap-4 items-start">
                <input
                  type="text"
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1 w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  required
                />
                <div className="relative w-full sm:w-auto">
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Uploader">Uploader</option>
                    <option value="MasterAdmin">MasterAdmin</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center whitespace-nowrap"
                >
                  {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create User'}
                </button>
              </form>
              
              {adminStatus && (
                <div className={`mt-4 p-3 rounded-xl text-sm text-center ${adminStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {adminStatus.msg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 text-center animate-in slide-in-from-top-4 duration-700 mt-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 border border-indigo-500/20 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]">
            <Database className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-1">
            Knowledge Repository
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            Search across all organizational documents, CAD files, media assets, and code snippets instantly.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-focus-within:opacity-60 transition duration-500"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-2 flex items-center transition-all duration-300 shadow-2xl">
              <div className="pl-4 pr-2 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keywords, metadata, or document content..."
                className="w-full bg-transparent border-none outline-none py-4 text-lg text-slate-100 placeholder:text-slate-500 focus:ring-0"
              />
              
              <div className="relative mr-2 flex-shrink-0 border-l border-slate-700/50 pl-3">
                <select 
                  value={searchDepartment}
                  onChange={(e) => setSearchDepartment(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none appearance-none pr-10 cursor-pointer transition-colors hover:border-slate-600"
                >
                  <option value="All">All Depts</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSearching || (!query.trim() && searchDepartment === 'All')}
                className="ml-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors duration-200 flex items-center min-w-[120px] justify-center shadow-lg"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
          
          <div className="flex items-center justify-between mt-6 px-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMode(mode === 'OR' ? 'AND' : 'OR')}
                className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-indigo-300 transition-colors"
                type="button"
              >
                {mode === 'OR' ? (
                  <ToggleLeft className="w-6 h-6 text-slate-400" />
                ) : (
                  <ToggleRight className="w-6 h-6 text-indigo-400" />
                )}
                <span>Match {mode === 'OR' ? 'Any Word (OR)' : 'All Words (AND)'}</span>
              </button>
            </div>
            {hasSearched && !isSearching && (
              <span className="text-sm text-slate-400">
                Found {totalResults} result{totalResults !== 1 && 's'}
              </span>
            )}
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Results Grid */}
        <ResultsGrid results={results} hasSearched={hasSearched} searchQuery={query} />

        {/* Pagination UI */}
        {hasSearched && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => fetchResults(currentPage - 1)}
              disabled={currentPage === 1 || isSearching}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-colors shadow-sm"
            >
              Previous
            </button>
            <span className="text-slate-300 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => fetchResults(currentPage + 1)}
              disabled={currentPage === totalPages || isSearching}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        )}

        {/* Upload History Table */}
        <UploadHistory />

      </div>

      {/* Upload Modal Overlay (Framer Motion) */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={closeUploadModal}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <FileUp className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-100">Upload to Knowledge Repository</h2>
                </div>
                <button 
                  onClick={closeUploadModal}
                  disabled={isUploading}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUploadSubmit} className="p-6">
                
                {/* Department Select Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      disabled={isUploading}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow disabled:opacity-50"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* File Input Box */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Document (PDF only)
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${selectedFile ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'} ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className={`w-10 h-10 mb-3 ${selectedFile ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-medium text-indigo-300 mb-1">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-slate-300 mb-1">Click to browse or drag and drop</p>
                        <p className="text-xs text-slate-500">PDF files up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Message */}
                {uploadStatus && (
                  <div className={`mb-6 p-3 rounded-xl text-sm text-center ${uploadStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {uploadStatus.msg}
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center shadow-lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Uploading & Extracting...
                    </>
                  ) : 'Upload Document'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SearchDashboard;
