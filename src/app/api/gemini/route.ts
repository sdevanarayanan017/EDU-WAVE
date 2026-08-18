import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SubdivideRequest {
  type: 'subdivide_task';
  title: string;
  topic: string;
  description: string;
  dueDate: string;
  estimatedHours: number;
}

interface CollisionAnalyzeRequest {
  type: 'analyze_collision';
  classId: string;
  className: string;
  proposedDate: string;
  title: string;
  subject: string;
  existingAssignments: { title: string; subject: string; dueDate: string }[];
}

interface SocraticTutorRequest {
  type: 'socratic_tutor';
  studentQuery: string;
  activeSubject: string;
  assignmentContext?: {
    title: string;
    topicTag: string;
    description: string;
    keyConcepts?: string[];
    teacherNotes?: string;
  };
  chatHistory?: { role: 'user' | 'model'; parts: string }[];
}

type GeminiApiPayload = SubdivideRequest | CollisionAnalyzeRequest | SocraticTutorRequest;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GeminiApiPayload;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

    // If API key is available, attempt real Gemini call
    if (apiKey && !apiKey.includes('placeholder')) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        if (body.type === 'subdivide_task') {
          const prompt = `You are an expert academic curriculum and cognitive load specialist in EduWeave.
Break down the following student assignment into 3 to 4 sequential, digestible daily milestones leading up to the due date (${body.dueDate}).
Assignment Title: "${body.title}"
Topic: "${body.topic}"
Description: "${body.description}"
Estimated Total Effort: ${body.estimatedHours} hours.

Return a strictly valid JSON array of objects with the exact structure:
[
  {
    "step_number": 1,
    "title": "Actionable milestone title",
    "days_before_due": 2,
    "effort_fraction": 0.3
  }
]
Do NOT include markdown code blocks or backticks, just raw JSON.`;

          const result = await model.generateContent(prompt);
          const text = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(text);

          // Calculate dates for subtasks
          const due = new Date(body.dueDate);
          const formattedSubtasks = parsed.map((item: any, idx: number) => {
            const taskDate = new Date(due);
            taskDate.setDate(due.getDate() - (item.days_before_due || (parsed.length - idx)));
            return {
              step_number: item.step_number || idx + 1,
              title: item.title,
              due_date: taskDate.toISOString().split('T')[0],
              completed: false,
            };
          });

          return NextResponse.json({ success: true, subtasks: formattedSubtasks, source: 'gemini-api' });
        }

        if (body.type === 'analyze_collision') {
          const prompt = `You are an academic scheduling and student burnout prevention AI for EduWeave.
A teacher is scheduling a new assignment for ${body.className} (${body.subject}) titled "${body.title}" on ${body.proposedDate}.
Existing scheduled assignments for this class:
${JSON.stringify(body.existingAssignments, null, 2)}

Provide workload collision feedback and recommend optimal distribution dates.
Return strictly valid JSON with format:
{
  "collision_risk": "low" | "medium" | "high",
  "analysis": "Short 2-sentence explanation of cognitive load collision",
  "suggested_optimal_dates": ["YYYY-MM-DD", "YYYY-MM-DD"],
  "burnout_mitigation_tip": "Proactive advice for the teacher"
}
Do NOT include markdown formatting.`;

          const result = await model.generateContent(prompt);
          const text = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(text);
          return NextResponse.json({ success: true, analysis: parsed, source: 'gemini-api' });
        }

        if (body.type === 'socratic_tutor') {
          const systemInstruction = `You are the EduWeave Socratic Academic Assistant.
Your core mission is to promote deep conceptual mastery and prevent student academic anxiety.
CRITICAL SOCRATIC GUARDRAIL:
- NEVER write complete solutions, full essay paragraphs, or direct answers to homework problems.
- INSTEAD: Guide the student by asking reflective questions, explaining underlying bio/math/physics/history concepts, breaking problems into smaller intuitive steps, and giving comparable toy examples.
- Active Subject: ${body.activeSubject}
${body.assignmentContext ? `Assignment: ${body.assignmentContext.title} (${body.assignmentContext.topicTag})
Description: ${body.assignmentContext.description}
Key Concepts: ${body.assignmentContext.keyConcepts?.join(', ') || 'N/A'}
Teacher Notes: ${body.assignmentContext.teacherNotes || 'N/A'}` : ''}`;

          const prompt = `${systemInstruction}\n\nStudent Query: "${body.studentQuery}"\n\nProvide an engaging, supportive, Socratic response with clear formatting, bullet points or step hints where appropriate.`;
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          return NextResponse.json({ success: true, response: responseText, source: 'gemini-api' });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to built-in academic simulator:', geminiError?.message);
      }
    }

    // Fallback Academic Simulator (Instant, reliable, intelligent)
    return handleSimulatedResponse(body);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}

