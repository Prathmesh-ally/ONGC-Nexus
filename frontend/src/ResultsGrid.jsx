import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, FileImage, FileCode, Archive, Video, LayoutTemplate, X } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { searchPlugin } from '@react-pdf-viewer/search';
import '@react-pdf-viewer/search/lib/styles/index.css';

const getIcon = (type) => {
  if (!type) return <FileText className="w-6 h-6 text-gray-400" />;
  const t = type.toLowerCase();
  if (t.includes('pdf') || t.includes('word') || t.includes('docx')) return <FileText className="w-6 h-6 text-blue-400" />;
  if (t.includes('image') || t.includes('png') || t.includes('jpeg')) return <FileImage className="w-6 h-6 text-purple-400" />;
  if (t.includes('script') || t.includes('json') || t.includes('js') || t.includes('markdown')) return <FileCode className="w-6 h-6 text-yellow-400" />;
  if (t.includes('archive') || t.includes('zip')) return <Archive className="w-6 h-6 text-red-400" />;
  if (t.includes('video') || t.includes('mp4')) return <Video className="w-6 h-6 text-pink-400" />;
  if (t.includes('cad') || t.includes('dwg')) return <LayoutTemplate className="w-6 h-6 text-emerald-400" />;
  return <FileText className="w-6 h-6 text-gray-400" />;
};

