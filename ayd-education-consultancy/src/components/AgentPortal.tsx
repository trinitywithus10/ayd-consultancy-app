import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Award, DollarSign, BookOpen, Clock, Loader2, Sparkles, RefreshCw, Plus, AlertCircle, FileSpreadsheet, Calendar,
  ClipboardList, Check, ExternalLink, Eye
} from 'lucide-react';
import { UserProfile, Referral, DriveFile, CalendarEvent, GoogleFormConfig, StudentApplicationStatus, ApplicationStage } from '../types';
import { getReferralsByAgent, createReferral, getCachedAccessToken, getGoogleFormConfig, saveGoogleFormConfig, getStudentApplicationStatus, saveStudentApplicationStatus, DEFAULT_STAGES_BLUEPRINT } from '../firebase';
import { fetchDriveFiles, fetchCalendarEvents } from '../googleApi';

interface AgentPortalProps {
  userProfile: UserProfile;
}

export default function AgentPortal({ userProfile }: AgentPortalProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  
  // Workspace data states
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);

  // New referral form states
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [program, setProgram] = useState('Undergraduate');
  const [country, setCountry] = useState('Canada');
  const [commissionAmount, setCommissionAmount] = useState('150');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Google Form integration states
  const [googleForm, setGoogleForm] = useState<GoogleFormConfig | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [saveFormSuccess, setSaveFormSuccess] = useState(false);
  const [saveFormError, setSaveFormError] = useState<string | null>(null);

  // Student Stage management states
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  const [selectedStudentUid, setSelectedStudentUid] = useState('');
  const [studentAppStatus, setStudentAppStatus] = useState<StudentApplicationStatus | null>(null);
  const [isLoadingStudentStatus, setIsLoadingStudentStatus] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState('documents');
  const [stageNotes, setStageNotes] = useState('');
  const [isSavingStudentStatus, setIsSavingStudentStatus] = useState(false);
  const [saveStatusSuccess, setSaveStatusSuccess] = useState(false);
  const [saveStatusError, setSaveStatusError] = useState<string | null>(null);

  // Load selected student's application status
  const handleLoadStudentStatus = async (email: string) => {
    setSelectedStudentEmail(email);
    if (!email) {
      setStudentAppStatus(null);
      return;
    }
    
    setIsLoadingStudentStatus(true);
    setSaveStatusSuccess(false);
    setSaveStatusError(null);
    try {
      const matchingReferral = referrals.find(r => r.studentEmail === email);
      const targetUid = matchingReferral ? matchingReferral.id : `mock-uid-${email.replace(/[^a-zA-Z0-9]/g, '')}`;
      setSelectedStudentUid(targetUid);
      
      const cached = localStorage.getItem(`appstatus_${targetUid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setStudentAppStatus(parsed);
        setSelectedStageId(parsed.currentStageId);
        const currentStage = parsed.stages.find((s: any) => s.id === parsed.currentStageId);
        setStageNotes(currentStage?.notes || '');
        setIsLoadingStudentStatus(false);
        return;
      }

      const status = await getStudentApplicationStatus(targetUid);
      setStudentAppStatus(status);
      setSelectedStageId(status.currentStageId);
      const currentStage = status.stages.find(s => s.id === status.currentStageId);
      setStageNotes(currentStage?.notes || '');
    } catch (err: any) {
      console.error('Failed to load student status:', err);
      setSaveStatusError('Failed to load application status for this student.');
    } finally {
      setIsLoadingStudentStatus(false);
    }
  };

  // Save/Update student application status
  const handleUpdateStudentStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentUid || !studentAppStatus) return;

    setIsSavingStudentStatus(true);
    setSaveStatusSuccess(false);
    setSaveStatusError(null);

    try {
      const updatedStages = studentAppStatus.stages.map(stage => {
        if (stage.id === selectedStageId) {
          return {
            ...stage,
            notes: stageNotes,
            updatedAt: new Date().toISOString()
          };
        }
        return stage;
      });

      const updatedStatus: StudentApplicationStatus = {
        ...studentAppStatus,
        currentStageId: selectedStageId,
        stages: updatedStages,
        lastUpdatedAt: new Date().toISOString()
      };

      await saveStudentApplicationStatus(selectedStudentUid, updatedStatus);
      localStorage.setItem(`appstatus_${selectedStudentUid}`, JSON.stringify(updatedStatus));
      
      setStudentAppStatus(updatedStatus);
      setSaveStatusSuccess(true);
    } catch (err: any) {
      console.error('Failed to save student status:', err);
      setSaveStatusError('Failed to save updated admissions stage to Firestore.');
    } finally {
      setIsSavingStudentStatus(false);
    }
  };

  const accessToken = getCachedAccessToken();

  useEffect(() => {
    loadReferrals();
    loadFormConfig();
    if (accessToken) {
      loadWorkspaceData();
    }
  }, [userProfile.uid, accessToken]);

  const loadFormConfig = async () => {
    setIsLoadingForm(true);
    try {
      const config = await getGoogleFormConfig();
      setGoogleForm(config);
      setFormUrl(config.formUrl);
      setFormTitle(config.title);
      setFormDescription(config.description);
    } catch (err) {
      console.error('Failed to load Google Form config:', err);
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleSaveFormConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl) return;

    let formattedUrl = formUrl.trim();
    
    if (!formattedUrl.includes('docs.google.com/forms')) {
      setSaveFormError('Please enter a valid Google Forms URL (docs.google.com/forms).');
      return;
    }

    if (!formattedUrl.includes('?embedded=true') && !formattedUrl.includes('&embedded=true')) {
      if (formattedUrl.includes('?')) {
        formattedUrl += '&embedded=true';
      } else {
        formattedUrl += '?embedded=true';
      }
    }

    setIsSavingForm(true);
    setSaveFormSuccess(false);
    setSaveFormError(null);

    const confirmed = window.confirm(
      `Are you sure you want to update the shared Admissions Form with "${formTitle}"? This will immediately replace the form displayed to all students.`
    );
    
    if (!confirmed) {
      setIsSavingForm(false);
      return;
    }

    try {
      const newConfig: GoogleFormConfig = {
        formUrl: formattedUrl,
        title: formTitle,
        description: formDescription,
        updatedBy: userProfile.uid,
        updatedAt: new Date().toISOString()
      };

      await saveGoogleFormConfig(newConfig);
      setGoogleForm(newConfig);
      setFormUrl(formattedUrl);
      setSaveFormSuccess(true);
    } catch (err: any) {
      console.error('Failed to save Google Form config:', err);
      setSaveFormError(err.message || 'Failed to update Google Form settings.');
    } finally {
      setIsSavingForm(false);
    }
  };

  const loadReferrals = async () => {
    setIsLoadingReferrals(true);
    try {
      const data = await getReferralsByAgent(userProfile.uid);
      setReferrals(data);
    } catch (err) {
      console.error('Failed to load referrals from Firestore:', err);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  const loadWorkspaceData = async () => {
    if (!accessToken) return;
    setIsLoadingWorkspace(true);
    try {
      const files = await fetchDriveFiles(accessToken);
      setDriveFiles(files);
      const events = await fetchCalendarEvents(accessToken);
      setCalendarEvents(events);
    } catch (err) {
      console.error('Agent Workspace error:', err);
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      await createReferral({
        studentName,
        studentEmail,
        program,
        country,
        commissionAmount: parseFloat(commissionAmount) || 150,
        status: 'Pending',
        agentId: userProfile.uid
      });
      
      setSubmitSuccess(true);
      setStudentName('');
      setStudentEmail('');
      setCommissionAmount('150');
      
      // Refresh referrals list
      await loadReferrals();
    } catch (err) {
      console.error('Failed to create referral in Firestore:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  const totalCommissionEarned = referrals
    .filter(r => r.status === 'Enrolled')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  const pendingCommission = referrals
    .filter(r => r.status !== 'Enrolled')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      {/* Welcome Banner */}
      <div className="mb-10 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl"></div>
        <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          AYD Registered Agent Workspace
        </p>
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-2">
          Agent Dashboard: {userProfile.agencyName || 'Independent Consultant'}
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
          Submit new student referrals, monitor pending commissions, track admissions, and manage agent partnership resources.
        </p>
      </div>

      {/* Metrics Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase block mb-1">Total Referrals</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-amber-400">{referrals.length}</span>
            <span className="text-xs text-gray-500">Students matched</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase block mb-1">Pending Admissions</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-cyan-400">
              {referrals.filter(r => r.status !== 'Enrolled').length}
            </span>
            <span className="text-xs text-gray-500">Under review</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase block mb-1">Commissions Earned</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-green-400">${totalCommissionEarned}</span>
            <span className="text-xs text-gray-500">USD Paid</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase block mb-1">Commissions Pending</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-yellow-500">${pendingCommission}</span>
            <span className="text-xs text-gray-500">Pipeline estimation</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column (Referral List & Workspace Sync) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Referrals Pipeline from Firestore */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold">Referral Pipeline Tracker</h3>
                <p className="text-xs text-gray-400 mt-1">Real-time status updates synced securely from Firestore.</p>
              </div>
              <button 
                onClick={loadReferrals} 
                disabled={isLoadingReferrals}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 transition cursor-pointer border border-slate-800"
              >
                <RefreshCw className={`w-4 h-4 text-amber-400 ${isLoadingReferrals ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoadingReferrals ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pr-4">Student Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Destination</th>
                      <th className="pb-3 pr-4">Pipeline Status</th>
                      <th className="pb-3 text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {referrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-950/20 transition">
                        <td className="py-4 pr-4 font-semibold text-white">{ref.studentName}</td>
                        <td className="py-4 pr-4 text-gray-400">{ref.studentEmail}</td>
                        <td className="py-4 pr-4 text-gray-300">
                          {ref.program} • <span className="font-bold">{ref.country}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            ref.status === 'Enrolled' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : ref.status === 'Under Review'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-amber-400">${ref.commissionAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 border border-dashed border-slate-800 rounded-2xl">
                <Users className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                <p className="text-sm font-medium">No referrals logged yet.</p>
                <p className="text-xs text-gray-600 mt-1">Submit your first student referral on the right form to start earning commissions!</p>
              </div>
            )}
          </div>

          {/* Connected Google Workspace Calendar Events / Shared Folder Files */}
          {accessToken && (
            <div className="grid sm:grid-cols-2 gap-6">
              
              {/* Agent calendar upcoming client consultations */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <h4 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-purple-400" />
                  Counseling Calendar
                </h4>
                {isLoadingWorkspace ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-amber-400 animate-spin" /></div>
                ) : calendarEvents.length > 0 ? (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {calendarEvents.slice(0, 4).map((event) => (
                      <div key={event.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <p className="font-semibold text-white truncate">{event.summary}</p>
                        <p className="text-gray-500 mt-1">
                          {event.start.dateTime ? new Date(event.start.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'All Day'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No upcoming meetings scheduled.</p>
                )}
              </div>

              {/* Shared agency folder files */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <h4 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-blue-400" />
                  Commission Statements
                </h4>
                {isLoadingWorkspace ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-amber-400 animate-spin" /></div>
                ) : driveFiles.length > 0 ? (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {driveFiles.slice(0, 4).map((file) => (
                      <div key={file.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2">
                        <p className="font-semibold text-white truncate flex-1">{file.name}</p>
                        {file.webViewLink && (
                          <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-white font-bold text-[10px]">
                            Open
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No shared documents found in Drive.</p>
                )}
              </div>

            </div>
          )}

          {/* Admissions Journey Stage Manager */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Student Admissions Stage Manager</h3>
                <p className="text-xs text-gray-400">Track and update university admissions pipelines</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Select Student Case</label>
                <select
                  value={selectedStudentEmail}
                  onChange={(e) => handleLoadStudentStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose a Referral Case --</option>
                  {referrals.map(ref => (
                    <option key={ref.id} value={ref.studentEmail}>
                      {ref.studentName} ({ref.studentEmail})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Selecting a student loads their current admissions roadmap progress directly from Firestore.
                </p>
              </div>

              {selectedStudentEmail && (
                <>
                  {isLoadingStudentStatus ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    </div>
                  ) : studentAppStatus ? (
                    <form onSubmit={handleUpdateStudentStage} className="space-y-4 pt-2 border-t border-slate-800/60">
                      {saveStatusSuccess && (
                        <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2">
                          <Check className="w-4 h-4 flex-shrink-0" />
                          <span>✓ Student journey stage successfully updated and live!</span>
                        </div>
                      )}

                      {saveStatusError && (
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{saveStatusError}</span>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Set Active Stage</label>
                          <select
                            value={selectedStageId}
                            onChange={(e) => {
                              setSelectedStageId(e.target.value);
                              const stage = studentAppStatus.stages.find(s => s.id === e.target.value);
                              setStageNotes(stage?.notes || '');
                            }}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                          >
                            {studentAppStatus.stages.map((stage, idx) => (
                              <option key={stage.id} value={stage.id}>
                                Stage {idx + 1}: {stage.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1">Last Update</label>
                          <div className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-gray-500 text-xs">
                            {new Date(studentAppStatus.lastUpdatedAt).toLocaleDateString([], { dateStyle: 'medium' })}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Consultant Specialist Notes / Remarks</label>
                        <textarea
                          rows={3}
                          value={stageNotes}
                          onChange={(e) => setStageNotes(e.target.value)}
                          placeholder="Provide specific notes/requirements for this stage, visible to the student..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingStudentStatus}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                      >
                        {isSavingStudentStatus ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>Update Student Journey Stage</>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500 border border-dashed border-slate-800 rounded-xl">
                      Could not retrieve active roadmap details. Click to try again.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Google Form Integration Setting Panel */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Google Form Integration</h3>
                  <p className="text-xs text-gray-400">Configure Admissions Assessment Form</p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadFormConfig}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 transition text-gray-400 hover:text-amber-400 cursor-pointer border border-slate-800"
                title="Refresh Configuration"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingForm ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSaveFormConfig} className="space-y-4">
                {saveFormSuccess && (
                  <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>✓ Shared Google Form configuration successfully saved & active for students!</span>
                  </div>
                )}

                {saveFormError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{saveFormError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Form Title</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Student Pre-Admission Profile Assessment"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Form Description</label>
                    <textarea
                      required
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400 resize-none"
                      placeholder="Describe the objective or instruction for students filling out the form..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center justify-between">
                      <span>Google Form Share or Embed URL</span>
                      <a 
                        href="https://forms.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                      >
                        Create Form <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </label>
                    <input
                      type="text"
                      required
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                      placeholder="e.g. https://docs.google.com/forms/d/e/.../viewform?embedded=true"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      Paste either the public viewing link or iframe embed source URL. The portal automatically formats it to render cleanly inside the student dashboard.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSavingForm}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    {isSavingForm ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" /> Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Collapsible live preview section to verify embed works */}
            {googleForm?.formUrl && !isLoadingForm && (
              <div className="pt-4 border-t border-slate-800/80">
                <details className="group">
                  <summary className="flex items-center justify-between text-xs font-bold text-gray-300 cursor-pointer list-none select-none">
                    <span className="flex items-center gap-1.5 hover:text-white transition">
                      <Eye className="w-4 h-4 text-amber-400" />
                      Live Form Preview (Active)
                    </span>
                    <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-4 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden h-[400px] relative">
                    <iframe 
                      src={googleForm.formUrl} 
                      className="w-full h-full border-0 absolute inset-0 rounded-2xl"
                      title="Google Form Preview"
                    >
                      Loading…
                    </iframe>
                  </div>
                </details>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar Column (Add Referral & Agency Policy) */}
        <div className="space-y-6">
          
          {/* Add Referral Form */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">New Referral</h3>
                <p className="text-xs text-gray-400">Log Student Case</p>
              </div>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-center mb-4">
                ✓ Student Referral Saved to Firestore.
              </div>
            )}

            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Liam Smith"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Student Email Address *</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  placeholder="e.g. liam@gmail.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                  >
                    <option>Undergraduate</option>
                    <option>Postgraduate</option>
                    <option>PhD</option>
                    <option>Diploma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                  >
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>Australia</option>
                    <option>Germany</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Expected Commission (USD) *</label>
                <input
                  type="number"
                  required
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  placeholder="150"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Log Student Referral
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Commission Policy / Resources */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h4 className="font-serif font-bold text-white text-base">Agency Terms & Policies</h4>
            <div className="space-y-3.5 text-xs text-gray-400 leading-relaxed">
              <div className="flex gap-2.5">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <p>Commissions are paid within 30 days after student enrollment fees are verified.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <p>Standard rate is $150 per language course, or up to $500 for postgraduate degrees.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <p>Referral records are protected under secure cloud databases to guarantee your client ownership.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
