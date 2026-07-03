export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  modelUsed?: string;
  sources?: Array<{ title: string; url: string }>;
  isHumanPrompt?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'agent';
  agencyName?: string;
  createdAt: string;
}

export interface DocumentRequirement {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  updatedAt: string;
}

export interface StudentChecklist {
  userId: string;
  requirements: {
    [reqId: string]: DocumentRequirement;
  };
  lastSyncedAt?: string;
}

export interface Enquiry {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  program: string;
  message: string;
  submittedAt: string;
  status: 'Pending' | 'Contacted' | 'Completed';
}

export interface Referral {
  id?: string;
  studentName: string;
  studentEmail: string;
  program: string;
  country: string;
  status: 'Pending' | 'Active' | 'Under Review' | 'Enrolled';
  commissionAmount: number;
  agentId: string;
  createdAt: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

export interface GoogleContact {
  resourceName: string;
  name: string;
  email: string;
  phone?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  meetLink?: string;
}

export interface GoogleFormConfig {
  formUrl: string;
  title: string;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ApplicationStage {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  updatedAt: string;
  notes?: string;
}

export interface StudentApplicationStatus {
  userId: string;
  currentStageId: string;
  stages: ApplicationStage[];
  lastUpdatedAt: string;
}

