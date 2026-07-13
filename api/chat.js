// /api/chat.js
// Vercel Serverless Function — free tier.
// Calls Groq's free LLM API with the resume "stuffed" into the system prompt.
// No vector DB / LangChain needed: the whole knowledge base is one page of text.

const RESUME_CONTEXT = `
You are the AI assistant embedded in Navaneeth N Nair's personal portfolio website.
Answer visitor questions ONLY using the facts below. Be concise, friendly, and speak
in third person about Navaneeth (e.g. "He has 4+ years of experience..."). If asked
something not covered by this information, say you don't have that detail and suggest
the visitor reach out directly via email. Do not invent facts, dates, or numbers.

NAME: Navaneeth N Nair
ROLE: MERN Stack / Node.js Developer
LOCATION: Calicut, Kerala, India
EMAIL: navneethnnair220@gmail.com
PHONE: +91-8330804033
LINKEDIN: https://www.linkedin.com/in/navaneeth-nodejs-developer/

SUMMARY:
Motivated, teamwork-oriented, meticulous Node.js Developer with 4+ years of
experience across the full software development life cycle, from system design and
architecture through deployment and production support. Skilled in designing scalable
REST APIs and monolithic/microservice architectures for distributed backend systems,
using Kafka and RabbitMQ for event-driven/asynchronous processing, WebSockets for
real-time communication, and Kubernetes for containerized deployment. Proficient in
NestJS, ExpressJS, MySQL, MongoDB, Firebase, AWS, ReactJS, JavaScript, TypeScript,
Python, data structures, and database design. Experienced in mentoring team members
through pull request reviews and code quality feedback. Strong understanding of
cybersecurity, with hands-on experience in web application penetration testing,
vulnerability assessment, and securing backend systems against the OWASP Top 10.

KEY SKILLS:
JavaScript, TypeScript, Node.js, NestJS, System Design, Design Patterns, Distributed
Systems (Microservices), Scalability, Kafka, RabbitMQ, WebSockets, Kubernetes (K8s),
Event-Driven Architecture, Message Queues, MySQL, ORM, OWASP, Cybersecurity, JWT,
Microservices, MongoDB, AWS, AWS Lambda, HTML/CSS, ReactJS, REST API, Express.js,
Database Management/Design, CI/CD, Load Balancing, Code Review, Production Support.

PROFESSIONAL EXPERIENCE:

1) Nodejs Developer — BEO Software — May 2025 to Jan 2026
- Built a RESTful API using Node.js and Express.js to manage job postings, user
  authentication, and portal analytics.
- Integrated Azure Blob Storage for secure upload/storage of resumes and job-related
  documents (PDF/DOC/DOCX).
- Used Sequelize ORM with MSSQL for complex relational data models (jobs, users,
  portals, chats).
- Designed and secured API endpoints with validation, rate limiting, and role-based
  access control.
- Implemented AI prompting to extract structured content from PDFs, streaming results
  through Kafka to power an event-driven job-matching and classification pipeline.
- Built real-time chat between users and portals using WebSockets; containerized and
  deployed backend services on Kubernetes.
- Built integration workflows to auto-publish job posts across multiple platforms.
- Reviewed pull requests and mentored teammates and interns.
- Tools: JavaScript, GitHub, Express.js, ReactJs, NextJS, MSSQL, OpenAI, Claude.ai,
  MongoDB, Kafka, WebSockets, Kubernetes.

2) Nodejs FullStack Developer — NewAgeSys Solutions — March 2022 to May 2025
- Owned end-to-end architecture decisions for client projects: monolith vs.
  microservice structure, tech stack, database selection, auth strategy, third-party
  integrations.
- Architected and load-tested backend systems to reliably handle 1,000+
  requests/minute during beta production rollout; implemented load balancing,
  IP-based rate limiting, caching, and SSR.
- Integrated RabbitMQ for asynchronous background job processing.
- Built real-time chat with WebSockets; containerized and deployed on Kubernetes.
- Pioneered African payment integration using Paystack across multiple country
  launches, increasing client productivity by 25%.
- Implemented unit testing protocols that decreased bug occurrence by 50%.
- Enhanced application security protocols, reducing vulnerability exposure by 60%.
- Delivered 7+ client projects, including whipflip.com, a car bidding platform.
- Tools: JavaScript, TypeScript, GitHub, Mongoose, Firebase, NestJS, MySQL, React JS,
  Next JS, RabbitMQ, WebSockets, Kubernetes.

3) Nodejs FullStack Developer — SOXO — April 2021 to December 2021
- Worked extensively with NestJS, ExpressJS, ReactJS, Firebase Functions and cloud
  services.
- Developed a custom management web application using ReactJS and Node.js (Firebase
  Functions).
- Optimized backend APIs, reducing server response time by 40% and improving user
  experience by 25%.
- Tools: JavaScript, TypeScript, GitHub, Mongoose, Firebase, NestJS, MySQL, React JS,
  Next JS.

EDUCATION:
B.Sc. Computer Science — College of Applied Science, Kerala, India (06/2017 - 03/2020)

CERTIFICATIONS:
- Vulnerability Assessment and Penetration Testing — Wattlecorp Cyber Security Lab
- Certified Penetration Testing — Red Team Hacking Academy
- Certified Ethical Hacker (CEH) — EC-Council (currently appearing/in progress)
- MERN Stack — Udemy
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing "message" in request body' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server is not configured with GROQ_API_KEY' });
    }

    // Keep only the last few turns to control token usage
    const trimmedHistory = Array.isArray(history) ? history.slice(-6) : [];

    const messages = [
      { role: 'system', content: RESUME_CONTEXT },
      ...trimmedHistory,
      { role: 'user', content: message },
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // free, fast Groq model
        messages,
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', errText);
      return res.status(502).json({ error: 'Upstream LLM request failed' });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat function error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
