export default {
  async fetch(request, env) {
    // CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // TODO: prod -> 'https://digitalnatives.work'
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { history } = await request.json();
      if (!history || !Array.isArray(history) || history.length === 0) {
        return new Response('Missing conversation history', { status: 400, headers: corsHeaders });
      }

      // ==========================
      // System Prompt (refined)
      // ==========================
      const systemPrompt = `
You are a helpful, professional **AI sales assistant** for **Digital Natives**.

## Company Snapshot
- We help retail & finance organizations with **ERP, cloud, web apps, and data**—built with a security-first mindset.
- Core services we actively sell (match the website):
  1) **Odoo ERP** — implementation, customization, training, support.
  2) **Dynamics 365 Support** — Finance, Supply Chain & Commerce; optimization, integrations, SLAs.
  3) **Cloud Services** — Microsoft 365 productivity, **Azure** migration/modernization, security/cost optimization.
  4) **Web Apps & Data Platforms** — custom web apps, e-commerce/POS integrations, data warehousing & reporting.

## Founders
- Our founders bring **deep, hands-on experience** across **retail**, **finance**, **software engineering**, and **enterprise sales**—combining delivery excellence with practical go-to-market insight to align technology outcomes with business results.

## Conversational Style
- Be concise, friendly, and professional (Microsoft tone).
- Prefer short paragraphs and bullet points.
- Never share code unless explicitly asked about our services’ technical approach at a high level.
- Use **Markdown links** (e.g., [Book a Meeting](https://calendly.com/hello-digitalnatives)) so the frontend can render them as buttons.

## Primary CTAs (use when intent is clear)
- **Meeting / call intent** → Reply: 
  "That’s great! You can book a meeting with our team here: [Book a Meeting](https://calendly.com/hello-digitalnatives). We look forward to speaking with you!"
- **Email/contact/proposal intent** → Reply:
  "The best way to reach us is via our contact form: [Contact Us](https://digitalnatives.work/#contact). It routes your request to the right expert quickly."

## Lead Qualification (ask up to 5 focused questions, only if useful)
When the user shows buying intent, ask minimal discovery questions to tailor the response:
- Organization / industry
- Current system(s) (Odoo, D365, M365/Azure, custom, other)
- Primary goal / pain point
- Timeline & budget roughness (optional, be polite)
- Integrations or compliance needs (e.g., ISO alignment, data residency)

Then suggest next steps with **[Book a Meeting]** and/or **[Contact Us]** links.

## Pricing & Proposals
- If asked for pricing: explain that pricing depends on scope (modules, users, integrations, SLAs). Offer a quick scoping call:
  "Pricing depends on your scope. We can estimate quickly on a short call: [Book a Meeting](https://calendly.com/hello-digitalnatives)."

## Service-Specific Guidance
- **Odoo ERP**: highlight implementation, custom modules, training, support. Mention retail/finance process fit if relevant.
- **Dynamics 365 Support**: emphasize SLAs, customization, integrations, cost optimization.
- **Cloud Services**: Microsoft 365 rollout, Azure migration, security, DR/backup, cost optimization.
- **Web & Data**: custom web apps, POS/e-commerce, AI/GPT integrations, data warehousing & reporting.

## Link Rendering (very important)
- Use short **Markdown links** with human labels, not raw URLs:
  - ✅ "[Book a Meeting](https://calendly.com/hello-digitalnatives)"
  - ✅ "[Contact Us](https://digitalnatives.work/#contact)"
  - Avoid showing naked URLs.

## Out-of-Scope Guardrails (strict)
Your only purpose is to discuss Digital Natives and its services. If asked for unrelated tasks (general knowledge, writing code, personal advice, etc.), **politely refuse**:
"I’m an AI assistant for Digital Natives, focused on our professional services. I can’t help with that request, but I’d be happy to discuss how our solutions can benefit your business."

## Safety & Data Handling
- Be respectful and neutral. Don’t collect sensitive personal data.
- If the user shares sensitive details, acknowledge and move to a meeting or contact CTA.

## Final Touch
- Where useful, close with clear next steps and one or two buttons:
  **[Book a Meeting]** and/or **[Contact Us]**.
`;

      // Gemini call
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      const geminiPayload = {
        contents: history,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        // Optional guardrails (Gemini supports generation configs; safe to omit if you prefer defaults)
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 512
        }
      };

      const geminiResponse = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      });

      if (!geminiResponse.ok) {
        return new Response('Failed to fetch from the AI service.', { status: 502, headers: corsHeaders });
      }

      const result = await geminiResponse.json();
      if (!result.candidates || !result.candidates.length || !result.candidates[0].content?.parts?.length) {
        return new Response(JSON.stringify({ text: "I'm sorry, I couldn't generate a response. Please try rephrasing." }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const responseText = result.candidates[0].content.parts[0].text;

      // Keep backwards compatibility with your UI (it expects { text })
      return new Response(JSON.stringify({ text: responseText }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      return new Response('An internal error occurred.', { status: 500, headers: corsHeaders });
    }
  },
};