function handleSimulatedResponse(body: GeminiApiPayload) {
  if (body.type === 'subdivide_task') {
    const due = new Date(body.dueDate);
    const subtasks = [
      {
        step_number: 1,
        title: `Review core ${body.topic || 'syllabus'} concepts and formulate thesis/hypothesis`,
        due_date: new Date(due.getTime() - 3 * 86400000).toISOString().split('T')[0],
        completed: false,
      },
      {
        step_number: 2,
        title: `Draft methodology, calculations, or primary evidence outline`,
        due_date: new Date(due.getTime() - 2 * 86400000).toISOString().split('T')[0],
        completed: false,
      },
      {
        step_number: 3,
        title: `Synthesize findings, discussion, and error analysis`,
        due_date: new Date(due.getTime() - 1 * 86400000).toISOString().split('T')[0],
        completed: false,
      },
      {
        step_number: 4,
        title: `Final proofreading, bibliography formatting & portal submission`,
        due_date: body.dueDate,
        completed: false,
      },
    ];

    return NextResponse.json({ success: true, subtasks, source: 'eduweave-academic-simulator' });
  }

  if (body.type === 'analyze_collision') {
    const collisions = body.existingAssignments.filter(a => a.dueDate === body.proposedDate);
    const isHigh = collisions.length >= 2;
    const isMed = collisions.length === 1;

    const baseDate = new Date(body.proposedDate);
    const alt1 = new Date(baseDate.getTime() + 2 * 86400000).toISOString().split('T')[0];
    const alt2 = new Date(baseDate.getTime() + 3 * 86400000).toISOString().split('T')[0];

    return NextResponse.json({
      success: true,
      analysis: {
        collision_risk: isHigh ? 'high' : isMed ? 'medium' : 'low',
        analysis: isHigh
          ? `High collision risk detected: ${collisions.length} other subject deadlines already coincide on this day (${collisions.map(c => c.subject).join(', ')}). Students will experience peak stress clustering.`
          : isMed
          ? `Moderate workload detected: 1 other assignment in ${collisions[0]?.subject} is scheduled for this date.`
          : `Optimal scheduling slot. Class workload is balanced with minimal cross-subject friction.`,
        suggested_optimal_dates: [alt1, alt2],
        burnout_mitigation_tip: `Providing milestone subtasks 48 hours in advance will decrease perceived cognitive stress by up to 40%.`,
      },
      source: 'eduweave-academic-simulator',
    });
  }

  if (body.type === 'socratic_tutor') {
    const queryLower = body.studentQuery.toLowerCase();
    let response = '';

    if (queryLower.includes('calvin') || queryLower.includes('light') || queryLower.includes('photosynthesis')) {
      response = `Great question on **Bioenergetics & Photosynthesis**! 🌿\n\nLet's break this down into first principles:\n\n1. **Light-Dependent Phase (Thylakoid Membrane)**:\n   - Photon excitation in Photosystem II splits water ($H_2O \\rightarrow 2H^+ + \\frac{1}{2}O_2 + 2e^-$).\n   - What energy-carrying molecules are synthesized across the proton gradient here? *(Hint: Look at ATP Synthase and NADPH in your Unit 3.2 notes!)*\n\n2. **Calvin Cycle (Stroma)**:\n   - This phase does not require direct photons, but it **requires** the chemical products of the light phase to fix $CO_2$ with RuBisCO.\n\n💡 **Guiding Question for Your Lab Report**:\n*If you shut off light exposure, why does the Calvin cycle stop running after just a few moments even if $CO_2$ is abundant?*\n\nTry reasoning through what runs out first, and let me know your thoughts!`;
    } else if (queryLower.includes('matrix') || queryLower.includes('determinant') || queryLower.includes('vector')) {
      response = `Let's look at **Matrix Transformations & Geometric Meaning**! 📐\n\n- Think of a 2×2 matrix as telling us where the basis vectors $\\hat{i} = [1, 0]^T$ and $\\hat{j} = [0, 1]^T$ land after the transformation.\n- The **Determinant $\\det(A)$** measures the factor by which areas scale.\n\n🤔 **Socratic Check**:\nIf $\\det(A) = 0$, what does that imply geometrically about the 2D plane? Does it collapse into a line or a point? And why can't you invert such a matrix?`;
    } else if (queryLower.includes('study plan') || queryLower.includes('test') || queryLower.includes('burnout')) {
      response = `Let's build a **Low-Stress Spaced Study Plan** based on your diagnostic profile! ⏱️\n\n- **Phase 1 (Day 1-2)**: Active recall on fundamental definitions and diagrams (25 min focus sprints).\n- **Phase 2 (Day 3)**: Work through 3 medium-difficulty practice questions without looking at notes.\n- **Phase 3 (Day 4)**: Teach the hardest concept (e.g. Calvin Cycle or Determinants) aloud to verify no conceptual blindspots.\n\nWould you like me to generate 3 diagnostic practice questions right now to test your baseline?`;
    } else {
      response = `Hello! I am your **EduWeave Socratic Tutor** for **${body.activeSubject}**.\n\nI can help you explore concepts from **${body.assignmentContext?.title || 'your syllabus'}**, clarify difficult terminology, or guide you through your assignment sub-tasks step-by-step.\n\nTo get started, tell me: which specific concept or step would you like to explore together?`;
    }

    return NextResponse.json({
      success: true,
      response,
      source: 'eduweave-academic-simulator',
    });
  }

  return NextResponse.json({ success: false, error: 'Unknown request type' }, { status: 400 });
}
