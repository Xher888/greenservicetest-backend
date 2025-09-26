const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS para permitir solicitudes desde Vercel
app.use(cors({
  origin: 'https://greenservicetest-frontend.vercel.app' 
}));

// Middleware para interpretar JSON
app.use(express.json());

// Middleware para formularios tradicionales
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/contact', (req, res) => {
  console.log(req.body); // para debuggear

  const { name, email, phone, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
  from: email,
  to: process.env.EMAIL_USER,
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
};

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Invio non riuscito');
    }
    res.status(200).json({ message: 'Messaggio inviato' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