const highlightKeywords = (text, query) => {
  if (!text) return null;
  if (!query || !query.trim()) return <>{text}</>;

  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tokens = query.trim().split(/\s+/).map(escapeRegExp).filter(t => t.length > 0);
  
  if (tokens.length === 0) return <>{text}</>;

  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = tokens.some(token => new RegExp(`^${token}$`, 'i').test(part));
        if (isMatch) {
          return (
            <span 
              key={index} 
              className="bg-indigo-500/40 text-indigo-100 font-bold px-1.5 py-0.5 rounded shadow-sm border border-indigo-500/30"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};


const AutoSearchControl = ({ renderSearchProps, searchKeyword }) => {
    const propsRef = useRef(renderSearchProps);

    useEffect(() => {
        propsRef.current = renderSearchProps;
    }, [renderSearchProps]);


    useEffect(() => {
        if (!searchKeyword) return;

        let attempts = 0;
        
        const interval = setInterval(() => {
            attempts++;
            const currentProps = propsRef.current;

            if (currentProps.keyword !== searchKeyword) {
                currentProps.setKeyword(searchKeyword);
            }

            currentProps.search();

            if (currentProps.numberOfMatches > 0) {
                console.log(` Goal Reached: Found ${currentProps.numberOfMatches} matches for "${searchKeyword}"`);
                clearInterval(interval);
            } else if (attempts >= 40) {
                console.log(` Loop stopped: Could not find "${searchKeyword}" after 20 seconds.`);
                clearInterval(interval);
            }
        }, 500); 

        return () => clearInterval(interval);
    }, [searchKeyword]); 

    return (
        <div className="flex items-center justify-end w-full gap-4 text-sm font-medium">
            
            {}
            <input
                type="text"
                value={renderSearchProps.keyword}
                onChange={(e) => renderSearchProps.setKeyword(e.target.value)}
                className="hidden"
                aria-hidden="true"
            />

            <span className="text-slate-300">
                {renderSearchProps.numberOfMatches > 0 ? renderSearchProps.currentMatch : 0} of {renderSearchProps.numberOfMatches} Matches
            </span>
            <button
                onClick={renderSearchProps.jumpToPreviousMatch}
                disabled={renderSearchProps.currentMatch <= 1 || renderSearchProps.numberOfMatches === 0}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Prev
            </button>
            <button
                onClick={renderSearchProps.jumpToNextMatch}
                disabled={renderSearchProps.currentMatch === renderSearchProps.numberOfMatches || renderSearchProps.numberOfMatches === 0}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Next
            </button>
        </div>
    );
};

// const AutoSearchControl = ({ renderSearchProps, searchKeyword }) => {
//     const ghostButtonRef = useRef(null);

//     // 1. Sync the prop to the plugin's internal UI state
//     useEffect(() => {
//         if (searchKeyword) {
//             renderSearchProps.setKeyword(searchKeyword);
//         }
//     }, [searchKeyword, renderSearchProps]);

//     // 2. Poll using the Ghost Clicker
//     useEffect(() => {
//         if (searchKeyword && renderSearchProps.keyword === searchKeyword) {
//             let attempts = 0;
//             const interval = setInterval(() => {
//                 // Physically click the hidden button using native DOM API
//                 if (ghostButtonRef.current) {
//                     ghostButtonRef.current.click();
//                 }
//                 attempts++;
                
//                 if (renderSearchProps.numberOfMatches > 0 || attempts >= 15) {
//                     clearInterval(interval);
//                 }
//             }, 800);

//             return () => clearInterval(interval);
//         }
//     }, [searchKeyword, renderSearchProps]);

//     return (
//         <div className="flex items-center justify-end w-full gap-4 text-sm font-medium">
            
//             {/* THE INVISIBLE INPUT HACK */}
//             <input
//                 type="text"
//                 value={renderSearchProps.keyword}
//                 onChange={(e) => renderSearchProps.setKeyword(e.target.value)}
//                 className="hidden"
//                 aria-hidden="true"
//             />
            
//             {/* THE INVISIBLE GHOST BUTTON */}
//             <button 
//                 ref={ghostButtonRef}
//                 onClick={renderSearchProps.search}
//                 className="hidden"
//                 aria-hidden="true"
//             >
//                 Ghost Search
//             </button>

//             <span className="text-slate-300">
//                 {renderSearchProps.numberOfMatches > 0 ? renderSearchProps.currentMatch : 0} of {renderSearchProps.numberOfMatches} Matches
//             </span>
//             <button
//                 onClick={renderSearchProps.jumpToPreviousMatch}
//                 disabled={renderSearchProps.currentMatch <= 1 || renderSearchProps.numberOfMatches === 0}
//                 className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//                 Prev
//             </button>
//             <button
//                 onClick={renderSearchProps.jumpToNextMatch}
//                 disabled={renderSearchProps.currentMatch === renderSearchProps.numberOfMatches || renderSearchProps.numberOfMatches === 0}
//                 className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//                 Next
//             </button>
//         </div>
//     );
// };

const ResultsGrid = ({ results, hasSearched, searchQuery = "" }) => {
  const [activeDocument, setActiveDocument] = useState(null);

  const searchPluginInstance = searchPlugin();
  const { Search } = searchPluginInstance;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDocument(null);
      }
    };

    if (activeDocument) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeDocument]);

  const closeViewer = () => setActiveDocument(null);
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeViewer();
    }
  };

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p className="text-lg">Enter a query above to search the knowledge repository.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in duration-500">
        <p className="text-xl font-medium mb-2">No matching documents found.</p>
        <p className="text-sm">Try adjusting your search terms or switching logic modes.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        {results.map((doc, index) => (
          <div 
            key={doc._id || index}
            onClick={() => setActiveDocument(doc)}
            className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)] hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col h-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="p-2 bg-slate-800 rounded-lg shadow-inner group-hover:bg-slate-700/50 transition-colors shrink-0">
                {getIcon(doc.file_type)}
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                {doc.file_type}
              </span>
            </div>
            
            <h3 className="font-medium text-slate-200 mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors duration-300" title={doc.filename}>
              {highlightKeywords(doc.filename, searchQuery)}
            </h3>
            
            <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed flex-grow">
              {highlightKeywords(doc.extracted_text, searchQuery)}
            </p>
            
            <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between relative h-10">
              <div className="flex flex-wrap gap-2 overflow-hidden flex-1 pr-24">
                {doc.metadata && Object.entries(doc.metadata).slice(0, 1).map(([key, value]) => (
                  <span key={key} className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded truncate max-w-full" title={String(value)}>
                    <span className="text-slate-400 capitalize">{key}:</span> {String(value)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeDocument && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleBackdropClick}
        >
          <div 
            className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300 overflow-hidden relative"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10 shadow-sm gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="p-2.5 bg-slate-800 rounded-xl shrink-0 shadow-inner">
                  {getIcon(activeDocument.file_type)}
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-100 truncate" title={activeDocument.filename}>
                  {highlightKeywords(activeDocument.filename, searchQuery)}
                </h2>
              </div>
              <button 
                onClick={closeViewer}
                className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-20"
                aria-label="Close Viewer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row overflow-hidden flex-1 relative bg-slate-900/50">
              
              <div className="w-full md:w-72 bg-slate-800/30 border-b md:border-b-0 md:border-r border-slate-800/60 p-6 overflow-y-auto flex shrink-0 flex-col gap-8 shadow-inner">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">File Format</h4>
                  <div className="inline-flex">
                    <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
                      {activeDocument.file_type}
                    </span>
                  </div>
                </div>

                {activeDocument.metadata && Object.keys(activeDocument.metadata).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Metadata</h4>
                    <div className="flex flex-col gap-3">
                      {Object.entries(activeDocument.metadata).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 text-sm transition-colors hover:bg-slate-800">
                          <div className="text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wide">{key}</div>
                          <div className="text-slate-200 font-semibold break-words leading-snug">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-[#0a0f1c] relative h-[80vh] overflow-y-auto">
                {activeDocument.fileUrl ? (
                  <div className="flex flex-col h-full w-full">
                    <div className="flex items-center justify-between bg-slate-900 p-3 border-b border-slate-700 text-white z-10 w-full shadow-md">
                       <Search>
                          {(renderSearchProps) => (
                              <AutoSearchControl
                                  renderSearchProps={renderSearchProps}
                                  searchKeyword={searchQuery}
                              />
                          )}
                       </Search>
                    </div>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                      <Viewer 
                        fileUrl={`http://localhost:5000${activeDocument.fileUrl}`} 
                        plugins={[searchPluginInstance]} 
                        theme="dark" 
                      />
                    </Worker>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <p>No visual document available. Try uploading a new PDF.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultsGrid;
