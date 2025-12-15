import { useState } from 'react';
import { QueueProvider } from './context/QueueContext';
import MenuSelection from './components/MenuSelection';
import QueueDisplay from './components/QueueDisplay';
import OrderHistory from './components/OrderHistory';
import DisplayMonitor from './components/DisplayMonitor';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'queue', 'history', or 'display'
  const [latestQueueNumber, setLatestQueueNumber] = useState(null);

  const handleOrderSubmitted = (queueNumber) => {
    setLatestQueueNumber(queueNumber);
    setCurrentView('queue');

    // Clear the notification after 5 seconds
    setTimeout(() => {
      setLatestQueueNumber(null);
    }, 5000);
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setLatestQueueNumber(null);
  };

  return (
    <QueueProvider>
      <div className="app">
        {/* Navigation Tabs */}
        <nav className="app-nav">
          <div className="container">
            <div className="nav-tabs">
              <button
                className={`nav-tab ${currentView === 'menu' ? 'active' : ''}`}
                onClick={() => setCurrentView('menu')}
              >
                🍽️ Menu
              </button>
              <button
                className={`nav-tab ${currentView === 'queue' ? 'active' : ''}`}
                onClick={() => setCurrentView('queue')}
              >
                📋 Antrian
              </button>
              <button
                className={`nav-tab ${currentView === 'display' ? 'active' : ''}`}
                onClick={() => setCurrentView('display')}
              >
                📺 Display Monitor
              </button>
              <button
                className={`nav-tab ${currentView === 'history' ? 'active' : ''}`}
                onClick={() => setCurrentView('history')}
              >
                📜 Riwayat
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="app-main">
          {currentView === 'menu' && (
            <MenuSelection onOrderSubmitted={handleOrderSubmitted} />
          )}
          {currentView === 'queue' && (
            <QueueDisplay
              onBackToMenu={handleBackToMenu}
              latestQueueNumber={latestQueueNumber}
            />
          )}
          {currentView === 'display' && (
            <DisplayMonitor />
          )}
          {currentView === 'history' && (
            <OrderHistory />
          )}
        </main>
      </div>
    </QueueProvider>
  );
}

export default App;

