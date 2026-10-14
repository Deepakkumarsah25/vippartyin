const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vip_website';

// ------------------------------------
// 1. Database Connection (MongoDB)
// ------------------------------------
let isDbConnected = false;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    isDbConnected = true;
    console.log('✅ MongoDB connected successfully to:', MONGODB_URI);
  })
  .catch((err) => {
    isDbConnected = false;
    console.warn('⚠️  MongoDB connection note (Server is running in standalone mode):', err.message);
  });

// ------------------------------------
// 2. Middlewares & Static File Setup
// ------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from 'public' folder (CSS, JS, Images, Fonts)
app.use(express.static(path.join(__dirname, 'public')));

// Configure View Engine (EJS) and Views Directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Global template variables middleware
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.isDbConnected = isDbConnected;
  res.locals.siteName = 'विकासशील इंसान पार्टी (VIP)';
  next();
});

// ------------------------------------
// 3. Application Routes
// ------------------------------------

// Helper to render pages with consistent active navigation
const renderRoute = (pageTitle, activeNav) => (req, res) => {
  res.render('index', { pageTitle, activeNav });
};

// Home
app.get('/', renderRoute('विकासशील इंसान पार्टी (VIP) – आधिकारिक वेबसाइट', 'home'));

// About VIP Group
app.get('/about', renderRoute('पार्टी के बारे में | विकासशील इंसान पार्टी', 'about'));
app.get('/journey-of-mukesh-sahani', renderRoute('श्री मुकेश सहनी (सन ऑफ मल्लाह) का जीवन संघर्ष | VIP Party', 'journey'));
app.get('/jubba-sahani', renderRoute('अमर शहीद जुब्बा सहनी | जीवन एवं बलिदान | VIP Party', 'jubba'));
app.get('/history', renderRoute('हमारा इतिहास | विकासशील इंसान पार्टी', 'history'));
app.get('/ideology', renderRoute('पार्टी की विचारधारा एवं विज़न | VIP Party', 'ideology'));
app.get('/constitution', renderRoute('संविधान और नियम | विकासशील इंसान पार्टी', 'constitution'));
app.get('/prerna', renderRoute('हमारी प्रेरणा पुंज | VIP Party', 'prerna'));
app.get('/office', renderRoute('केन्द्रीय व प्रदेश कार्यालय | VIP Party', 'office'));
app.get('/leaders', renderRoute('पार्टी नेतृत्व एवं प्रमुख नेता | VIP Party', 'leaders'));

// Organization Group
app.get('/organization', renderRoute('संगठनात्मक संरचना | विकासशील इंसान पार्टी', 'organization'));
app.get('/officials', renderRoute('वीआईपी के राष्ट्रीय पदाधिकारी | VIP Party', 'officials'));
app.get('/president', renderRoute('प्रदेश एवं जिला अध्यक्ष | VIP Party', 'president'));
app.get('/pravakta', renderRoute('आधिकारिक प्रवक्ता | VIP Party', 'pravakta'));
app.get('/youth', renderRoute('युवा वीआईपी मोर्चा | VIP Party', 'youth'));
app.get('/women-wing', renderRoute('वीआईपी महिला मोर्चा | VIP Party', 'women'));

// Legislative Group
app.get('/vidhansabha', renderRoute('बिहार विधानसभा में वीआईपी | VIP Party', 'vidhansabha'));
app.get('/vidhan-parishad', renderRoute('विधान परिषद में वीआईपी | VIP Party', 'parishad'));
app.get('/loksabha', renderRoute('संसद में जन-आवाज | VIP Party', 'loksabha'));
app.get('/parliament', renderRoute('संसद में जन-आवाज | VIP Party', 'parliament'));

// Candidate & Applications Group
app.get('/candidate-declaration', renderRoute('उम्मीदवार घोषणापत्र | VIP Party', 'candidate'));
app.get('/scholarship', renderRoute('जुब्बा सहनी मेधा छात्रवृत्ति आवेदन फॉर्म | VIP Party', 'scholarship'));
app.get('/vidhansabha-ticket', renderRoute('विधानसभा टिकट आवेदन फॉर्म | VIP Party', 'ticket'));
app.get('/active-member', renderRoute('सक्रिय सदस्य आवेदन फॉर्म | VIP Party', 'active-member'));
app.get('/member', renderRoute('सदस्य बनें | विकासशील इंसान पार्टी', 'member'));

// Other Nav & Footer Links
app.get('/it-cell', renderRoute('आईटी सेल एवं डिजिटल विंग | VIP Party', 'it-cell'));
app.get('/donate', renderRoute('सहयोग करें (दान करें) | VIP Party', 'donate'));
app.get('/news', renderRoute('ताजा वीआईपी समाचार | VIP Party', 'news'));
app.get('/events', renderRoute('आगामी कार्यक्रम व रैलियां | VIP Party', 'events'));
app.get('/media', renderRoute('मीडिया एवं प्रेस कॉन्फ्रेंस | VIP Party', 'media'));
app.get('/contact', renderRoute('संपर्क सूत्र (Contact Us) | VIP Party', 'contact'));

// API Demo endpoint for membership submissions
app.post('/api/join', (req, res) => {
  const { name, phone, district, state } = req.body;
  console.log('New Membership Application Received:', { name, phone, district, state });
  res.json({
    success: true,
    message: 'आपका आवेदन सफलतापूर्वक प्राप्त हो गया है! VIP परिवार में आपका स्वागत है।'
  });
});

// ------------------------------------
// 4. 404 & Error Handling
// ------------------------------------
app.use((req, res) => {
  res.status(404).render('index', {
    pageTitle: '404 - पेज नहीं मिला | VIP Party',
    activeNav: '404'
  });
});

app.use((err, req, res, next) => {
  console.error('Server Internal Error:', err);
  res.status(500).send('Server Error: Something went wrong!');
});

// ------------------------------------
// 5. Start Server
// ------------------------------------
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 VIP Party Website running on: http://localhost:${PORT}`);
  console.log(`📁 Static Directory: ${path.join(__dirname, 'public')}`);
  console.log(`🖼️  Views Directory:  ${path.join(__dirname, 'views')}`);
  console.log(`======================================================\n`);
});
