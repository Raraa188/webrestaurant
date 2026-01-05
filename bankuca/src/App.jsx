import { useState } from 'react';
import { BankQueueProvider } from './context/BankQueueContext';
import TicketKiosk from './components/TicketKiosk';
import CustomerMonitor from './components/CustomerMonitor';
import TellerPanel from './components/TellerPanel';
import Simulation from './components/Simulation';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('kiosk');

  return (
    <BankQueueProvider>
      <div className="app">
        <nav className="app-nav">
          <button
            className={currentView === 'kiosk' ? 'active' : ''}
            onClick={() => setCurrentView('kiosk')}
          >
            Ambil Nomor
          </button>
          <button
            className={currentView === 'monitor' ? 'active' : ''}
            onClick={() => setCurrentView('monitor')}
          >
            Monitor Nasabah
          </button>
          <button
            className={currentView === 'teller' ? 'active' : ''}
            onClick={() => setCurrentView('teller')}
          >
            Panel Teller
          </button>
          <button
            className={currentView === 'simulation' ? 'active' : ''}
            onClick={() => setCurrentView('simulation')}
          >
            Simulasi
          </button>
        </nav>

        <main className="app-main">
          {currentView === 'kiosk' && <TicketKiosk />}
          {currentView === 'monitor' && <CustomerMonitor />}
          {currentView === 'teller' && <TellerPanel />}
          {currentView === 'simulation' && <Simulation />}
        </main>
      </div>
    </BankQueueProvider>
  );
}

export default App;
