import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Calendar, Users, Video, Plus, CheckCircle, Clock, Loader2, Sparkles, AlertCircle, RefreshCw, LogIn, ExternalLink,
  Square, CheckSquare, FileCheck, ClipboardList, Settings, HelpCircle, ChevronRight, Check,
  Search, Filter, MapPin, Building, GraduationCap, BookOpen, Bookmark, Award, ShieldCheck
} from 'lucide-react';
import { UserProfile, DriveFile, GoogleContact, CalendarEvent, StudentChecklist, DocumentRequirement, GoogleFormConfig, StudentApplicationStatus, ApplicationStage } from '../types';
import { getCachedAccessToken, auth, getStudentChecklist, saveStudentChecklist, getGoogleFormConfig, getStudentApplicationStatus, saveStudentApplicationStatus } from '../firebase';
import { fetchDriveFiles, fetchGoogleContacts, fetchCalendarEvents, createGoogleMeetEvent } from '../googleApi';

export interface UniversityMatch {
  id: string;
  name: string;
  country: string;
  city: string;
  globalRanking: number;
  popularPrograms: string[];
  tuitionFees: string;
  tuitionValue: number; // numeric USD/yr equivalent for sorting/filtering
  admissionGPA: number; // GPA out of 4.0 recommended
  admissionIELTS: number; // IELTS recommended
  scholarships: string;
  logoColor: string;
}

