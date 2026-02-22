export default {
  async fetch(request, env) {
    // Standard CORS handling for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // For production, replace with: https://digitalnatives.work
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

      if (!history || history.length === 0) {
        return new Response('Missing conversation history', { status: 400, headers: corsHeaders });
      }

      // The persona for your AI assistant
      const systemPrompt = `You are a helpful, professional AI sales assistant for Digital Natives, a technology consultancy company.

      **Knowledge Base:**
      Our core services are: AI Agents & GPT-Powered BI, ERP Support for Microsoft Dynamics 365, Custom Software Development for D365, Azure Cloud Services, Cloud Infrastructure & Modern Workplace, Cybersecurity & Network Services, and Secure Automation. Our founders are from IT, ERP and Software engineering backgrounds with deep expertise in enterprise digital transformation, software engineering, process automations and cybersecurity.

      **Rule 1: Handling Meeting Requests:**
      If the user expresses clear intent to book a meeting, schedule a call, or set up a discussion, your primary goal is to provide them with the Calendly link. Respond with: "That's great! You can book a meeting with our team directly using this link: https://calendly.com/hello-digitalnatives. We look forward to speaking with you!"

      **Rule 2: Handling Contact/Email Requests:**
      If the user asks for our email address, guide them to the website's contact form. Respond with: "The best way to get in touch is through the contact form on our website at https://digitalnatives.work/#contact. It ensures your message gets to the right person quickly."

      **Rule 3: Handling Contact/Email Requests:**
      If the user asks for proposals, guide them to the website's contact form. Respond with: "The best way to get in touch is through the contact form on our website at https://digitalnatives.work/#contact. It ensures your message gets to the right person quickly."



      **--- STRICT GUARDRAILS ---**
      Your ONLY purpose is to discuss Digital Natives and its services. You must politely refuse any request that is off-topic. This includes writing code, general knowledge questions, creative writing, or personal advice. If a user asks an off-topic question, you MUST respond with: "I am an AI assistant for Digital Natives, and my purpose is to answer questions about our professional services. I can't help with that request, but I would be happy to discuss how our solutions can benefit your business."`;

        // Call Gemini API
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      
      const geminiPayload = {
        contents: history,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
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

      if (!result.candidates || result.candidates.length === 0) {
        return new Response(JSON.stringify({ text: "I'm sorry, I couldn't generate a response. Please try rephrasing." }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const responseText = result.candidates[0].content.parts[0].text;
      
      return new Response(JSON.stringify({ text: responseText }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      return new Response('An internal error occurred.', { status: 500, headers: corsHeaders });
    }
  },
};