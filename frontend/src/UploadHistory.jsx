import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Loader2 } from 'lucide-react';

const UploadHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/documents/history');
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Failed to load upload records.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="w-full mt-16 pt-8 border-t border-slate-800/50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-x-auto shadow-2xl relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <History className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Recent Upload Records</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-center text-sm">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No documents have been uploaded yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700/50 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-4 px-4 font-medium">File Name</th>
                <th className="pb-4 px-4 font-medium">Department</th>
                <th className="pb-4 px-4 font-medium">Year</th>
                <th className="pb-4 px-4 font-medium">Month</th>
                <th className="pb-4 px-4 font-medium">Date</th>
                <th className="pb-4 px-4 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {history.map((doc) => (
                <tr key={doc._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4 px-4 font-medium text-slate-200 truncate max-w-[200px]" title={doc.filename}>
                    {doc.filename}
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {doc.metadata?.department || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">{doc.metadata?.year || '-'}</td>
                  <td className="py-4 px-4 text-slate-400">{doc.metadata?.month || '-'}</td>
                  <td className="py-4 px-4 text-slate-400">
                    {doc.metadata?.uploadDate ? new Date(doc.metadata.uploadDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-right font-mono text-xs">
                    {doc.metadata?.uploadDate ? new Date(doc.metadata.uploadDate).toLocaleTimeString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UploadHistory;
