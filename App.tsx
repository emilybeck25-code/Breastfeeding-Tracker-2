import React, { useState } from 'react';
import { Page } from './types/index';
import DailySummary from './pages/DailySummary';
import MonthlySummary from './pages/MonthlySummary';
import NotificationsPage from './pages/NotificationsPage';
import TrackerPage from './pages/TrackerPage';
import NavBar from './components/NavBar';
import { useFeedingHistory } from './hooks/useFeedingHistory';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Tracker);
  const { history, addFeed, clearHistory, lastFeedTime, chronologicalHistory } = useFeedingHistory();

  const renderPage = () => {
    switch(currentPage) {
        case Page.Tracker:
            return <TrackerPage 
                        chronologicalHistory={chronologicalHistory} 
                        addFeed={addFeed} 
                        clearHistory={clearHistory} 
                    />;
        case Page.DailySummary:
            return <DailySummary history={history} />;
        case Page.MonthlySummary:
            return <MonthlySummary history={history} />;
        case Page.Notifications:
            return <NotificationsPage lastFeedTime={lastFeedTime} />;
        default:
            return null;
    }
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col pt-6 pb-20 font-sans">
      <header className="text-center mb-6 px-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-rose-400">
          Baby Feed Tracker
        </h1>
      </header>

      <main className="flex-grow flex flex-col overflow-hidden">
        {renderPage()}
      </main>
      
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;