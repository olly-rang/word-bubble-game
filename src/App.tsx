import { useState, useEffect } from 'react';
import { Wind, Sun, CloudRain, Moon, Sparkles } from 'lucide-react';
import BubbleCanvas from './components/BubbleCanvas';
import type { Theme } from './types';
import { audioManager } from './services/audioManager';
import { detectWeather } from './services/weatherService';
import { generateHealingQuote } from './services/geminiService';
import type { Bubble } from './types';

function App() {
  const [theme, setThemeState] = useState<Theme>('sunny');
  const [showIntro, setShowIntro] = useState(true);
  const [aiQuote, setAiQuote] = useState<string | null>(null);
  const [isQuoteFading, setIsQuoteFading] = useState(false);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    audioManager.setTheme(newTheme);
  };

  const handlePop = async (bubble: Bubble) => {
    if (bubble.isGolden) {
      const quote = await generateHealingQuote(theme);
      setAiQuote(quote);
      setIsQuoteFading(false);

      // Clear quote after 5 seconds
      setTimeout(() => setIsQuoteFading(true), 4000);
      setTimeout(() => setAiQuote(null), 5000);
    }
  };

  // Initial setup: detect weather and start audio
  useEffect(() => {
    const initApp = async () => {
      const detectedTheme = await detectWeather();
      setTheme(detectedTheme);
    };
    initApp();

    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`app-container theme-${theme}`}>
      <BubbleCanvas onPop={handlePop} />

      <div className="ui-overlay">
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="glass-panel" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind size={20} />
            <span style={{ fontWeight: 600, letterSpacing: '1px' }}>ZEN POP</span>
          </div>

          <div className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '0.5rem' }}>
            <button
              className={`zen-button ${theme === 'sunny' ? 'active' : ''}`}
              onClick={() => setTheme('sunny')}
              title="Sunny"
            >
              <Sun size={18} />
            </button>
            <button
              className={`zen-button ${theme === 'rainy' ? 'active' : ''}`}
              onClick={() => setTheme('rainy')}
              title="Rainy"
            >
              <CloudRain size={18} />
            </button>
            <button
              className={`zen-button ${theme === 'night' ? 'active' : ''}`}
              onClick={() => setTheme('night')}
              title="Night"
            >
              <Moon size={18} />
            </button>
          </div>
        </header>

        {/* AI Healing Quote Popup */}
        {aiQuote && (
          <div className={`quote-popup ${isQuoteFading ? 'fade-out' : ''}`}>
            <div className="glass-panel" style={{
              padding: '1.5rem 2.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 215, 0, 0.5)',
              background: 'rgba(255, 255, 255, 0.4)'
            }}>
              <p style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 500,
                color: '#946000',
                fontFamily: 'Noto Sans KR'
              }}>
                {aiQuote}
              </p>
            </div>
          </div>
        )}

        {/* Center Intro Message */}
        {showIntro && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <div className="glass-panel organic-shape" style={{ padding: '2rem 4rem', textAlign: 'center' }}>
              <Sparkles size={32} style={{ marginBottom: '1rem', color: '#ffcc00' }} />
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300 }}>편안함에 집중하세요.</h1>
              <p style={{ opacity: 0.7 }}>Pop the bubbles to learn Korean.</p>
            </div>
          </div>
        )}

        {/* Bottom Status */}
        <footer style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '0.8rem 2rem', fontSize: '0.9rem', opacity: 0.8 }}>
            실시간 손가락 인식 대기 중...
          </div>
        </footer>
      </div>

      <style>{`
        .app-container {
          width: 100vw;
          height: 100vh;
          transition: background 1s ease-in-out;
        }
        .theme-sunny { background: var(--theme-sunny); }
        .theme-rainy { background: var(--theme-rainy); }
        .theme-night { background: var(--theme-night); }
        
        .zen-button.active {
          background: rgba(255, 255, 255, 0.6);
          border-color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

export default App;
