import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, StudentChecklist, DocumentRequirement, GoogleFormConfig, StudentApplicationStatus, ApplicationStage } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// In-memory token cache (Do NOT store in localStorage or sessionStorage for security)
let cachedAccessToken: string | null = null;

export function getCachedAccessToken(): string | null {
  if (!cachedAccessToken) {
    cachedAccessToken = sessionStorage.getItem('google_access_token');
  }
  return cachedAccessToken;
}

export function clearCachedAccessToken() {
  cachedAccessToken = null;
  sessionStorage.removeItem('google_access_token');
}

// Watch auth state to clear token on logout
onAuthStateChanged(auth, (user) => {
  if (!user) {
    clearCachedAccessToken();
  }
});

// Sign in with Google and request Google Workspace Scopes
export async function signInWithGoogle(role: 'student' | 'agent', agencyName?: string): Promise<{ user: User; profile: UserProfile }> {
  const provider = new GoogleAuthProvider();
  
  // Request required Google Workspace scopes
  provider.addScope('https://www.googleapis.com/auth/calendar');
  provider.addScope('https://www.googleapis.com/auth/drive');
  provider.addScope('https://www.googleapis.com/auth/contacts');

  // Force consent screen to guarantee getting fresh credentials if needed
  provider.setCustomParameters({
    prompt: 'consent'
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  
  if (credential && credential.accessToken) {
    cachedAccessToken = credential.accessToken;
    sessionStorage.setItem('google_access_token', credential.accessToken);
    console.log('Google Access Token cached in-memory and sessionStorage successfully.');
  }

  const user = result.user;

  // Retrieve or create User Profile in Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  let profile: UserProfile;

  if (userDocSnap.exists()) {
    profile = userDocSnap.data() as UserProfile;
  } else {
    profile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'AYD User',
      role: role,
      agencyName: role === 'agent' ? (agencyName || 'Independent Agency') : undefined,
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, profile);
  }

  return { user, profile };
}

// Standard Sign-out
export async function logOut() {
  await signOut(auth);
  clearCachedAccessToken();
}

// Firestore Helper Functions

// 1. Submit Enquiry (Student or Landing Page Form)
export async function createEnquiry(enquiry: Omit<import('./types').Enquiry, 'id' | 'status'>) {
  const colRef = collection(db, 'enquiries');
  const docRef = await addDoc(colRef, {
    ...enquiry,
    status: 'Pending'
  });
  return docRef.id;
}

// 2. Fetch Enquiries (for current student, or all for admin/agents if allowed)
export async function getEnquiriesByEmail(email: string) {
  const colRef = collection(db, 'enquiries');
  const q = query(colRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  
  const enquiries: import('./types').Enquiry[] = [];
  querySnapshot.forEach((doc) => {
    enquiries.push({ id: doc.id, ...doc.data() } as import('./types').Enquiry);
  });
  return enquiries;
}

// 3. Create Referral (Agent Dashboard)
export async function createReferral(referral: Omit<import('./types').Referral, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'referrals');
  const docRef = await addDoc(colRef, {
    ...referral,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

// 4. Fetch Referrals by Agent
export async function getReferralsByAgent(agentId: string) {
  const colRef = collection(db, 'referrals');
  const q = query(colRef, where('agentId', '==', agentId));
  const querySnapshot = await getDocs(q);
  
  const referrals: import('./types').Referral[] = [];
  querySnapshot.forEach((doc) => {
    referrals.push({ id: doc.id, ...doc.data() } as import('./types').Referral);
  });
  return referrals;
}

// --- Hardened Firestore Error Handling & Document Tracking Sync ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Exception:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Default requirement blueprints to bootstrap a student checklist
export const DEFAULT_REQUIREMENTS: { [reqId: string]: Omit<DocumentRequirement, 'completed' | 'updatedAt'> } = {
  transcripts: {
    id: 'transcripts',
    label: 'Academic Transcripts',
    description: 'Upload high school or undergraduate certificates and detailed transcripts.'
  },
  lors: {
    id: 'lors',
    label: 'Letters of Recommendation (LORs)',
    description: 'Provide at least two academic or professional reference letters.'
  },
  sop: {
    id: 'sop',
    label: 'Statement of Purpose (SOP)',
    description: 'Draft a personal essay outlining academic background and study abroad objectives.'
  },
  passport: {
    id: 'passport',
    label: 'Passport & ID Copy',
    description: 'A clear copy of your passport photo page, valid for at least 6 months.'
  },
  languageTest: {
    id: 'languageTest',
    label: 'Language Proficiency Test',
    description: 'IELTS, TOEFL, or Duolingo English Test scorecard.'
  },
  resume: {
    id: 'resume',
    label: 'Resume / Curriculum Vitae',
    description: 'An updated CV outlining your academic timeline and any work experiences.'
  }
};

/**
 * Fetch or bootstrap a student's document requirement checklist from Firestore.
 */
export async function getStudentChecklist(userId: string): Promise<StudentChecklist> {
  const docPath = `checklists/${userId}`;
  
  // For password-based mock logins, return bootstrapped checklist immediately to avoid Firestore permissions errors
  if (userId.startsWith('pwd-')) {
    const initialRequirements: { [reqId: string]: DocumentRequirement } = {};
    Object.entries(DEFAULT_REQUIREMENTS).forEach(([key, val]) => {
      initialRequirements[key] = {
        ...val,
        completed: false,
        updatedAt: new Date().toISOString()
      };
    });
    return {
      userId,
      requirements: initialRequirements,
      lastSyncedAt: new Date().toISOString()
    };
  }

  try {
    const docRef = doc(db, 'checklists', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as StudentChecklist;
      // cache in localStorage
      localStorage.setItem(`checklist_${userId}`, JSON.stringify(data));
      return data;
    } else {
      // Bootstrap initial checklist with default requirements
      const initialRequirements: { [reqId: string]: DocumentRequirement } = {};
      Object.entries(DEFAULT_REQUIREMENTS).forEach(([key, val]) => {
        initialRequirements[key] = {
          ...val,
          completed: false,
          updatedAt: new Date().toISOString()
        };
      });
      
      const newChecklist: StudentChecklist = {
        userId,
        requirements: initialRequirements,
        lastSyncedAt: new Date().toISOString()
      };
      
      // Persist to firestore only if real authenticated session (non-mock / non-password mock)
      if (auth.currentUser && !userId.startsWith('pwd-')) {
        await setDoc(docRef, newChecklist);
        localStorage.setItem(`checklist_${userId}`, JSON.stringify(newChecklist));
      }
      return newChecklist;
    }
  } catch (error) {
    console.warn('Firestore offline or failed, attempting localStorage fallback for checklist:', error);
    const cached = localStorage.getItem(`checklist_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (pErr) {
        // ignore parse error
      }
    }
    // Return a default bootstrapped one if absolutely nothing is cached
    const initialRequirements: { [reqId: string]: DocumentRequirement } = {};
    Object.entries(DEFAULT_REQUIREMENTS).forEach(([key, val]) => {
      initialRequirements[key] = {
        ...val,
        completed: false,
        updatedAt: new Date().toISOString()
      };
    });
    return {
      userId,
      requirements: initialRequirements,
      lastSyncedAt: new Date().toISOString()
    };
  }
}

/**
 * Save / Update a student's entire document requirement checklist in Firestore.
 */
export async function saveStudentChecklist(userId: string, checklist: StudentChecklist): Promise<void> {
  const docPath = `checklists/${userId}`;
  // Always update localStorage first so that we have instant local persistence
  localStorage.setItem(`checklist_${userId}`, JSON.stringify(checklist));

  if (userId.startsWith('pwd-')) return;

  try {
    const docRef = doc(db, 'checklists', userId);
    await setDoc(docRef, {
      ...checklist,
      lastSyncedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to save student checklist to Firestore (offline/error), but updated locally:', error);
  }
}

export const DEFAULT_GOOGLE_FORM: GoogleFormConfig = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdUHZdX7bRRvdbuenZaYm3S3GWbBrobmrL4WfWTGk7pTycFlQ/viewform?embedded=true',
  title: 'Pre-Admission Assessment Form',
  description: 'Provide your detailed educational background, target countries, and program preferences so that our consultants can pair you with optimal scholarships.',
  updatedBy: 'system',
  updatedAt: new Date().toISOString()
};

/**
 * Fetch Google Form integration configuration from Firestore
 */
export async function getGoogleFormConfig(): Promise<GoogleFormConfig> {
  const docPath = 'settings/google_form';
  try {
    const docRef = doc(db, 'settings', 'google_form');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as GoogleFormConfig;
    } else {
      return DEFAULT_GOOGLE_FORM;
    }
  } catch (error) {
    console.warn('Could not read settings from Firestore, using default form:', error);
    return DEFAULT_GOOGLE_FORM;
  }
}

/**
 * Save Google Form integration configuration in Firestore
 */
export async function saveGoogleFormConfig(config: GoogleFormConfig): Promise<void> {
  const docPath = 'settings/google_form';
  try {
    const docRef = doc(db, 'settings', 'google_form');
    await setDoc(docRef, config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Default University Application Stages Blueprint
export const DEFAULT_STAGES_BLUEPRINT: Omit<ApplicationStage, 'updatedAt'>[] = [
  {
    id: 'consultation',
    label: 'Profile & Consultation',
    description: 'Evaluation of academic transcripts, test scores, target countries, and budget constraints.',
    status: 'completed',
    notes: 'Completed. Diagnostic roadmap established. Preferred destination countries locked.'
  },
  {
    id: 'shortlisting',
    label: 'University Shortlisting',
    description: 'Matching academic qualifications with ideal courses, specific intakes, and scholarship opportunities.',
    status: 'completed',
    notes: 'Completed. Top 3 target institutions in Canada and Australia shortlisted.'
  },
  {
    id: 'documents',
    label: 'Document Compilation',
    description: 'Assembling credentials, finalizing Statement of Purpose (SOP), obtaining reference letters, and language tests.',
    status: 'current',
    notes: 'In progress. Student is gathering letters of recommendation and refining the SOP draft.'
  },
  {
    id: 'submission',
    label: 'Application Submitted',
    description: 'Submitting official applications to target universities via professional agency agent channels.',
    status: 'pending',
    notes: 'Pending. Applications will be dispatched once document compilation reaches 100% completion.'
  },
  {
    id: 'offer',
    label: 'Offer Letter Processing',
    description: 'Awaiting conditional or unconditional offer letters of admission from university registry offices.',
    status: 'pending',
    notes: 'Awaiting submission. Standard turn-around-time from admission officers is 2-4 weeks.'
  },
  {
    id: 'visa',
    label: 'Visa Lodgement',
    description: 'Drafting GTE statements, assembling liquid financial proof, arranging medical checks, and filing visa applications.',
    status: 'pending',
    notes: 'Awaiting offer letter acceptance and secure enrollment confirmation deposit (COE/LOA).'
  },
  {
    id: 'departure',
    label: 'Pre-Departure Briefing',
    description: 'Booking safe accommodations, organizing student health insurance (OSHC), air ticket matches, and departure briefings.',
    status: 'pending',
    notes: 'Future Stage. Final guidelines to ensure seamless landing, airport pickup, and university enrollment.'
  }
];

/**
 * Fetch or bootstrap a student's university application status from Firestore.
 */
export async function getStudentApplicationStatus(userId: string): Promise<StudentApplicationStatus> {
  const docPath = `application_statuses/${userId}`;
  
  // For password-based mock logins, return bootstrapped status immediately to avoid Firestore permissions errors
  if (userId.startsWith('pwd-')) {
    const initialStages: ApplicationStage[] = DEFAULT_STAGES_BLUEPRINT.map(stage => ({
      ...stage,
      updatedAt: new Date().toISOString()
    }));
    return {
      userId,
      currentStageId: 'documents', // Default starting active stage is documents
      stages: initialStages,
      lastUpdatedAt: new Date().toISOString()
    };
  }

  try {
    const docRef = doc(db, 'application_statuses', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as StudentApplicationStatus;
      localStorage.setItem(`app_status_${userId}`, JSON.stringify(data));
      return data;
    } else {
      // Bootstrap initial stages from blueprint
      const initialStages: ApplicationStage[] = DEFAULT_STAGES_BLUEPRINT.map(stage => ({
        ...stage,
        updatedAt: new Date().toISOString()
      }));
      
      const newStatus: StudentApplicationStatus = {
        userId,
        currentStageId: 'documents', // Default starting active stage is documents
        stages: initialStages,
        lastUpdatedAt: new Date().toISOString()
      };
      
      // Persist to firestore only if real authenticated session (non-mock / non-password mock)
      if (auth.currentUser && !userId.startsWith('pwd-')) {
        await setDoc(docRef, newStatus);
        localStorage.setItem(`app_status_${userId}`, JSON.stringify(newStatus));
      }
      return newStatus;
    }
  } catch (error) {
    console.warn('Firestore offline or failed, attempting localStorage fallback for application status:', error);
    const cached = localStorage.getItem(`app_status_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (pErr) {
        // ignore parse error
      }
    }
    const initialStages: ApplicationStage[] = DEFAULT_STAGES_BLUEPRINT.map(stage => ({
      ...stage,
      updatedAt: new Date().toISOString()
    }));
    return {
      userId,
      currentStageId: 'documents',
      stages: initialStages,
      lastUpdatedAt: new Date().toISOString()
    };
  }
}

/**
 * Save or update a student's entire university application status in Firestore.
 */
export async function saveStudentApplicationStatus(userId: string, status: StudentApplicationStatus): Promise<void> {
  const docPath = `application_statuses/${userId}`;
  // Always update localStorage first so that we have instant local persistence
  localStorage.setItem(`app_status_${userId}`, JSON.stringify(status));

  if (userId.startsWith('pwd-')) return;

  try {
    const docRef = doc(db, 'application_statuses', userId);
    await setDoc(docRef, {
      ...status,
      lastUpdatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to save student application status to Firestore (offline/error), but updated locally:', error);
  }
}

export interface ContactRequest {
  email: string;
  phone: string;
  issue: string;
  submittedAt: string;
}

/**
 * Save a new user inquiry/contact request to Firestore.
 */
export async function saveContactRequest(request: ContactRequest): Promise<void> {
  const docPath = 'contact_requests';
  try {
    const colRef = collection(db, 'contact_requests');
    await addDoc(colRef, request);
  } catch (error) {
    console.error('Failed to save contact request to Firestore:', error);
  }
}


