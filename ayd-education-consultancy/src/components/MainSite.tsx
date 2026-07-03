import React, { useState } from 'react';
import { 
  FileText, Award, Plane, BookOpen, GraduationCap, ChevronDown, CheckCircle, 
  MapPin, Phone, Mail, Clock, ShieldCheck, HelpCircle, Loader2, DollarSign, ArrowRight 
} from 'lucide-react';
import { createEnquiry } from '../firebase';

interface MainSiteProps {
  onStartJourney: () => void;
}

export default function MainSite({ onStartJourney }: MainSiteProps) {
  // Study Plan Active Tab
  const [studyTab, setStudyTab] = useState<'undergraduate' | 'postgraduate' | 'phd' | 'diploma'>('undergraduate');
  
  // FAQ toggles
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Enquiry Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Canada');
  const [program, setProgram] = useState('Undergraduate');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null);

  // Google Pay Simulation
  const [googlePayActive, setGooglePayActive] = useState(false);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;

    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      await createEnquiry({
        fullName,
        email,
        phone,
        country,
        program,
        message,
        submittedAt: new Date().toISOString()
      });
      setSubmitResult('success');
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      console.error('Enquiry failed:', err);
      setSubmitResult('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGooglePayClick = () => {
    setGooglePayActive(true);
    setTimeout(() => {
      setGooglePayActive(false);
      setSubmitResult('success');
      setFullName('Liam O\'Connor');
      setEmail('liam@gmail.com');
      setPhone('+1 (555) 019-2834');
      setMessage('Successfully processed 1-on-1 counseling fee payment via Google Pay.');
    }, 1500);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const visaSuccessRates = [
    { country: '🇺🇸 USA (F1 Visa)', rate: 97 },
    { country: '🇬🇧 UK (Tier 4)', rate: 99 },
    { country: '🇨🇦 Canada (Study Permit)', rate: 96 },
    { country: '🇦🇺 Australia (Subclass 500)', rate: 98 },
    { country: '🇩🇪 Germany (Student Visa)', rate: 95 },
    { country: '🇳🇿 New Zealand', rate: 98 },
  ];

  const faqs = [
    { q: "How long does the admission process take?", a: "Typically 2 to 8 weeks depending on the university and country intake. We expedite this by ensuring all Statement of Purpose templates and transcripts are thoroughly validated from day one." },
    { q: "Do you guarantee student visa approvals?", a: "While no agency can guarantee immigration outcomes, our 98% student visa success rate is testament to our rigorous checklists and mock interview sessions." },
    { q: "What is the consultation fee?", a: "Initial counselling and university shortlisting are 100% free of charge. Optional premium LOR drafting and express visa processing can be paid via our fast Google Pay integration." },
    { q: "Can I study abroad without IELTS?", a: "Yes, absolutely! Many premier partner universities in Canada, UK, and Germany support Duolingo, English Proficiency letters, or specific vocational pathway programs." },
  ];

  return (
    <div className="font-sans text-slate-200">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Trusted by 15,000+ Students Worldwide
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1]">
                Your Dreams,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                  Our Direction
                </span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg max-w-lg leading-relaxed">
                Empowering international students with expert, transparent guidance for admissions, full tuition scholarships, stress-free visa success, and career study roadmaps.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="#enquiry"
                  className="px-8 py-4 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-900 hover:opacity-90 shadow-xl shadow-amber-500/20 transition pulse-glow"
                >
                  Start Your Journey →
                </a>
                <a
                  href="#services"
                  className="px-8 py-4 rounded-full font-semibold text-sm border border-slate-700 hover:bg-slate-900 transition text-white"
                >
                  Explore Services
                </a>
              </div>
              
              {/* Counter details */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-850/60 max-w-md">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400">15K+</p>
                  <p className="text-xs text-gray-500 mt-0.5">Students Placed</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400">98%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Visa Success</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400">50+</p>
                  <p className="text-xs text-gray-500 mt-0.5">Global Nations</p>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Card */}
            <div className="hidden lg:block relative justify-self-center">
              <div className="w-[380px] h-[380px] rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden float-anim">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full filter blur-xl"></div>
                <div className="text-6xl mb-4">🎓</div>
                <h4 className="font-serif text-2xl font-bold text-white mb-2">Global Education</h4>
                <p className="text-gray-400 text-sm max-w-[250px] leading-relaxed">
                  Fast Admission matching with over 200+ elite partner universities.
                </p>
                <div className="flex gap-2 mt-6">
                  {['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇮🇪'].map((flag, idx) => (
                    <span key={idx} className="text-2xl filter drop-shadow-md">{flag}</span>
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-bold shadow-lg">
                ✓ No IELTS Pathway
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold shadow-lg">
                💰 100% Scholarships
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Partners marquee info */}
      <section className="bg-slate-950 border-b border-slate-900 py-6 text-center text-xs text-gray-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 flex-wrap">
          <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Partnering Institutes:</span>
          <span>Harvard University</span>
          <span>•</span>
          <span>Oxford University</span>
          <span>•</span>
          <span>MIT</span>
          <span>•</span>
          <span>University of Toronto</span>
          <span>•</span>
          <span>University of Melbourne</span>
          <span>•</span>
          <span>TU Munich</span>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-28 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Text description */}
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold block">Who We Are</span>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">About AYD</h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                AYD Education Consultancy is a premier global education advisory firm dedicated to transforming students' academic dreams into reality. With over a decade of experience, we've guided thousands of students to top universities across 50+ countries.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our team of certified counselors, visa experts, and scholarship advisors work tirelessly to ensure every student receives personalized guidance. From initial consultation to post-arrival support, AYD is your trusted companion on the journey to international education.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <p className="text-xl font-bold text-amber-400">12+ Years</p>
                  <p className="text-xs text-gray-500 mt-1">Professional Advisory</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <p className="text-xl font-bold text-amber-400">200+ Partners</p>
                  <p className="text-xs text-gray-500 mt-1">Global Institutions</p>
                </div>
              </div>
            </div>

            {/* Quality Cards */}
            <div className="space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base">Our Mission</h4>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    To democratize access to world-class education by providing affordable, transparent, and expert guidance to every aspiring student.
                  </p>
                </div>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base">Transparency Guaranteed</h4>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    Zero hidden costs. Complete data security backed by durable cloud data systems.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-28 bg-slate-900/50 border-y border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold block">Advisory Services</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Our Signature Solutions</h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Comprehensive end-to-end guidance tailored precisely to secure study goals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Admission Guidance</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Step-by-step guidance for forms, custom Statement of Purpose templates, and interview practice.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Scholarships</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Identify and secure full or partial funding solutions from top global institutions.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Plane className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Visa Processing</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Verified review checklists and mock interviews to maintain our 98% success rate.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Study Roadmaps</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Career-aligned pathways, specific course selections, and post-study settlement advice.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Admissions Timeline Journey */}
      <section id="admissions" className="py-20 lg:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-bold block">Timeline</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Your Admission Journey</h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              We convert complex international application processes into straightforward milestones.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto pl-6 sm:pl-0">
            {/* Timeline center line */}
            <div className="absolute left-1 sm:left-1/2 top-0 bottom-0 w-[2px] bg-slate-800"></div>

            <div className="space-y-10">
              
              {/* Step 1 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
                <div className="absolute -left-6 sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-4 border-slate-950 z-10"></div>
                <div className="sm:w-1/2 sm:pr-8 sm:text-right">
                  <h4 className="font-bold text-white text-sm">Step 1: Free Consultation</h4>
                  <p className="text-gray-400 text-xs mt-1">Review profiles, matching countries, budgets, and entry criteria.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
                <div className="absolute -left-6 sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-4 border-slate-950 z-10"></div>
                <div className="sm:w-1/2 sm:pl-8 sm:ml-auto">
                  <h4 className="font-bold text-white text-sm">Step 2: University Selection</h4>
                  <p className="text-gray-400 text-xs mt-1">Establish 3 to 5 matching universities based on budget and goals.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
                <div className="absolute -left-6 sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-4 border-slate-950 z-10"></div>
                <div className="sm:w-1/2 sm:pr-8 sm:text-right">
                  <h4 className="font-bold text-white text-sm">Step 3: Document Validation</h4>
                  <p className="text-gray-400 text-xs mt-1">Statement of Purpose draft auditing and transcript reviews.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
                <div className="absolute -left-6 sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-4 border-slate-950 z-10"></div>
                <div className="sm:w-1/2 sm:pl-8 sm:ml-auto">
                  <h4 className="font-bold text-white text-sm">Step 4: Submission & Visa</h4>
                  <p className="text-gray-400 text-xs mt-1">Official submission tracking and visa interview preparation.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Scholarships Section */}
      <section id="scholarships" className="py-20 lg:py-28 bg-slate-905 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-green-400 font-bold block">Scholarships</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Fund Your Ambition</h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Access thousands of scholarship categories worth millions in funding.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <span className="text-3xl">🏆</span>
              <h4 className="font-bold text-white text-sm">Merit-Based</h4>
              <p className="text-gray-400 text-xs">For students showing top academic or standardized scores.</p>
              <p className="text-amber-400 font-bold text-sm">Up to 100% Tuition</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <span className="text-3xl">🤝</span>
              <h4 className="font-bold text-white text-sm">Financial Need</h4>
              <p className="text-gray-400 text-xs">Grants assisting highly qualified profiles with financial limits.</p>
              <p className="text-amber-400 font-bold text-sm">Up to $60,000</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <span className="text-3xl">🌍</span>
              <h4 className="font-bold text-white text-sm">Country Specific</h4>
              <p className="text-gray-400 text-xs">Scholarships dedicated specifically to selected nationalities.</p>
              <p className="text-amber-400 font-bold text-sm">Up to $50,000</p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-r from-green-950/20 to-slate-900 border border-green-500/20 text-center space-y-4">
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">$2.5 Million+ Secured in Scholarships</h4>
            <p className="text-gray-400 text-xs max-w-lg mx-auto">
              Our professional matching guidance yields a 73% success rate in obtaining funding. Check your eligibility.
            </p>
            <a
              href="#enquiry"
              className="inline-block px-6 py-2.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 hover:opacity-90 transition cursor-pointer"
            >
              Verify Eligibility
            </a>
          </div>

        </div>
      </section>

      {/* Visa Success Rates Section */}
      <section id="visa" className="py-20 lg:py-28 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-bold block">Success Rates</span>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Streamlined Visa Process</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                AYD's visa counselors audit financial statements, compile sponsors documents, and host rigorous simulated interview sessions to guarantee student visa success.
              </p>
              <div className="space-y-3.5 pt-4">
                <div className="flex gap-3 text-xs text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Comprehensive Sponsors Proof reviews</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Real-time tracking of submission times</span>
                </div>
              </div>
            </div>

            {/* Success rates chart */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-2 uppercase tracking-wide text-gray-400">Visa Success Statistics</h4>
              <div className="space-y-4">
                {visaSuccessRates.map((rate, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{rate.country}</span>
                      <span className="text-green-400">{rate.rate}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-green-400 rounded-full"
                        style={{ width: `${rate.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Study Plans Section */}
      <section id="study-plans" className="py-20 lg:py-28 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-orange-400 font-bold block">Academic Tracks</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Find Your Ideal Course</h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Customized academic roadmaps built to ensure global job relevance.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center flex-wrap gap-2 mb-10">
            {(['undergraduate', 'postgraduate', 'phd', 'diploma'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStudyTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
                  studyTab === tab 
                    ? 'bg-amber-400 text-slate-950' 
                    : 'bg-slate-900 hover:bg-slate-850 text-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab lists */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyTab === 'undergraduate' && (
              <>
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-2xl block mb-2">💻</span>
                  <h4 className="font-bold text-white text-sm mb-1">Computer Science & AI</h4>
                  <p className="text-gray-400 text-xs mb-3">Software engineering, Cybersecurity, Data Analytics.</p>
                  <p className="text-amber-400 text-[10px] uppercase font-bold">Duration: 3-4 years</p>
                </div>
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-2xl block mb-2">💼</span>
                  <h4 className="font-bold text-white text-sm mb-1">Business Administration</h4>
                  <p className="text-gray-400 text-xs mb-3">Global Finance, Marketing, Supply Chain logistics.</p>
                  <p className="text-amber-400 text-[10px] uppercase font-bold">Duration: 3-4 years</p>
                </div>
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-2xl block mb-2">🏗️</span>
                  <h4 className="font-bold text-white text-sm mb-1">Mechanical Engineering</h4>
                  <p className="text-gray-400 text-xs mb-3">Aerospace engineering, Robotics, Clean energy systems.</p>
                  <p className="text-amber-400 text-[10px] uppercase font-bold">Duration: 4 years</p>
                </div>
              </>
            )}
            {studyTab === 'postgraduate' && (
              <>
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-2xl block mb-2">📊</span>
                  <h4 className="font-bold text-white text-sm mb-1">Global Executive MBA</h4>
                  <p className="text-gray-400 text-xs mb-3">Leadership, Venture capitalist logic, strategic management.</p>
                  <p className="text-amber-400 text-[10px] uppercase font-bold">Duration: 1-2 years</p>
                </div>
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-2xl block mb-2">🧬</span>
                  <h4 className="font-bold text-white text-sm mb-1">M.Sc Biotechnology</h4>
                  <p className="text-gray-400 text-xs mb-3">Biomedical research, vaccine synthesis, drug designs.</p>
                  <p className="text-amber-400 text-[10px] uppercase font-bold">Duration: 2 years</p>
                </div>
              </>
            )}
            {studyTab === 'phd' && (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-2xl block mb-2">🔬</span>
                <h4 className="font-bold text-white text-sm mb-1">Quantum Computing Research</h4>
                <p className="text-gray-400 text-xs mb-3">Fully funded PhD posts researching qubit coherence.</p>
                <p className="text-amber-400 text-[10px] uppercase font-bold">Duration: 3-5 years</p>
              </div>
            )}
            {studyTab === 'diploma' && (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-2xl block mb-2">✈️</span>
                <h4 className="font-bold text-white text-sm mb-1">Aviation Tech Diploma</h4>
                <p className="text-gray-400 text-xs mb-3">Aircraft maintenance technician certifications.</p>
                <p className="text-amber-400 text-[10px] uppercase font-bold">Duration: 2 years</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-pink-400 font-bold block">Reviews</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Student Success Stories</h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Real opinions from students who obtained their visas with AYD.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <p className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</p>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                "AYD made my dream of studying at Oxford a reality. Their SOP writing template and visa counseling were exceptional. I received a full scholarship!"
              </p>
              <p className="text-xs font-bold text-white">Sarah Ahmed, Oxford University</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <p className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</p>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                "From zero knowledge about Canadian visa permits to receiving my study visa in 3 weeks. AYD's advisors are incredibly fast and efficient."
              </p>
              <p className="text-xs font-bold text-white">Rahul Kumar, University of Toronto</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <p className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</p>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                "I obtained a 75% scholarship at MIT thanks to AYD guidance. They knew exactly how to format my statement of purpose."
              </p>
              <p className="text-xs font-bold text-white">Li Wei, Massachusetts Institute of Tech</p>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section Accordion */}
      <section className="py-20 lg:py-28 bg-slate-900/20 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold block">FAQs</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white text-sm sm:text-base hover:bg-slate-850/50 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4.5 h-4.5 text-gray-500 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 pt-1 text-gray-400 text-xs sm:text-sm leading-relaxed border-t border-slate-850/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Enquiry Form & Google Pay Payout Section */}
      <section id="enquiry" className="py-20 lg:py-28 bg-slate-900/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left description */}
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold block">Submit Case</span>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Get Your Free Study Plan</h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Fill out our secure admissions form below. An AYD consultancy counselor will respond with university suggestions, scholarship chances, and study visa steps within 24 hours.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-3 text-xs text-gray-300">
                  <CheckCircle className="w-4.5 h-4.5 text-green-400 flex-shrink-0" />
                  <span>Free Initial counseling matching session</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-300">
                  <CheckCircle className="w-4.5 h-4.5 text-green-400 flex-shrink-0" />
                  <span>Personalized 3-tier university shortlists</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-300">
                  <CheckCircle className="w-4.5 h-4.5 text-green-400 flex-shrink-0" />
                  <span>Eligibility review for full scholarships</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 bg-slate-950 border border-slate-850 rounded-3xl shadow-2xl relative">
              
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <h4 className="font-serif text-lg font-bold text-white mb-2">Submit Student Enquiry</h4>
                
                {submitResult === 'success' && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs leading-relaxed">
                    ✓ Your admissions enquiry has been logged successfully to Firestore! Our counselor will respond via email within 24 hours.
                  </div>
                )}
                {submitResult === 'error' && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
                    Submission error. Please ensure your fields are correctly formatted.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                      placeholder="+1 (234) 567"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Preferred Destination</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                    >
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Australia</option>
                      <option>Germany</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Course Level</label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                    >
                      <option>Undergraduate</option>
                      <option>Postgraduate</option>
                      <option>PhD</option>
                      <option>Diploma</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Academic Summary / Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-20 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400 resize-none"
                    placeholder="Describe your current CGPA, budget, and specific goals..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 hover:opacity-90 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit Free Admissions Enquiry'
                  )}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-gray-600 text-[10px] font-bold uppercase tracking-widest">Or Pay Application Fee</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                {/* Simulated Google Pay Button */}
                <button
                  type="button"
                  onClick={handleGooglePayClick}
                  disabled={googlePayActive}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl bg-black hover:bg-slate-900 border border-slate-800 transition text-white font-semibold text-xs cursor-pointer gap-2 disabled:opacity-60"
                >
                  {googlePayActive ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Paying with Google Pay...
                    </>
                  ) : (
                    <>
                      <img
                        src="https://www.gstatic.com/images/wallet/google-pay-logo-with-text-dark.svg"
                        alt="Google Pay"
                        className="h-5"
                      />
                      <span>(Pay $150 Counseling Fee)</span>
                    </>
                  )}
                </button>
              </form>

            </div>

          </div>
        </div>
      </section>

      {/* Contact Details Info */}
      <section id="contact" className="py-20 lg:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold block">Contact Us</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white">Get In Touch</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-850 text-center space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Email Us</h4>
              <p className="text-gray-400 text-xs">info@ayd.edu</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-850 text-center space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Call Us</h4>
              <p className="text-gray-400 text-xs">+1 (800) 123-4567</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-850 text-center space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Visit Us</h4>
              <p className="text-gray-400 text-xs">123 Education Ave, Suite 500</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-850 text-center space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Office Hours</h4>
              <p className="text-gray-400 text-xs">Mon - Sat: 9AM - 7PM</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-600 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center">
              <span className="font-serif font-bold text-slate-900 text-sm">A</span>
            </div>
            <span className="font-serif font-bold text-sm text-white">AYD Education Consultancy</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            Your trusted global partner in secure admissions and study visa processing. Helping students transform aspirations into achievements since 2012.
          </p>
          <p className="pt-4 border-t border-slate-900">
            © 2026 AYD Education Consultancy. All rights reserved. Registered under global educational advisor directories.
          </p>
        </div>
      </footer>

    </div>
  );
}
