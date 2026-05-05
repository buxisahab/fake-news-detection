import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, HelpCircle, Loader2, Copy, Trash2, Newspaper, CheckCircle2, AlertTriangle, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_NEWS = [
  "Breaking: New scientific breakthrough suggests that the moon is actually made of a rare titanium alloy, not rock.",
  "Report: Local mayor caught on camera giving secret speeches to a group of squirrels in the park last Tuesday.",
  "Tech Alert: Silicon Valley startup claims to have invented a way to download food directly into your refrigerator."
];

function App() {
  const [news, setNews] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState({ reasoning: '', inconsistencies: '' });

  useEffect(() => {
    if (result) {
      setDisplayText({ reasoning: '', inconsistencies: '' });
      let rIndex = 0;
      let iIndex = 0;
      
      const rInterval = setInterval(() => {
        if (rIndex < result.reasoning.length) {
          setDisplayText(prev => ({ ...prev, reasoning: result.reasoning.slice(0, rIndex + 1) }));
          rIndex++;
        } else {
          clearInterval(rInterval);
          const iInterval = setInterval(() => {
            if (iIndex < result.inconsistencies.length) {
              setDisplayText(prev => ({ ...prev, inconsistencies: result.inconsistencies.slice(0, iIndex + 1) }));
              iIndex++;
            } else {
              clearInterval(iInterval);
            }
          }, 5);
        }
      }, 5);
      
      return () => clearInterval(rInterval);
    }
  }, [result]);

  const analyzeNews = async () => {
    if (!news.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news })
      });
      if (!response.ok) throw new Error('Failed to connect to the analysis engine.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = `Verdict: ${result.verdict}\nConfidence: ${result.confidence}%\nReasoning: ${result.reasoning}\nInconsistencies: ${result.inconsistencies}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusClass = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'real': return 'real';
      case 'fake': return 'fake';
      default: return 'suspicious';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'real': return <ShieldCheck />;
      case 'fake': return <ShieldAlert />;
      default: return <AlertTriangle />;
    }
  };

  return (
    <div className="app-container">
      <nav className="nav">
        <div className="logo">
          <div className="logo-icon"><Newspaper size={20} color="white" /></div>
          <span>Fake News <span style={{color: '#818cf8'}}>Detection</span></span>
        </div>
        <div className="nav-info" style={{display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#94a3b8'}}>
           <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Sparkles size={14} /> Gemini 1.5 Flash</span>
        </div>
      </nav>

      <header className="header">
        <h1 className="gradient-title">Detect Truth in a <br/> World of Misinformation</h1>
        <p style={{color: '#94a3b8', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto'}}>
          Advanced AI analysis for news articles, social media claims, and media reports.
        </p>
      </header>

      <div className="glass-card">
        <div className="input-wrapper">
          <textarea 
            value={news}
            onChange={(e) => setNews(e.target.value)}
            placeholder="Paste news content here..."
          />
          <div className="input-actions">
            <button className="btn btn-ghost" onClick={() => setNews('')}>
              <Trash2 size={16} /> Clear
            </button>
            <button className="btn btn-ghost" onClick={() => setNews(SAMPLE_NEWS[Math.floor(Math.random() * SAMPLE_NEWS.length)])}>
              <RefreshCcw size={16} /> Try Sample
            </button>
          </div>
        </div>

        <button className="btn btn-primary" onClick={analyzeNews} disabled={loading || !news.trim()}>
          {loading ? (
            <><Loader2 className="animate-spin" /> Processing...</>
          ) : (
            <><Search size={20} /> Run Advanced Analysis</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <div className="result-container">
            <div className={`glass-card result-card`}>
              <div className="result-header">
                <div className="verdict-badge">
                  <div className={`verdict-icon bg-${getStatusClass(result.verdict)} status-${getStatusClass(result.verdict)}`}>
                    {getVerdictIcon(result.verdict)}
                  </div>
                  <div className="verdict-info">
                    <span style={{fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase'}}>Verdict</span>
                    <h2 className={`status-${getStatusClass(result.verdict)}`}>{result.verdict}</h2>
                  </div>
                </div>

                <div className="confidence-bar-wrapper">
                  <div className="confidence-label">
                    <span>Confidence</span>
                    <span>{result.confidence}%</span>
                  </div>
                  <div className="progress-bg">
                    <motion.div 
                      className={`progress-fill fill-${getStatusClass(result.verdict)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <button className="btn btn-ghost" onClick={copyToClipboard} style={{padding: '16px'}}>
                  {copied ? <CheckCircle2 size={20} color="#10b981" /> : <Copy size={20} />}
                </button>
              </div>

              <div className="grid-details">
                <div className="detail-card">
                  <h3><HelpCircle size={16} color="#818cf8" /> Reasoning</h3>
                  <div className="content-box">
                    {displayText.reasoning}
                  </div>
                </div>
                <div className="detail-card">
                  <h3><ShieldAlert size={16} color="#ef4444" /> Inconsistencies</h3>
                  <div className="content-box">
                    {displayText.inconsistencies}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <footer className="footer">
        <p>AI-based analysis, may not be 100% accurate. Always verify with trusted sources.</p>
        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', opacity: 0.5}}>
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
          <span>API</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
