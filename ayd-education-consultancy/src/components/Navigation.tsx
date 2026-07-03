import React, { useState } from 'react';
import { Menu, X, LogOut, User, LayoutDashboard, Globe } from 'lucide-react';
import { UserProfile } from '../types';

interface NavigationProps {
  userProfile: UserProfile | null;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAuthModal: (role: 'student' | 'agent') => void;
}

export default function Navigation({
  userProfile,
  onLogout,
  activeView,
  setActiveView,
  onOpenAuthModal,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <span className="font-serif font-bold text-slate-900 text-xl">A</span>
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-white tracking-wider">AYD</span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-sans font-medium">Education</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('landing')}
              className={`text-sm font-medium transition cursor-pointer ${
                activeView === 'landing' ? 'text-amber-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </button>
            <a href="#about" className="text-sm font-medium text-gray-300 hover:text-white transition">About</a>
            <a href="#services" className="text-sm font-medium text-gray-300 hover:text-white transition">Services</a>
            <a href="#scholarships" className="text-sm font-medium text-gray-300 hover:text-white transition">Scholarships</a>
            <a href="#visa" className="text-sm font-medium text-gray-300 hover:text-white transition">Visa</a>
            <a href="#study-plans" className="text-sm font-medium text-gray-300 hover:text-white transition">Study Plans</a>
            <a href="#contact" className="text-sm font-medium text-gray-300 hover:text-white transition">Contact</a>
          </div>

          {/* Auth Controls */}
          <div className="hidden lg:flex items-center gap-4">
            {userProfile ? (
              <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white max-w-[120px] truncate">
                    {userProfile.displayName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                    {userProfile.role}
                  </span>
                </div>
                
                <button
                  onClick={() => handleNavClick(userProfile.role === 'student' ? 'student-portal' : 'agent-portal')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Portal
                </button>

                <div className="h-4 w-[1px] bg-slate-800"></div>

                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-red-400 transition cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuthModal('agent')}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer border border-slate-800 hover:border-slate-700 bg-slate-900/40"
                >
                  Agent Portal
                </button>
                <button
                  onClick={() => onOpenAuthModal('student')}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-900 hover:opacity-90 shadow-lg shadow-amber-500/10 transition cursor-pointer"
                >
                  Student Login
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white hover:text-amber-400 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-6 space-y-4">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleNavClick('landing')}
              className="text-left text-sm font-medium text-gray-300 hover:text-white py-2"
            >
              Home
            </button>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white py-2">About</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white py-2">Services</a>
            <a href="#scholarships" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white py-2">Scholarships</a>
            <a href="#visa" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white py-2">Visa</a>
            <a href="#study-plans" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white py-2">Study Plans</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-300 hover:text-white py-2">Contact</a>
          </div>

          <div className="border-t border-slate-800 pt-4">
            {userProfile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 py-1">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">{userProfile.displayName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-sans">
                    {userProfile.role}
                  </span>
                </div>
                <button
                  onClick={() => handleNavClick(userProfile.role === 'student' ? 'student-portal' : 'agent-portal')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onOpenAuthModal('agent');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-center text-xs font-semibold text-gray-300 bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                >
                  Agent Portal
                </button>
                <button
                  onClick={() => {
                    onOpenAuthModal('student');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-900 transition cursor-pointer"
                >
                  Student Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
