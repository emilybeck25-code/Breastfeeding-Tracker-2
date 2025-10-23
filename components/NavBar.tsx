import React from 'react';
// FIX: Corrected import path for types to resolve module loading error.
import { Page } from '../types/index';

interface NavBarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavButton: React.FC<{
    page: Page;
    label: string;
    // FIX: Replaced JSX.Element with React.ReactNode to resolve the 'Cannot find namespace JSX' error.
    icon: React.ReactNode;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}> = ({ page, label, icon, currentPage, setCurrentPage }) => {
    const isActive = currentPage === page;
    const activeClass = 'text-violet-500';
    const inactiveClass = 'text-slate-500 hover:text-violet-400';

    return (
        <button 
            onClick={() => setCurrentPage(page)}
            className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}
            aria-current={isActive ? 'page' : undefined}
        >
            <div className="w-7 h-7">{icon}</div>
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
};


const NavBar: React.FC<NavBarProps> = ({ currentPage, setCurrentPage }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex items-center justify-around z-50">
            <NavButton
                page={Page.Tracker}
                label="Tracker"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <NavButton
                page={Page.DailySummary}
                label="Daily"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Z" /></svg>}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <NavButton
                page={Page.MonthlySummary}
                label="Monthly"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" /></svg>}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <NavButton
                page={Page.Notifications}
                label="Notify"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </nav>
    );
};

export default NavBar;