export const UNIVERSITIES_DB: UniversityMatch[] = [
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology (MIT)',
    country: 'USA',
    city: 'Cambridge, MA',
    globalRanking: 1,
    popularPrograms: ['Computer Science', 'Data Science', 'Mechanical Engineering', 'Art & Design'],
    tuitionFees: '$58,000 / year',
    tuitionValue: 58000,
    admissionGPA: 3.8,
    admissionIELTS: 7.0,
    scholarships: 'Full-need/Full-ride scholarships available for top global talent.',
    logoColor: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    country: 'USA',
    city: 'Stanford, CA',
    globalRanking: 5,
    popularPrograms: ['Computer Science', 'Business Administration', 'Data Science', 'Medicine'],
    tuitionFees: '$60,000 / year',
    tuitionValue: 60000,
    admissionGPA: 3.8,
    admissionIELTS: 7.5,
    scholarships: 'Need-blind admissions with 100% demonstrated financial need met.',
    logoColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  {
    id: 'oxford',
    name: 'University of Oxford',
    country: 'UK',
    city: 'Oxford',
    globalRanking: 3,
    popularPrograms: ['Computer Science', 'Medicine', 'Environmental Science', 'Art & Design'],
    tuitionFees: '£35,000 / year',
    tuitionValue: 44000,
    admissionGPA: 3.7,
    admissionIELTS: 7.5,
    scholarships: 'Rhodes, Clarendon, and departmental fully funded scholarships.',
    logoColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    id: 'cambridge',
    name: 'University of Cambridge',
    country: 'UK',
    city: 'Cambridge',
    globalRanking: 2,
    popularPrograms: ['Computer Science', 'Mechanical Engineering', 'Data Science', 'Medicine'],
    tuitionFees: '£38,000 / year',
    tuitionValue: 48000,
    admissionGPA: 3.8,
    admissionIELTS: 7.5,
    scholarships: 'Gates Cambridge & Cambridge Trust full-ride awards.',
    logoColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  },
  {
    id: 'toronto',
    name: 'University of Toronto',
    country: 'Canada',
    city: 'Toronto, ON',
    globalRanking: 21,
    popularPrograms: ['Computer Science', 'Business Administration', 'Data Science', 'Medicine'],
    tuitionFees: 'CAD $55,000 / year',
    tuitionValue: 40000,
    admissionGPA: 3.3,
    admissionIELTS: 6.5,
    scholarships: 'Lester B. Pearson International Scholarship (full coverage of tuition/living).',
    logoColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  },
  {
    id: 'ubc',
    name: 'University of British Columbia',
    country: 'Canada',
    city: 'Vancouver, BC',
    globalRanking: 34,
    popularPrograms: ['Computer Science', 'Environmental Science', 'Art & Design'],
    tuitionFees: 'CAD $42,000 / year',
    tuitionValue: 31000,
    admissionGPA: 3.2,
    admissionIELTS: 6.5,
    scholarships: 'International Major Entrance Scholarship up to $20,000 per year.',
    logoColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    id: 'tum',
    name: 'Technical University of Munich (TUM)',
    country: 'Germany',
    city: 'Munich',
    globalRanking: 37,
    popularPrograms: ['Computer Science', 'Mechanical Engineering', 'Data Science'],
    tuitionFees: '€150 / semester',
    tuitionValue: 350,
    admissionGPA: 3.0,
    admissionIELTS: 6.5,
    scholarships: 'Tuition-free state education; DAAD monthly stipends for living expenses.',
    logoColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  },
  {
    id: 'heidelberg',
    name: 'Heidelberg University',
    country: 'Germany',
    city: 'Heidelberg',
    globalRanking: 79,
    popularPrograms: ['Medicine', 'Environmental Science', 'Art & Design'],
    tuitionFees: '€1,500 / semester',
    tuitionValue: 3200,
    admissionGPA: 3.2,
    admissionIELTS: 6.5,
    scholarships: 'State-subsidized education with competitive academic fellowships.',
    logoColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
  },
  {
    id: 'melbourne',
    name: 'University of Melbourne',
    country: 'Australia',
    city: 'Melbourne, VIC',
    globalRanking: 14,
    popularPrograms: ['Business Administration', 'Environmental Science', 'Medicine', 'Data Science'],
    tuitionFees: 'AUD $45,000 / year',
    tuitionValue: 29000,
    admissionGPA: 3.2,
    admissionIELTS: 6.5,
    scholarships: 'Melbourne International Undergraduate Merit Scholarships.',
    logoColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  {
    id: 'sydney',
    name: 'University of Sydney',
    country: 'Australia',
    city: 'Sydney, NSW',
    globalRanking: 19,
    popularPrograms: ['Computer Science', 'Business Administration', 'Art & Design', 'Mechanical Engineering'],
    tuitionFees: 'AUD $48,000 / year',
    tuitionValue: 31000,
    admissionGPA: 3.3,
    admissionIELTS: 6.5,
    scholarships: 'Vice-Chancellor International Scholarship up to AUD $40,000.',
    logoColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
  },
  {
    id: 'nus',
    name: 'National University of Singapore (NUS)',
    country: 'Singapore',
    city: 'Singapore',
    globalRanking: 8,
    popularPrograms: ['Computer Science', 'Data Science', 'Mechanical Engineering', 'Business Administration'],
    tuitionFees: 'SGD $35,000 / year',
    tuitionValue: 26000,
    admissionGPA: 3.6,
    admissionIELTS: 7.0,
    scholarships: 'ASEAN Undergraduate Scholarship & NUS Science & Technology awards.',
    logoColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
  },
  {
    id: 'ntu',
    name: 'Nanyang Technological University (NTU)',
    country: 'Singapore',
    city: 'Singapore',
    globalRanking: 26,
    popularPrograms: ['Computer Science', 'Mechanical Engineering', 'Art & Design', 'Data Science'],
    tuitionFees: 'SGD $33,000 / year',
    tuitionValue: 24500,
    admissionGPA: 3.5,
    admissionIELTS: 6.5,
    scholarships: 'Nanyang Scholarship covering full tuition, living allowances & travel grants.',
    logoColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  }
];

// Define mapping of application stage ID to document requirement IDs
export const STAGE_REQUIRED_DOCUMENTS: { [stageId: string]: string[] } = {
  consultation: ['transcripts'],
  shortlisting: ['resume'],
  documents: ['sop', 'lors', 'languageTest'],
  submission: [],
  offer: [],
  visa: ['passport'],
  departure: []
};

// Check if a document is uploaded to Google Drive based on filename keyword matching
export const isDocumentInDrive = (reqId: string, files: DriveFile[]): boolean => {
  if (!files || files.length === 0) return false;
  const lowercaseFiles = files.map(f => (f.name || '').toLowerCase());
  
  switch (reqId) {
    case 'transcripts':
      return lowercaseFiles.some(name => 
        name.includes('transcript') || name.includes('grade') || name.includes('certificate') || name.includes('result') || name.includes('academic')
      );
    case 'lors':
      return lowercaseFiles.some(name => 
        name.includes('recommendation') || name.includes('lor') || name.includes('reference') || name.includes('letter')
      );
    case 'sop':
      return lowercaseFiles.some(name => 
        name.includes('sop') || name.includes('purpose') || name.includes('statement of purpose') || name.includes('essay') || name.includes('personal statement')
      );
    case 'passport':
      return lowercaseFiles.some(name => 
        name.includes('passport') || name.includes('id') || name.includes('identity') || name.includes('national_id')
      );
    case 'languageTest':
      return lowercaseFiles.some(name => 
        name.includes('ielts') || name.includes('toefl') || name.includes('duolingo') || name.includes('language') || name.includes('scorecard') || name.includes('proficiency')
      );
    case 'resume':
      return lowercaseFiles.some(name => 
        name.includes('resume') || name.includes('cv') || name.includes('curriculum') || name.includes('vitae')
      );
    default:
      return false;
  }
};

interface StudentPortalProps {
  userProfile: UserProfile;
}

export default function StudentPortal({ userProfile }: StudentPortalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'calendar' | 'contacts' | 'form' | 'matching'>('status');
  
  // University matching states
  const [searchProgram, setSearchProgram] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedProgramCategory, setSelectedProgramCategory] = useState('all');
  const [maxBudget, setMaxBudget] = useState(60000);
  const [studentGPA, setStudentGPA] = useState('3.5');
  const [studentIELTS, setStudentIELTS] = useState('6.5');
  const [shortlistedUniIds, setShortlistedUniIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ayd_shortlisted_unis');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reference for scrolling to the scheduling section
  const bookingFormRef = useRef<HTMLDivElement>(null);

  // Sync shortlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ayd_shortlisted_unis', JSON.stringify(shortlistedUniIds));
    } catch (e) {
      console.error('Error saving shortlisted universities to localStorage:', e);
    }
  }, [shortlistedUniIds]);

  // Handle book consultation button click
  const handleBookConsultation = (uniName: string) => {
    setMeetTitle(`Admissions Consultation: ${uniName}`);
    setMeetDescription(`I am looking for guidance on applying to ${uniName}. I would like to discuss my program preferences, GPA of ${studentGPA || 'N/A'}, IELTS of ${studentIELTS || 'N/A'}, scholarship options, and admission timelines.`);
    
    // Smooth scroll to booking form
    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleShortlist = (uniId: string) => {
    setShortlistedUniIds(prev => 
      prev.includes(uniId) ? prev.filter(id => id !== uniId) : [...prev, uniId]
    );
  };
  
  // Workspace data states
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  // Meet creation form states
  const [meetTitle, setMeetTitle] = useState('AYD Academic Consultation');
  const [meetDescription, setMeetDescription] = useState('1-on-1 counseling session about visa guidelines, scholarship matching, and SOP formatting.');
  const [meetDate, setMeetDate] = useState('2026-07-15');
  const [meetTime, setMeetTime] = useState('14:00');
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [meetCreatedEvent, setMeetCreatedEvent] = useState<CalendarEvent | null>(null);

  // Interactive Document Checklist states
  const [checklist, setChecklist] = useState<StudentChecklist | null>(null);
  const [isChecklistLoading, setIsChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState<string | null>(null);
  const [isChecklistSyncing, setIsChecklistSyncing] = useState(false);

  // Google Form integration states
  const [googleForm, setGoogleForm] = useState<GoogleFormConfig | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  // Application Status state
  const [appStatus, setAppStatus] = useState<StudentApplicationStatus | null>(null);
  const [isAppStatusLoading, setIsAppStatusLoading] = useState(false);
  const [appStatusError, setAppStatusError] = useState<string | null>(null);
  const [selectedPreviewStage, setSelectedPreviewStage] = useState<ApplicationStage | null>(null);

  const accessToken = getCachedAccessToken();

  // Load checklist on mount or profile change
  useEffect(() => {
    async function fetchChecklist() {
      setIsChecklistLoading(true);
      setChecklistError(null);
      try {
        // For password-based mock login, check local storage for persistence first
        if (userProfile.uid.startsWith('pwd-')) {
          const cached = localStorage.getItem(`checklist_${userProfile.uid}`);
          if (cached) {
            setChecklist(JSON.parse(cached));
            setIsChecklistLoading(false);
            return;
          }
        }
        const data = await getStudentChecklist(userProfile.uid);
        setChecklist(data);
      } catch (err: any) {
        console.error('Failed to load document checklist:', err);
        setChecklistError('Could not sync document checklist with Firebase. Reverting to local fallback.');
      } finally {
        setIsChecklistLoading(false);
      }
    }
    fetchChecklist();
  }, [userProfile.uid]);

  // Load mock drive files for password sessions to make the UI interactive and testable
  useEffect(() => {
    if (userProfile.uid.startsWith('pwd-') && driveFiles.length === 0) {
      const mockFiles: DriveFile[] = [
        {
          id: 'mock-file-1',
          name: 'Academic_Transcripts_Official.pdf',
          mimeType: 'application/pdf',
          webViewLink: 'https://drive.google.com'
        },
        {
          id: 'mock-file-2',
          name: 'SOP_Draft_Review_v2.docx',
          mimeType: 'application/vnd.google-apps.document',
          webViewLink: 'https://drive.google.com'
        },
        {
          id: 'mock-file-3',
          name: 'Academic_Reference_Letter_LOR.pdf',
          mimeType: 'application/pdf',
          webViewLink: 'https://drive.google.com'
        },
        {
          id: 'mock-file-4',
          name: 'IELTS_Band_8_Scorecard.pdf',
          mimeType: 'application/pdf',
          webViewLink: 'https://drive.google.com'
        },
        {
          id: 'mock-file-5',
          name: 'Personal_Resume_CV_2026.pdf',
          mimeType: 'application/pdf',
          webViewLink: 'https://drive.google.com'
        }
      ];
      setDriveFiles(mockFiles);
    }
  }, [userProfile.uid, driveFiles.length]);

  const handleToggleRequirement = async (reqId: string) => {
    if (!checklist) return;

    // Optimistically update the UI
    const updatedRequirements = {
      ...checklist.requirements,
      [reqId]: {
        ...checklist.requirements[reqId],
        completed: !checklist.requirements[reqId].completed,
        updatedAt: new Date().toISOString()
      }
    };

    const updatedChecklist: StudentChecklist = {
      ...checklist,
      requirements: updatedRequirements,
      lastSyncedAt: new Date().toISOString()
    };

    setChecklist(updatedChecklist);
    setIsChecklistSyncing(true);
    setChecklistError(null);

    try {
      // For real authenticated Google login, sync with Firebase Firestore
      if (auth.currentUser && !userProfile.uid.startsWith('pwd-')) {
        await saveStudentChecklist(userProfile.uid, updatedChecklist);
      } else {
        // For password-based mock login, save locally
        localStorage.setItem(`checklist_${userProfile.uid}`, JSON.stringify(updatedChecklist));
      }
    } catch (err: any) {
      console.error('Failed to save document checklist:', err);
      setChecklistError('Firestore write error. Changes saved locally.');
    } finally {
      setIsChecklistSyncing(false);
    }
  };

  // Load Google Form config on active tab change or mount
  useEffect(() => {
    async function fetchForm() {
      setIsLoadingForm(true);
      try {
        const config = await getGoogleFormConfig();
        setGoogleForm(config);
      } catch (err) {
        console.error('Failed to load Google Form config:', err);
      } finally {
        setIsLoadingForm(false);
      }
    }
    fetchForm();
  }, [activeTab]);

  // Load application status from Firebase (with localStorage fallback for simulated password sessions)
  useEffect(() => {
    async function fetchAppStatus() {
      setIsAppStatusLoading(true);
      setAppStatusError(null);
      try {
        if (userProfile.uid.startsWith('pwd-')) {
          const cached = localStorage.getItem(`appstatus_${userProfile.uid}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            setAppStatus(parsed);
            const current = parsed.stages.find((s: any) => s.id === parsed.currentStageId) || parsed.stages[2];
            setSelectedPreviewStage(current);
            setIsAppStatusLoading(false);
            return;
          }
        }
        
        const data = await getStudentApplicationStatus(userProfile.uid);
        setAppStatus(data);
        const current = data.stages.find(s => s.id === data.currentStageId) || data.stages[2];
        setSelectedPreviewStage(current);
        
        if (userProfile.uid.startsWith('pwd-')) {
          localStorage.setItem(`appstatus_${userProfile.uid}`, JSON.stringify(data));
        }
      } catch (err: any) {
        console.error('Failed to load application status:', err);
        setAppStatusError('Failed to synchronize university application status with Firebase.');
      } finally {
        setIsAppStatusLoading(false);
      }
    }
    fetchAppStatus();
  }, [userProfile.uid]);

  useEffect(() => {
    if (accessToken) {
      loadWorkspaceData();
    }
  }, [accessToken, activeTab]);

  const loadWorkspaceData = async () => {
    if (!accessToken) return;
    setIsLoadingWorkspace(true);
    setWorkspaceError(null);
    try {
      if (activeTab === 'drive') {
        const files = await fetchDriveFiles(accessToken);
        setDriveFiles(files);
      } else if (activeTab === 'contacts') {
        const list = await fetchGoogleContacts(accessToken);
        setContacts(list);
      } else if (activeTab === 'calendar' || activeTab === 'status') {
        const events = await fetchCalendarEvents(accessToken);
        setCalendarEvents(events);
        
        // Also fetch drive files on status tab to update document upload indicators
        if (activeTab === 'status') {
          try {
            const files = await fetchDriveFiles(accessToken);
            setDriveFiles(files);
          } catch (driveErr) {
            console.warn('Failed to fetch drive files for status view:', driveErr);
          }
        }
      }
    } catch (err: any) {
      console.error('Workspace load error:', err);
      setWorkspaceError(err.message || 'Could not load Google Workspace data.');
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  const handleCreateMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setWorkspaceError('Please sign in again to re-authorize Google Workspace.');
      return;
    }

    setIsCreatingMeet(true);
    setMeetCreatedEvent(null);
    try {
      const startISO = new Date(`${meetDate}T${meetTime}:00Z`).toISOString();
      const endISO = new Date(new Date(startISO).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour duration
      
      const created = await createGoogleMeetEvent(
        accessToken,
        meetTitle,
        meetDescription,
        startISO,
        endISO
      );
      
      setMeetCreatedEvent(created);
      // Refresh calendar events list
      const updatedEvents = await fetchCalendarEvents(accessToken);
      setCalendarEvents(updatedEvents);
      
      setMeetTitle('AYD Academic Consultation');
      setMeetDescription('1-on-1 counseling session about visa guidelines, scholarship matching, and SOP formatting.');
    } catch (err: any) {
      console.error('Meet creation failed:', err);
      setWorkspaceError(err.message || 'Could not schedule Google Meet session.');
    } finally {
      setIsCreatingMeet(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      {/* Welcome Banner */}
      <div className="mb-10 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl"></div>
        <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          AYD Premium Student Portal
        </p>
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-2">
          Welcome back, {userProfile.displayName}
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Monitor your study abroad applications, verify documents, and schedule live consultations via Google Meet.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('status')}
          className={`pb-3 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition ${
            activeTab === 'status' 
              ? 'border-amber-400 text-amber-400' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          My Status & Checklist
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`pb-3 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'matching' 
              ? 'border-amber-400 text-amber-400' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          University Matcher
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'calendar' 
              ? 'border-amber-400 text-amber-400' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Google Calendar & Meet
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'contacts' 
              ? 'border-amber-400 text-amber-400' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          My Google Contacts
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`pb-3 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'form' 
              ? 'border-amber-400 text-amber-400' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Admissions Google Form
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column (Tab content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Workspace Authorization Alert */}
          {!accessToken && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-start gap-3.5 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">Google Workspace Integrations Dormant</p>
                <p className="leading-relaxed">
                  We require authorization to display your real Google Drive documents, Calendar counseling, and Google Contacts. Log out and sign up/sign in with your Google Account to activate integrations.
                </p>
              </div>
            </div>
          )}

          {/* Workspace Loading Indicator */}
          {isLoadingWorkspace && (
            <div className="flex flex-col items-center justify-center p-16 bg-slate-900/50 rounded-3xl border border-slate-800 gap-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Synchronizing Google Workspace data...</p>
            </div>
          )}

          {/* Workspace Error Indicator */}
          {workspaceError && !isLoadingWorkspace && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3.5 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold mb-1">Google API Error</p>
                <p className="leading-relaxed">{workspaceError}</p>
              </div>
              <button onClick={loadWorkspaceData} className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 transition">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

              {/* 1. Status Tab */}
          {activeTab === 'status' && !isLoadingWorkspace && (
            <div className="space-y-6">
              
              {/* University Admissions Roadmap Stepper */}
              {isAppStatusLoading ? (
                <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <p className="text-xs text-gray-400 font-medium">Loading admissions progress tracker...</p>
                </div>
              ) : appStatusError ? (
                <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{appStatusError}</p>
                </div>
              ) : appStatus ? (() => {
                const stages = appStatus.stages;
                const activeStage = stages.find(s => s.id === appStatus.currentStageId) || stages[0];
                const previewStage = selectedPreviewStage || activeStage;
                
                // Calculate overall completion percentage based on stage indices
                const activeIndex = stages.findIndex(s => s.id === appStatus.currentStageId);
                const progressPercentage = stages.length > 0 ? Math.round(((activeIndex + 0.5) / stages.length) * 100) : 0;
                
                return (
                  <div className="space-y-6">
                    {/* Stepper Header Summary Card */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-wider uppercase border border-amber-500/20 animate-pulse">
                            Live Admissions Stage
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Last Updated: {new Date(appStatus.lastUpdatedAt).toLocaleDateString([], { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
                          {activeStage.label}
                        </h3>
                        <p className="text-xs text-gray-400 max-w-xl">
                          {activeStage.description}
                        </p>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-end gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-400">Overall Track Progress</span>
                          <div className="text-lg font-bold text-amber-400">{progressPercentage}% Complete</div>
                        </div>
                        <div className="w-full md:w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-700"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Multi-Stage Stepper Track */}
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-lg font-bold text-white">Application Journey Roadmap</h4>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Click any step to preview guidelines
                        </span>
                      </div>

                      {/* Desktop Horizontal Stepper */}
                      <div className="hidden md:block relative pt-4 pb-8">
                        {/* Connecting Line Track */}
                        <div className="absolute top-11 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
                        <div 
                          className="absolute top-11 left-8 h-1 bg-gradient-to-r from-green-500 to-amber-500 -translate-y-1/2 rounded-full transition-all duration-700" 
                          style={{ 
                            width: `${stages.length > 0 ? (activeIndex / (stages.length - 1)) * 90 : 0}%` 
                          }}
                        ></div>

                        {/* Interactive Nodes */}
                        <div className="relative flex justify-between items-center w-full">
                          {stages.map((stage, idx) => {
                            const isCompleted = idx < activeIndex;
                            const isActive = stage.id === appStatus.currentStageId;
                            const isSelected = previewStage.id === stage.id;
                            
                            const stageDocIds = STAGE_REQUIRED_DOCUMENTS[stage.id] || [];
                            const totalDocs = stageDocIds.length;
                            const uploadedDocs = stageDocIds.filter(id => isDocumentInDrive(id, driveFiles)).length;
                            
                            let nodeBg = 'bg-slate-950 border-slate-800 text-gray-500 hover:border-slate-700';
                            let iconColor = 'text-gray-500';
                            
                            if (isCompleted) {
                              nodeBg = 'bg-green-500 text-slate-950 border-green-500 hover:bg-green-400';
                              iconColor = 'text-slate-950';
                            } else if (isActive) {
                              nodeBg = 'bg-amber-500 text-slate-950 border-amber-500 ring-4 ring-amber-500/20 hover:bg-amber-400';
                              iconColor = 'text-slate-950';
                            } else if (isSelected) {
                              nodeBg = 'bg-slate-900 text-white border-amber-400/80 ring-2 ring-amber-400/10';
                              iconColor = 'text-amber-400';
                            }

                            return (
                              <button
                                key={stage.id}
                                onClick={() => setSelectedPreviewStage(stage)}
                                className="flex flex-col items-center group focus:outline-none relative cursor-pointer"
                                style={{ width: `${100 / stages.length}%` }}
                              >
                                {/* Stage Circle node */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-300 relative z-10 ${nodeBg}`}>
                                  {isCompleted ? (
                                    <Check className="w-6 h-6 stroke-[3]" />
                                  ) : isActive ? (
                                    <span className="relative flex h-6 w-6 items-center justify-center">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-40"></span>
                                      <Clock className="w-5 h-5 relative" />
                                    </span>
                                  ) : (
                                    <span>0{idx + 1}</span>
                                  )}
                                </div>

                                {/* Hover tooltip details / label */}
                                <span className={`text-[11px] font-bold mt-3 text-center transition group-hover:text-white max-w-[100px] line-clamp-2 leading-tight ${
                                  isSelected ? 'text-amber-400' : isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {stage.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mobile Vertical Stepper */}
                      <div className="block md:hidden space-y-3">
                        {stages.map((stage, idx) => {
                          const isCompleted = idx < activeIndex;
                          const isActive = stage.id === appStatus.currentStageId;
                          const isSelected = previewStage.id === stage.id;
                          
                          const stageDocIds = STAGE_REQUIRED_DOCUMENTS[stage.id] || [];
                          const totalDocs = stageDocIds.length;
                          const uploadedDocs = stageDocIds.filter(id => isDocumentInDrive(id, driveFiles)).length;
                          
                          let nodeBg = 'bg-slate-950 border-slate-800 text-gray-500';
                          
                          if (isCompleted) {
                            nodeBg = 'bg-green-500/10 text-green-400 border-green-500/20';
                          } else if (isActive) {
                            nodeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30 ring-2 ring-amber-400/10';
                          } else if (isSelected) {
                            nodeBg = 'bg-slate-900 text-amber-400 border-amber-400/60';
                          }

                          return (
                            <button
                              key={stage.id}
                              onClick={() => setSelectedPreviewStage(stage)}
                              className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition text-left cursor-pointer ${
                                isSelected ? 'bg-slate-900/60 border-amber-400' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border relative ${nodeBg}`}>
                                {isCompleted ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <span>0{idx + 1}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-xs text-white truncate">{stage.label}</p>
                                </div>
                                <p className="text-[10px] text-gray-500 truncate mt-0.5">{stage.description}</p>
                              </div>
                              <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-amber-400 rotate-90' : 'text-gray-600'}`} />
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Stage Detail Panel */}
                      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400/80 font-bold">
                              Stage Details ({stages.findIndex(s => s.id === previewStage.id) + 1} of {stages.length})
                            </span>
                            <h5 className="font-serif text-lg font-bold text-white mt-0.5">
                              {previewStage.label}
                            </h5>
                          </div>
                          
                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              stages.findIndex(s => s.id === previewStage.id) < activeIndex
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : previewStage.id === appStatus.currentStageId
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-slate-900 text-gray-500 border-slate-800'
                            }`}>
                              {stages.findIndex(s => s.id === previewStage.id) < activeIndex ? (
                                <>✓ Stage Completed</>
                              ) : previewStage.id === appStatus.currentStageId ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                  Active Stage
                                </>
                              ) : (
                                <>Future Pipeline Stage</>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Objective Description</h6>
                            <p className="text-xs text-gray-300 leading-relaxed bg-slate-900/30 p-3 rounded-xl border border-slate-800/30">
                              {previewStage.description}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              Latest Consultant Notes
                            </h6>
                            <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10 relative">
                              <p className="text-xs text-amber-100 italic leading-relaxed font-serif">
                                "{previewStage.notes || 'No feedback logged for this stage yet.'}"
                              </p>
                              <div className="mt-2.5 flex items-center justify-between text-[9px] text-gray-500">
                                <span>Assigned Counselor Specialist</span>
                                <span>Updated: {new Date(previewStage.updatedAt).toLocaleDateString([], { dateStyle: 'short' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>


                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="p-8 text-center text-gray-500 border border-dashed border-slate-800 rounded-2xl">
                  <Clock className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                  <p className="text-sm font-medium">Application Journey roadmap is offline.</p>
                </div>
              )}

              {/* Interactive Required Document Checklist */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6" id="student-doc-checklist">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-amber-400" />
                      Required Document Checklist
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Check off requirements as you compile them. Changes sync in real-time with Firebase.
                    </p>
                  </div>
                  
                  {/* Sync Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {isChecklistSyncing ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Syncing...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                        Synced via Firebase
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {checklist && (() => {
                  const reqs = Object.values(checklist.requirements) as DocumentRequirement[];
                  const completedCount = reqs.filter(r => r.completed).length;
                  const totalCount = reqs.length;
                  const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                  return (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-gray-400">Completion Progress</span>
                        <span className="text-amber-400">
                          {completedCount} of {totalCount} completed
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Error Banner */}
                {checklistError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2.5 items-start">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Sync Alert</p>
                      <p className="mt-0.5">{checklistError}</p>
                    </div>
                  </div>
                )}

                {/* List of items */}
                {isChecklistLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <p className="text-xs text-gray-500">Retrieving your checklist documents...</p>
                  </div>
                ) : checklist ? (
                  <div className="grid gap-3.5">
                    {(Object.values(checklist.requirements) as DocumentRequirement[]).map((req) => (
                      <div 
                        key={req.id} 
                        onClick={() => handleToggleRequirement(req.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-4 select-none ${
                          req.completed 
                            ? 'bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                        }`}
                        id={`checklist-item-${req.id}`}
                      >
                        {/* Checkbox Icon */}
                        <div className="mt-0.5 flex-shrink-0">
                          {req.completed ? (
                            <CheckSquare className="w-5 h-5 text-amber-400 animate-in zoom-in duration-150" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-600 hover:text-gray-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className={`text-sm font-semibold transition ${
                              req.completed ? 'text-amber-200 line-through decoration-amber-500/40' : 'text-white'
                            }`}>
                              {req.label}
                            </span>
                            
                            {/* Synced label */}
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">
                              {req.completed ? `Checked off: ${new Date(req.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'Not submitted'}
                            </span>
                          </div>
                          
                          <p className={`text-xs mt-1 leading-relaxed ${
                            req.completed ? 'text-gray-400/80' : 'text-gray-400'
                          }`}>
                            {req.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-dashed border-slate-800 rounded-xl">
                    <FileCheck className="w-10 h-10 text-slate-800 mx-auto mb-2" />
                    <p className="text-xs">No checklist requirements available.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 2. University Matcher Tab */}
          {activeTab === 'matching' && (
            <div className="space-y-6">
              
              {/* Filter Dashboard Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-400" />
                    Premium University Matcher
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Find and compare global programs. Input your credentials below to calculate personalized match potential.
                  </p>
                </div>

                {/* Search & Main Filter Controls */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-amber-400/80" /> Search Programs or Universities
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchProgram}
                        onChange={(e) => setSearchProgram(e.target.value)}
                        placeholder="e.g. Computer Science, Oxford, Canada..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                      />
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Destination Country</label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="all">🌍 All Countries</option>
                        <option value="USA">🇺🇸 United States</option>
                        <option value="UK">🇬🇧 United Kingdom</option>
                        <option value="Canada">🇨🇦 Canada</option>
                        <option value="Germany">🇩🇪 Germany</option>
                        <option value="Australia">🇦🇺 Australia</option>
                        <option value="Singapore">🇸🇬 Singapore</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Max Tuition Budget</label>
                      <select
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value={999999}>💵 Unlimited</option>
                        <option value={60000}>💵 Under $60,000 / yr</option>
                        <option value={45000}>💵 Under $45,000 / yr</option>
                        <option value={30000}>💵 Under $30,000 / yr</option>
                        <option value={10000}>💵 Under $10,000 / yr (Low Fees)</option>
                        <option value={1000}>💵 Tuition-Free (Germany)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Academic Profile Input (GPA & IELTS) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Enter Your Profile to Calculate Dynamic Match Potential
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Your GPA (4.0 Scale)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.0"
                          max="4.0"
                          value={studentGPA}
                          onChange={(e) => setStudentGPA(e.target.value)}
                          placeholder="e.g. 3.5"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[11px] text-gray-500 font-mono">/ 4.0</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Your IELTS Academic Score
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="4.0"
                          max="9.0"
                          value={studentIELTS}
                          onChange={(e) => setStudentIELTS(e.target.value)}
                          placeholder="e.g. 6.5"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[11px] text-gray-500 font-mono">/ 9.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Programs Quick Chips Filter */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-400">Popular Fields of Interest</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All Fields' },
                      { id: 'computer science', label: 'Computer Science' },
                      { id: 'data science', label: 'Data Science' },
                      { id: 'business administration', label: 'MBA / Business' },
                      { id: 'medicine', label: 'Medicine' },
                      { id: 'mechanical engineering', label: 'Engineering' },
                      { id: 'art & design', label: 'Art & Design' },
                      { id: 'environmental science', label: 'Environmental Science' }
                    ].map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedProgramCategory(category.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          selectedProgramCategory === category.id
                            ? 'bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-950 text-gray-400 hover:text-white border border-slate-850'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Results list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-300">
                      Matched Universities (
                      {UNIVERSITIES_DB.filter(uni => {
                        const matchesSearch = !searchProgram || 
                          uni.name.toLowerCase().includes(searchProgram.toLowerCase()) ||
                          uni.city.toLowerCase().includes(searchProgram.toLowerCase()) ||
                          uni.country.toLowerCase().includes(searchProgram.toLowerCase()) ||
                          uni.popularPrograms.some(prog => prog.toLowerCase().includes(searchProgram.toLowerCase()));
                        const matchesCountry = selectedCountry === 'all' || uni.country.toLowerCase() === selectedCountry.toLowerCase();
                        const matchesCategory = selectedProgramCategory === 'all' || 
                          uni.popularPrograms.some(prog => prog.toLowerCase() === selectedProgramCategory.toLowerCase());
                        const matchesBudget = uni.tuitionValue <= maxBudget;
                        return matchesSearch && matchesCountry && matchesCategory && matchesBudget;
                      }).length}
                      )
                    </h4>
                  </div>
                  
                  {/* Saved list toggle or count */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Shortlisted:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold font-mono">
                      {shortlistedUniIds.length} Saved
                    </span>
                  </div>
                </div>

                {/* Universities Cards Container */}
                <div className="grid gap-5">
                  {(() => {
                    const matched = UNIVERSITIES_DB.filter(uni => {
                      const matchesSearch = !searchProgram || 
                        uni.name.toLowerCase().includes(searchProgram.toLowerCase()) ||
                        uni.city.toLowerCase().includes(searchProgram.toLowerCase()) ||
                        uni.country.toLowerCase().includes(searchProgram.toLowerCase()) ||
                        uni.popularPrograms.some(prog => prog.toLowerCase().includes(searchProgram.toLowerCase()));
                      const matchesCountry = selectedCountry === 'all' || uni.country.toLowerCase() === selectedCountry.toLowerCase();
                      const matchesCategory = selectedProgramCategory === 'all' || 
                        uni.popularPrograms.some(prog => prog.toLowerCase() === selectedProgramCategory.toLowerCase());
                      const matchesBudget = uni.tuitionValue <= maxBudget;
                      return matchesSearch && matchesCountry && matchesCategory && matchesBudget;
                    });

                    if (matched.length === 0) {
                      return (
                        <div className="text-center py-16 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
                          <Building className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-gray-400">No universities match your strict filters.</p>
                          <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                            Try broadening your budget parameter or program categories. Free universities in Germany (TUM) are excellent options for tight budgets!
                          </p>
                          <button
                            onClick={() => {
                              setSearchProgram('');
                              setSelectedCountry('all');
                              setSelectedProgramCategory('all');
                              setMaxBudget(999999);
                            }}
                            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-amber-400 transition border border-slate-800"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      );
                    }

                    return matched.map((uni) => {
                      // Calculate Match Score if inputs are available
                      let matchLevel: 'high' | 'medium' | 'reach' | 'none' = 'none';
                      let matchText = '';
                      let matchColor = '';

                      if (studentGPA && studentIELTS) {
                        const gpaVal = Number(studentGPA);
                        const ieltsVal = Number(studentIELTS);

                        if (gpaVal >= uni.admissionGPA && ieltsVal >= uni.admissionIELTS) {
                          matchLevel = 'high';
                          matchText = '✓ High Match potential (academic goals aligned)';
                          matchColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                        } else if (gpaVal >= uni.admissionGPA - 0.4 && ieltsVal >= uni.admissionIELTS - 0.5) {
                          matchLevel = 'medium';
                          matchText = '⚠ Competitive Match (within parameters, recommend extra LOR support)';
                          matchColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                        } else {
                          matchLevel = 'reach';
                          matchText = '♦ Reach Target (recommended to elevate test scores/GPA before applying)';
                          matchColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                        }
                      }

                      const isSaved = shortlistedUniIds.includes(uni.id);

                      return (
                        <div key={uni.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl hover:border-slate-700/80 transition relative overflow-hidden">
                          {/* Country badge corner */}
                          <div className="absolute top-5 right-5 flex items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-gray-300">
                              QS Rank #{uni.globalRanking}
                            </span>
                            
                            {/* Shortlist button */}
                            <button
                              onClick={() => toggleShortlist(uni.id)}
                              className={`p-2 rounded-xl transition cursor-pointer border ${
                                isSaved 
                                  ? 'bg-amber-400 text-slate-950 border-amber-300' 
                                  : 'bg-slate-950 text-gray-500 hover:text-white border-slate-800'
                              }`}
                              title={isSaved ? "Remove from shortlisted universities" : "Shortlist this university"}
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </button>
                          </div>

                          {/* University Header */}
                          <div className="flex items-start gap-4 pr-24">
                            <div className={`w-12 h-12 rounded-2xl ${uni.logoColor} border flex items-center justify-center font-bold font-serif text-lg flex-shrink-0 shadow-lg`}>
                              {uni.name.substring(0, 1)}
                            </div>
                            <div>
                              <h4 className="font-serif font-bold text-lg text-white leading-snug">{uni.name}</h4>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
                                {uni.city}, {uni.country}
                              </p>
                            </div>
                          </div>

                          {/* Key Specs Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-850 text-xs">
                            <div>
                              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide">Tuition Fees</p>
                              <p className="font-bold text-white mt-1 text-sm">{uni.tuitionFees}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide">Recommended GPA</p>
                              <p className="font-bold text-amber-400 mt-1 text-sm">{uni.admissionGPA} / 4.0</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide">English Level</p>
                              <p className="font-bold text-amber-400 mt-1 text-sm">IELTS {uni.admissionIELTS}+</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide">QS Global Standing</p>
                              <p className="font-bold text-white mt-1 text-sm">Rank {uni.globalRanking}</p>
                            </div>
                          </div>

                          {/* Popular Programs tags */}
                          <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mr-1">Offered Programs:</span>
                            {uni.popularPrograms.map((prog, idx) => (
                              <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-medium text-gray-400">
                                {prog}
                              </span>
                            ))}
                          </div>

                          {/* Scholarship info box */}
                          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/[0.02] border border-amber-500/10 flex items-start gap-2.5">
                            <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Scholarship Potential</p>
                              <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">{uni.scholarships}</p>
                            </div>
                          </div>

                          {/* Dynamic Match Badge & Actions Row */}
                          <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Dynamic Match Score Alert */}
                            <div className="flex-1">
                              {studentGPA && studentIELTS ? (
                                <div className={`px-3 py-2 rounded-xl border text-[11px] font-semibold leading-relaxed ${matchColor}`}>
                                  {matchText}
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-500 italic">
                                  *Enter your GPA and IELTS scores in the dashboard to check your match potential.
                                </p>
                              )}
                            </div>

                            {/* Booking CTA trigger */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleBookConsultation(uni.name)}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-extrabold text-xs hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                              >
                                <Video className="w-3.5 h-3.5" />
                                Discuss Admission
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}



          {/* 3. Google Calendar & Meet Tab */}
          {activeTab === 'calendar' && !isLoadingWorkspace && (
            <div className="space-y-6">
              
              {/* Event Book Confirmation */}
              {meetCreatedEvent && (
                <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-green-400" />
                    <p className="font-bold">✓ Google Meet Scheduled Successfully!</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    An actual Google Calendar event has been added with an automatic, real Google Meet join link. We have also invited your counsel manager.
                  </p>
                  {meetCreatedEvent.meetLink && (
                    <a
                      href={meetCreatedEvent.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm bg-green-500 text-slate-950 font-bold px-4 py-2 rounded-xl mt-1.5 hover:bg-green-400 transition"
                    >
                      Join Google Meet <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold">My Consultation Calendar</h3>
                    <p className="text-xs text-gray-400 mt-1">Real-time scheduling synchronized from Google Calendar.</p>
                  </div>
                  {accessToken && (
                    <button onClick={loadWorkspaceData} className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" /> Reload
                    </button>
                  )}
                </div>

                {calendarEvents.length > 0 ? (
                  <div className="space-y-3">
                    {calendarEvents.map((event) => (
                      <div key={event.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{event.summary}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {event.start.dateTime ? new Date(event.start.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'All Day'}
                            </p>
                          </div>
                        </div>
                        {event.meetLink && (
                          <a
                            href={event.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold transition flex-shrink-0 cursor-pointer border border-cyan-500/20"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Meet
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-slate-800 rounded-xl">
                    <Calendar className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                    <p className="text-sm font-medium">No upcoming sessions found on your Google Calendar.</p>
                    <p className="text-xs text-gray-600 mt-1">Schedule a new consultation session below.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Google Contacts Tab */}
          {activeTab === 'contacts' && !isLoadingWorkspace && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold">Refer a Classmate</h3>
                    <p className="text-xs text-gray-400 mt-1">Refer students straight from your connected Google Contacts.</p>
                  </div>
                  {accessToken && (
                    <button onClick={loadWorkspaceData} className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" /> Reload
                    </button>
                  )}
                </div>

                {contacts.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {contacts.map((contact, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {contact.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs truncate">{contact.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{contact.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            alert(`Simulating referring ${contact.name} (${contact.email}) to AYD Consultancy.`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-bold text-amber-400 transition cursor-pointer border border-slate-800"
                        >
                          Refer
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-slate-800 rounded-xl">
                    <Users className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                    <p className="text-sm font-medium">No connections found in Google Contacts.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Google Form Tab */}
          {activeTab === 'form' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-400" />
                    {googleForm?.title || 'Pre-Admission Assessment Form'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {googleForm?.description || 'Provide your detailed educational background, target countries, and program preferences.'}
                  </p>
                </div>

                {isLoadingForm ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <p className="text-xs text-gray-400">Retrieving admissions Google Form...</p>
                  </div>
                ) : googleForm?.formUrl ? (
                  <div className="space-y-4">
                    {/* Embedded Form Iframe with high-quality styling */}
                    <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner h-[650px] relative">
                      <iframe 
                        src={googleForm.formUrl} 
                        className="w-full h-full border-0 absolute inset-0 rounded-2xl"
                        title={googleForm.title}
                        allow="autoplay"
                      >
                        Loading…
                      </iframe>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                      <div className="text-[10px] text-gray-500">
                        Form updated on: <span className="text-gray-400 font-semibold">{new Date(googleForm.updatedAt).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(googleForm.formUrl);
                            alert('Google Form URL copied to clipboard!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-gray-300 border border-slate-800 transition cursor-pointer"
                        >
                          Copy Link
                        </button>
                        <a
                          href={googleForm.formUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-slate-800 rounded-xl">
                    <ClipboardList className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                    <p className="text-sm font-medium">Google Form not configured.</p>
                    <p className="text-xs text-gray-600 mt-1">Ask your consultancy agent to configure an assessment form.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar Column (Meet Scheduling Form) */}
        <div className="space-y-6">
          
          {/* Schedule Google Meet Form */}
          <div ref={bookingFormRef} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">Live Consultation</h3>
                <p className="text-xs text-gray-400">Book Google Meet Session</p>
              </div>
            </div>

            <form onSubmit={handleCreateMeet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Session Subject</label>
                <input
                  type="text"
                  required
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  placeholder="e.g. AYD Academic Counselling"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Counselling Focus Details</label>
                <textarea
                  required
                  value={meetDescription}
                  onChange={(e) => setMeetDescription(e.target.value)}
                  className="w-full h-20 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="e.g. statement of purpose feedback"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Meeting Time (UTC)</label>
                  <input
                    type="time"
                    required
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingMeet || !accessToken}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 mt-2"
              >
                {isCreatingMeet ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating Meet Link...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Schedule Google Meet Session
                  </>
                )}
              </button>
            </form>
          </div>

          {/* SOP Guidance Section */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold mb-3">Resources</p>
            <h4 className="font-serif font-bold text-white text-base mb-2">Statement of Purpose Guide</h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Write a strong introduction stating your academic objectives. Outline your professional timeline, goals, and specify why this country matches your plans. Keep it to 1000 words.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <FileText className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">SOP_Template.docx</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Verified Guidelines Document</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
