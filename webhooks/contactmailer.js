// This is the code for your Cloudflare Worker

export default {
  async fetch(request, env) {
    // This handles the OPTIONS request that browsers send first for security.
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*', // IMPORTANT: For production, replace '*' with your website's domain
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // We only want to handle POST requests
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { name, email, message } = await request.json();

      const emailPayload = {
        to: 'hello@digitalnatives.work', // Your personal email where you want to receive messages
        from: 'Contact Form <noreply@digitalnatives.work>', // A "from" address using your verified domain in Resend
        subject: `New Message from ${name} via Digital Natives Website`,
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      };

      // Send the email using the Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`, // Uses the secret API key
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to send email.');
      }

      // Return a success response to your website
      return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Replace with your domain in production
        },
      });

    } catch (e) {
      return new Response('An error occurred.', { status: 500 });
    }
  },
};