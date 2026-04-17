const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// CORS flexible for testing (allows localhost + any Render/Vercel URLs)
app.use(cors({
  origin: 'https://greenserviceoulx.it',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Root route to confirm backend is alive
app.get('/', (req, res) => {
  res.send('✅ Backend Green Service attivo!');
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('📨 POST /contact ricevuto');
  console.log(req.body);

  const { name, email, phone, message } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      // FIXED: Use simple format for Resend TEST (avoids domain verification issues)
      from: 'Green Service <onboarding@resend.dev>',
      to: ['greenservicesoc@gmail.com'],
      subject: `Nuovo messaggio da ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
          <h2 style="color: #2c3e50;">📩 Nuovo messaggio dal sito Green Service</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Telefono:</strong> ${phone}</p>
          <p><strong>Messaggio:</strong></p>
          <div style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #2c3e50;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(500).json({ message: 'Errore nell\'invio del messaggio.' });
    }

    res.status(200).json({ message: 'Messaggio inviato ✅' });
  } catch (err) {
    console.error('❌ Catch error:', err);
    res.status(500).json({ message: 'Errore interno del server.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
