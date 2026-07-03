import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required but missing.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Heuristic keyword fallback generator to make the AI resilient under API quota limit errors
function generateFallbackResponse(userMessage: string): { text: string; sources: Array<{ title: string; url: string }> } {
  const query = userMessage.toLowerCase();
  let text = '';
  let sources: Array<{ title: string; url: string }> = [
    { title: 'AYD Admission Guide', url: 'https://ai.studio/build' },
    { title: 'QS World University Rankings', url: 'https://www.topuniversities.com/' }
  ];

  if (query.includes('gpa') || query.includes('ielts') || query.includes('match') || query.includes('university') || query.includes('universities') || query.includes('shortlist') || query.includes('admission') || query.includes('oxford') || query.includes('toronto') || query.includes('tum') || query.includes('canada') || query.includes('uk') || query.includes('usa')) {
    text = `### 🎓 Personalized University Matching & Admission Requirements

To maximize your study abroad admission and scholarship potential, our system calculates your eligibility based on two key parameters:

1. **GPA (4.0 Scale)**:
   - **High Match (GPA 3.6 - 4.0)**: High probability of acceptance at top-tier institutions (e.g., University of Oxford, University of Toronto) with strong merit-based scholarship potential.
   - **Competitive Match (GPA 3.2 - 3.5)**: Safe match for high-ranking standard programs. Recommended to reinforce with exceptional Letters of Recommendation (LORs) and a compelling Statement of Purpose (SOP).
   - **Reach Target (GPA 2.8 - 3.1)**: Reach options where additional test scores (GRE/GMAT) or academic portfolios can help bridge the gap.
   
2. **English Proficiency (IELTS Academic)**:
   - **IELTS 7.5+**: Eligible for top-tier research fellowships and teaching assistantships.
   - **IELTS 6.5 - 7.0**: Meets standard admission criteria for 95% of English-speaking graduate/undergraduate programs.
   - **IELTS 6.0**: Eligible for selective programs or conditional admission with preliminary English pathways (ESL).

**🔥 Hot Tip for Cost-Conscious Applicants:**
If your budget is under **$10,000 / year**, we highly recommend considering **Technical University of Munich (TUM) in Germany** (which has €0 tuition for many high-tech programs) or elite public universities in Canada/Australia with robust work-study programs!

*Note: You can use our **Premium University Matcher** tab in the student portal to dynamically filter universities by your GPA, IELTS score, and tuition budget!*`;
  } else if (query.includes('sop') || query.includes('lor') || query.includes('transcript') || query.includes('document') || query.includes('checklist') || query.includes('passport') || query.includes('resume') || query.includes('cv') || query.includes('recommendation')) {
    text = `### 📂 Document Compilation & Submission Checklist

Our global admission officers require six core documents to process your university application:

1. **Academic Transcripts**: Officially translated certificates of your high school, college, or university coursework.
2. **Letters of Recommendation (LORs)**: Usually 2-3 letters from professors or managers vouching for your academic discipline and work ethic.
3. **Statement of Purpose (SOP)**: A personal, 800-1200 word essay detailing your academic trajectory, chosen field, and future contribution to the university campus.
4. **Language Test Results**: Scorecards for IELTS, TOEFL, or Duolingo English Test (DET).
5. **Passport Copy**: High-resolution scan of your passport information page, valid for at least 6 months past your departure date.
6. **Academic Resume/CV**: A structured chronological list of your achievements, internships, and research papers.

**🚀 Document Submission Best Practices:**
- Ensure all scans are in high-quality PDF format, not mobile camera snapshots.
- Tailor your SOP for each university specifically—admission committees instantly recognize generic essays.
- Track your upload status in the **Document Checklist** section in your portal!`;
  } else if (query.includes('schedule') || query.includes('meet') || query.includes('book') || query.includes('consultation') || query.includes('appointment') || query.includes('calendar') || query.includes('call') || query.includes('consult')) {
    text = `### 🗓️ Book a 1-on-1 Consultation with an Admission Expert

We recommend scheduling a video consultation to finalize your university list, review your Statement of Purpose (SOP), or plan your student visa roadmap:

- **What we do during the call**: Review your profile, match specific scholarships, outline the visa success rate, and guide you through document requirements.
- **How to book**: 
  1. Head over to the **Google Calendar & Meet** tab in your Student Portal.
  2. Fill out the "Schedule Google Meet" form with your desired date, time, and specific questions.
  3. Our system will automatically provision a secure **Google Meet video link** and add it to your primary calendar!
- **Mock Demo Option**: If you are exploring the app via a demo credentials login, the calendar tab is fully interactive and will let you experience the automated calendar flow!`;
  } else if (query.includes('progress') || query.includes('stage') || query.includes('status') || query.includes('visa') || query.includes('offer') || query.includes('acceptance') || query.includes('submitted')) {
    text = `### 📊 Real-Time Application Tracking & Visa Roadmap

Your university journey is split into seven clear stages:

1. **Profile & Consultation (Completed)**: Your initial profile evaluation.
2. **University Shortlisting (Completed)**: Pairing credentials with courses.
3. **Document Compilation (Current)**: Refinement of LORs and SOP.
4. **Application Submitted (Pending)**: Dispatch of application to target registry offices.
5. **Offer Letter Processing (Pending)**: Awaiting conditional or unconditional admission letters.
6. **Visa Lodgement (Pending)**: Preparing financial liquid proofs, GTE statements, and medical checks.
7. **Pre-Departure Briefing (Pending)**: Booking student insurance (OSHC), plane tickets, and accommodation.

*You can view your active stage, read custom feedback notes, and track progression milestones in real-time under the **Application Tracker** tab!*`;
  } else if (query.includes('scholarship') || query.includes('fund') || query.includes('cost') || query.includes('fee') || query.includes('grant') || query.includes('money') || query.includes('price') || query.includes('financial')) {
    text = `### 💰 Scholarships, Funding, and Financial Planning

Studying abroad is a major investment, but multiple funding channels can make it affordable:

1. **Merit-Based Scholarships**: Automatically calculated during your application if you have a high GPA (typically 3.7+) and outstanding academic credentials.
2. **Country-Specific Government Grants**: E.g., Commonwealth Scholarships (UK), Fulbright (USA), or DAAD (Germany).
3. **Tuition-Free Options**: Countries like Germany offer tuition-free higher education to international students at world-renowned public universities like TUM (Technical University of Munich). Only small semester contributions (~€150 - €300) are required.
4. **On-Campus Work Permits**: Most student visas (such as in Canada and Australia) allow students to work part-time up to 20-24 hours per week during semesters and full-time during holidays to offset living expenses.

*Our counselors specialize in pairing profiles with high-value scholarships. Schedule a **Google Meet consultation** to do a complete financial assessment!*`;
  } else {
    text = `### 🎓 Welcome to AdmitYards Global (AYD) Support Assistant!

I am your dedicated academic advisor. I can help guide you through the entire study abroad application lifecycle, from shortlisting top global universities to getting your student visa!

**How can I assist you today? You can ask me about:**
- 🏫 **University Shortlisting & GPA/IELTS Eligibility**: "What are the admission requirements for Oxford?" or "Do my scores match Canadian universities?"
- 📂 **Required Application Documents**: "What should I write in my Statement of Purpose (SOP)?" or "How do LORs work?"
- 🗓️ **Scheduling consultations**: "How can I book a Google Meet call to discuss my options?"
- 📊 **Tracking Application Progress**: "What is my current visa or admission stage?"
- 💰 **Scholarships & Financial Aid**: "How can I find tuition-free universities or apply for scholarships?"

**(Note: AI Service is currently operating in local Eco-mode due to high demand, but I have access to all system guides and rules to support you!)*`;
  }

  return { text, sources };
}

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, grounding, systemInstruction } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    // Map user requested models to available SDK models safely
    // Default model is gemini-2.5-flash (or gemini-3.5-flash if that's standard)
    let modelName = 'gemini-2.5-flash';
    if (model === 'pro' || model === 'gemini-3.1-pro-preview') {
      modelName = 'gemini-2.5-pro';
    } else if (model === 'flash-lite' || model === 'gemini-3.1-flash-lite') {
      modelName = 'gemini-2.5-flash'; // fallbacks to reliable 2.5-flash for speed
    } else if (model === 'gemini-3.5-flash') {
      modelName = 'gemini-2.5-flash';
    }

    const ai = getAiClient();

    // Map conversation history to Gemini structure
    const contents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Configure tools if Search Grounding is enabled
    const config: any = {};
    if (grounding) {
      config.tools = [{ googleSearch: {} }];
    }
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: config
      });

      const responseText = response.text || '';
      
      // Extract sources if Search Grounding returned metadata
      let sources: Array<{ title: string; url: string }> = [];
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata && groundingMetadata.groundingChunks) {
        sources = groundingMetadata.groundingChunks
          .filter((chunk: any) => chunk.web?.uri)
          .map((chunk: any) => ({
            title: chunk.web.title || 'Source',
            url: chunk.web.uri
          }));
      }

      res.json({
        text: responseText,
        modelUsed: modelName,
        sources: sources
      });
    } catch (apiError: any) {
      console.warn('Gemini API Error (falling back to intelligent local handler):', apiError);
      
      const lastUserMsg = messages[messages.length - 1]?.text || '';
      const fallbackResult = generateFallbackResponse(lastUserMsg);
      
      res.json({
        text: fallbackResult.text,
        modelUsed: 'local-fallback-model',
        sources: fallbackResult.sources,
        isFallback: true
      });
    }
  } catch (error: any) {
    console.error('Core Chat API Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during generating content' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite Middleware for dev / static serving for production
async function setupViteMiddleware() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteMiddleware().catch((err) => {
  console.error('Failed to start server:', err);
});
