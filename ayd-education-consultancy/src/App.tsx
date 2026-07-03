import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import MainSite from './components/MainSite';
import StudentPortal from './components/StudentPortal';
import AgentPortal from './components/AgentPortal';
import ChatbotWidget from './components/ChatbotWidget';
import AuthModal from './components/AuthModal';
import { UserProfile } from './types';
import { auth, logOut, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [activeView, setActiveView] = useState<string>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'student' | 'agent'>('student');
  const [initializing, setInitializing] = useState(true);

  // Monitor Auth state changes to keep profile updated from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            // fallback profile in-case document isn't fully propagated yet
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Google User',
              role: 'student',
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      setUserProfile(null);
      setActiveView('landing');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    // Auto navigate to their dashboard portal
    setActiveView(profile.role === 'student' ? 'student-portal' : 'agent-portal');
  };

  const handleOpenAuthModal = (role: 'student' | 'agent') => {
    setAuthRole(role);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navigation Header */}
      <Navigation
        userProfile={userProfile}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Core View Router */}
      <main className="flex-grow">
        {activeView === 'landing' && (
          <MainSite onStartJourney={() => handleOpenAuthModal('student')} />
        )}

        {activeView === 'student-portal' && userProfile && (
          <StudentPortal userProfile={userProfile} />
        )}

        {activeView === 'agent-portal' && userProfile && (
          <AgentPortal userProfile={userProfile} />
        )}
      </main>

      {/* Globally Injected Conversational Chatbot Widget */}
      <ChatbotWidget />

      {/* Authentication Modal Popup */}
      {isAuthModalOpen && (
        <AuthModal
          role={authRole}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

    </div>
  );
}

