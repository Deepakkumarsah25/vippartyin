const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vip_website';

// ------------------------------------
// 1. Database Connection & Models
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

// Scroller Schema (Hero Banner Scroller managed from vip-a)
const scrollerSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'image' },
    mediaUrl: { type: String, required: true },
    publicId: String,
    originalName: String,
    fileSize: Number,
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Scroller = mongoose.models.Scroller || mongoose.model('Scroller', scrollerSchema);

const fs = require('fs');
const multer = require('multer');

// Configure Multer Storage for Member Photos
const uploadDir = path.join(__dirname, 'public', 'uploads', 'members');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'member_' + Date.now() + '_' + Math.round(Math.random() * 1e6) + ext);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});
const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) ? null : new Error('Choose a JPG, PNG or WebP photo.'), true)
});

// Join Schema (Synchronized with vip-a MongoDB collections)
const joinSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: '', trim: true },
    age: { type: Number },
    gender: { type: String, default: '' },
    education: { type: String, default: '' },
    state: { type: String, default: 'Bihar' },
    district: { type: String, default: '' },
    loksabha: { type: String, default: '' },
    assembly: { type: String, default: '' },
    block: { type: String, default: '' },
    panchayat: { type: String, default: '' },
    ward: { type: String, default: '' },
    referredBy: { type: String, default: '' },
    address: { type: String, default: '', trim: true },
    profilePhoto: { type: String, default: '' },
    memberId: { type: String, default: null, sparse: true, index: true },
    type: { type: String, default: 'party_member' },
    status: { type: String, default: 'Approved' },
    mode: { type: String, default: 'web_online' },
    declarationAccepted: { type: Boolean, default: true }
  },
  { timestamps: true }
);
const Join = mongoose.models.Join || mongoose.model('Join', joinSchema);

async function generateUniqueMemberId() {
  const year = new Date().getFullYear();
  for (let i = 0; i < 15; i++) {
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const candidateId = `VIP-${year}-${randomSeq}`;
    try {
      if (mongoose.connection.readyState === 1) {
        const exists = await Join.findOne({ memberId: candidateId }).lean();
        if (!exists) return candidateId;
      } else {
        return candidateId;
      }
    } catch {
      return candidateId;
    }
  }
  return `VIP-${year}-${Date.now().toString().slice(-5)}`;
}

// Banner Schema (Live Updates Banner from vip-a)
const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

// Contact Message Schema
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    subject: { type: String, default: 'General Inquiry', trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, default: 'New' },
  },
  { timestamps: true }
);
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// User Auth Schema (Login / SignUp)
const userSchema = new mongoose.Schema(
  {
    uid: { type: String, default: () => 'VIP-USR-' + Date.now().toString().slice(-6) },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: '', trim: true },
    password: { type: String, default: '' },
    address: { type: String, default: '', trim: true },
    district: { type: String, default: '' },
    state: { type: String, default: 'Bihar' },
    membershipId: { type: String, default: null },
    photoURL: { type: String, default: '' }
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Volunteer Schema
const volunteerSchema = new mongoose.Schema(
  {
    volunteerId: { type: String, unique: true },
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: '', trim: true },
    gender: { type: String, default: 'Male' },
    dob: { type: String, default: '' },
    state: { type: String, default: 'Bihar' },
    district: { type: String, required: true, trim: true },
    assemblyConstituency: { type: String, default: '' },
    village: { type: String, default: '' },
    volunteerTypes: [{ type: String }],
    skills: { type: String, default: '' },
    availability: { type: String, default: 'Full Time' },
    status: { type: String, default: 'Pending' }
  },
  { timestamps: true }
);
const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);

// Scholarship Scheme Schema
const scholarshipSchema = new mongoose.Schema(
  {
    applicationId: { type: String, unique: true },
    studentName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: '', trim: true },
    gender: { type: String, default: 'Male' },
    category: { type: String, default: 'Nishad / Mallah' },
    dob: { type: String, default: '' },
    currentCourse: { type: String, required: true },
    institute: { type: String, required: true },
    percentageMarks: { type: String, default: '' },
    familyAnnualIncome: { type: String, default: '' },
    district: { type: String, required: true },
    assembly: { type: String, default: '' },
    address: { type: String, default: '' },
    status: { type: String, default: 'Pending' }
  },
  { timestamps: true }
);
const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', scholarshipSchema);

// UP 2027 Candidature Application Schema
const candidatureSchema = new mongoose.Schema(
  {
    candidatureId: { type: String, unique: true },
    applicantName: { type: String, required: true, trim: true },
    fatherOrHusbandName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true, index: true },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '', trim: true },
    age: { type: Number, default: 25 },
    gender: { type: String, default: 'Male' },
    state: { type: String, default: 'Uttar Pradesh' },
    district: { type: String, required: true },
    assemblyConstituency: { type: String, required: true },
    casteCommunity: { type: String, default: '' },
    education: { type: String, default: '' },
    profession: { type: String, default: '' },
    politicalExperience: { type: String, default: '' },
    activeInVipSince: { type: String, default: '' },
    criminalCases: { type: String, default: 'None' },
    status: { type: String, default: 'Under Review' }
  },
  { timestamps: true }
);
const Candidature = mongoose.models.Candidature || mongoose.model('Candidature', candidatureSchema);

// Support Settings Schema (Synchronized with vip-a Admin)
const supportSettingsSchema = new mongoose.Schema(
  {
    pageTitle: { type: String, default: "दान करें / Donate" },
    pageSubtitle: { type: String, default: "पार्टी को मजबूत बनाने में अपना बहुमूल्य योगदान दें" },
    partyNameHindi: { type: String, default: "विकासशील इंसान पार्टी" },
    partyNameEnglish: { type: String, default: "Vikassheel Insaan Party" },
    inspirationalMessage: {
      type: String,
      default:
        "सामाजिक न्याय और बिहार के विकास की इस लड़ाई में अपना बहुमूल्य योगदान दें। आपका हर एक रुपया समाज में सकारात्मक बदलाव ला सकता है।",
    },
    noticeText: {
      type: String,
      default: "कृपया ध्यान दें: केवल इसी आधिकारिक बैंक खाते में दान करें। किसी अन्य व्यक्ति को नकद देने से बचें।",
    },
    accountName: { type: String, default: "Vikassheel Insaan Party" },
    accountNameHindi: { type: String, default: "विकासशील इंसान पार्टी" },
    bankName: { type: String, default: "State Bank of India" },
    bankNameHindi: { type: String, default: "भारतीय स्टेट बैंक" },
    branchName: { type: String, default: "06, Boring Road, Patna, Bihar - 800001" },
    accountNumber: { type: String, default: "41982736450" },
    ifscCode: { type: String, default: "SBIN0001513" },
    upiId: { type: String, default: "vipparty@sbi" },
    qrCodeUrl: { type: String, default: "" },
    taxExemptionNotice: {
      type: String,
      default:
        "आयकर अधिनियम की धारा 80GGC के तहत राजनीतिक दल को दिया गया दान 100% कर मुक्त है। (All donations to VIP are 100% tax exempt under Section 80GGC of the Income Tax Act.)",
    },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const SupportSettings = mongoose.models.SupportSettings || mongoose.model('SupportSettings', supportSettingsSchema);

// Donation Record Schema (Pledges and Receipt Submissions)
const donationRecordSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, unique: true },
    donorName: { type: String, required: true, trim: true },
    donorPhone: { type: String, required: true, trim: true },
    donorEmail: { type: String, default: '', trim: true },
    panNumber: { type: String, default: '', trim: true },
    amount: { type: Number, required: true },
    utrNumber: { type: String, default: '', trim: true },
    paymentMode: { type: String, default: 'UPI' },
    state: { type: String, default: 'Bihar' },
    district: { type: String, default: '' },
    address: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending Verification', 'Verified', 'Receipt Issued', 'Rejected'],
      default: 'Pending Verification',
    },
  },
  { timestamps: true }
);
const DonationRecord = mongoose.models.DonationRecord || mongoose.model('DonationRecord', donationRecordSchema);

// CMS Page Schema (Synchronized with vip-a Admin Panel CMS)
const cmsSectionSchema = new mongoose.Schema({
  heading: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const cmsPageSchema = new mongoose.Schema(
  {
    pageKey: { type: String, required: true, unique: true },
    title: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    introText: { type: String, default: '' },
    sections: [cmsSectionSchema],
  },
  { timestamps: true }
);
const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', cmsPageSchema, 'cmspages');

// Prefer the admin CMS source so edits appear immediately; use the local DB only as fallback.
async function getCmsPage(pageKey) {
  try {
    const adminUrl = process.env.ADMIN_API_URL || 'http://localhost:9191';
    const response = await fetch(`${adminUrl}/cms/api/${encodeURIComponent(pageKey)}?t=${Date.now()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000)
    });
    if (response.status === 404) return null;
    if (response.ok) {
      const json = await response.json();
      if (json && json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn(`CMS admin API unavailable for [${pageKey}]:`, error.message);
  }
  try {
    if (mongoose.connection.readyState === 1) return await CmsPage.findOne({ pageKey }).lean();
  } catch (error) {
    console.warn(`CMS local database fallback failed for [${pageKey}]:`, error.message);
  }
  return null;
}

// Helper function to fetch active hero banners from DB with API fallback
async function getHeroBanners() {
  try {
    if (mongoose.connection.readyState === 1) {
      // 1. Check Scroller collection first (primary hero banners)
      const scrollers = await Scroller.find({ active: true, type: 'image' })
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      if (scrollers && scrollers.length > 0) {
        return scrollers.map((s) => ({
          _id: s._id.toString(),
          imageUrl: s.mediaUrl,
          title: s.originalName || 'VIP Party Hero Banner',
          type: s.type || 'image',
          source: 'scroller'
        }));
      }

      // 2. Fallback to Banner collection if no scrollers
      const banners = await Banner.find({ active: true }).sort({ createdAt: -1 }).lean();
      if (banners && banners.length > 0) {
        return banners.map((b) => ({
          _id: b._id.toString(),
          imageUrl: b.imageUrl,
          title: b.title || 'VIP Party Banner',
          type: 'image',
          source: 'banner'
        }));
      }
    }
  } catch (dbErr) {
    console.warn('⚠️ Error querying hero banners from MongoDB:', dbErr.message);
  }

  // 3. HTTP API Fallback to vip-a admin server
  try {
    const adminUrl = process.env.ADMIN_API_URL || 'http://localhost:9191';
    const response = await fetch(`${adminUrl}/api/scroller?t=${Date.now()}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data
          .filter((i) => i.type === 'image' && i.active !== false && i.mediaUrl)
          .map((i) => ({
            _id: String(i._id),
            imageUrl: i.mediaUrl,
            title: i.originalName || 'VIP Party Hero Banner',
            type: 'image',
            source: 'scroller'
          }));
      }
    }
  } catch (apiErr) {
    // silent fallback
  }

  return [];
}

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
app.use(async (req, res, next) => {
  req.currentUser = null;
  const token = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('vip_session='))?.slice('vip_session='.length);
  if (token) {
    try {
      const [payload, signature] = decodeURIComponent(token).split('.');
      const secret = process.env.AUTH_SESSION_SECRET || process.env.MONGODB_URI || 'vip-session-secret-change-me';
      const expected = crypto.createHmac('sha256', secret).update(payload).digest();
      const received = Buffer.from(signature, 'base64url');
      if (received.length === expected.length && crypto.timingSafeEqual(received, expected)) {
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
        if (session.exp > Date.now() && mongoose.connection.readyState === 1) {
          req.currentUser = await User.findOne({ uid: session.uid }).select('-password').lean();
        }
      }
    } catch (err) {
      // Invalid or expired cookies are treated as signed out.
    }
  }
  res.locals.currentUser = req.currentUser;
  next();
});
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.isDbConnected = isDbConnected;
  res.locals.siteName = 'विकासशील इंसान पार्टी (VIP)';
  res.locals.heroBanners = [];
  next();
});

let tickerAnnouncementsCache = { expiresAt: 0, items: [], available: false };
async function getTickerAnnouncements() {
  if (tickerAnnouncementsCache.expiresAt > Date.now()) return tickerAnnouncementsCache;
  try {
    const adminUrl = process.env.ADMIN_API_URL || 'http://localhost:9191';
    const response = await fetch(`${adminUrl}/admin/website/ticker-announcements/api`, { signal: AbortSignal.timeout(1000) });
    if (!response.ok) throw new Error(`Admin API returned ${response.status}`);
    const payload = await response.json();
    tickerAnnouncementsCache = { items: Array.isArray(payload.data) ? payload.data : [], available: true, expiresAt: Date.now() + 20000 };
  } catch (error) {
    tickerAnnouncementsCache = { ...tickerAnnouncementsCache, available: tickerAnnouncementsCache.items.length > 0, expiresAt: Date.now() + 5000 };
  }
  return tickerAnnouncementsCache;
}
app.use(async (req, res, next) => {
  const ticker = await getTickerAnnouncements();
  res.locals.tickerAnnouncements = ticker.items;
  res.locals.tickerAnnouncementsAvailable = ticker.available;
  next();
});

// ------------------------------------
// 3. Application Routes
// ------------------------------------

// Helper to render pages with consistent active navigation
const renderRoute = (pageTitle, activeNav) => (req, res) => {
  res.render('index', { pageTitle, activeNav, heroBanners: [] });
};

// Home (Loads dynamic hero section images from vip-a)
app.get('/', async (req, res) => {
  const heroBanners = await getHeroBanners();
  res.render('index', {
    pageTitle: 'विकासशील इंसान पार्टी (VIP) – आधिकारिक वेबसाइट',
    activeNav: 'home',
    heroBanners
  });
});

// API Endpoint to fetch latest Hero Banners
app.get('/api/hero-banners', async (req, res) => {
  const banners = await getHeroBanners();
  res.json({ success: true, count: banners.length, banners });
});

app.get('/announcements/:slug', async (req, res) => {
  try {
    const adminUrl = process.env.ADMIN_API_URL || 'http://localhost:9191';
    const response = await fetch(`${adminUrl}/admin/website/ticker-announcements/api/${encodeURIComponent(req.params.slug)}`, { signal: AbortSignal.timeout(3500) });
    if (response.status === 404) return res.status(404).render('index', { pageTitle: 'पेज नहीं मिला | VIP Party', activeNav: 'news', heroBanners: [] });
    if (!response.ok) return res.status(503).send('Announcement abhi load nahi ho pa raha. Kripya kuch der baad try karein.');
    const payload = await response.json();
    if (!payload.success || !payload.data) return res.status(404).render('index', { pageTitle: 'पेज नहीं मिला | VIP Party', activeNav: 'news', heroBanners: [] });
    res.render('announcement', { announcement: payload.data, pageTitle: `${payload.data.title} | VIP Party`, activeNav: 'news' });
  } catch (error) {
    console.error('Announcement page fetch failed:', error.message);
    res.status(503).send('Announcement abhi load nahi ho pa raha. Kripya kuch der baad try karein.');
  }
});

// About VIP Group
// About VIP Group (Synced with vip-a Admin Panel CMS: 'history-vip' / 'about')
app.get('/about', async (req, res) => {
  try {
    // CMS Admin stores 'About VIP Party' under key 'history-vip' (fallback to 'about')
    let pageData = await getCmsPage('history-vip');
    if (!pageData || (!pageData.introText && (!pageData.sections || pageData.sections.length === 0))) {
      const fallback = await getCmsPage('about');
      if (fallback) pageData = fallback;
    }

    res.render('about', {
      pageTitle: (pageData && pageData.title) ? `${pageData.title} | विकासशील इंसान पार्टी` : 'वीआईपी के बारे में | विकासशील इंसान पार्टी',
      activeNav: 'about',
      page: pageData || {
        title: 'विकासशील इंसान पार्टी (VIP)',
        introText: '',
        sections: []
      }
    });
  } catch (err) {
    console.error('Error rendering /about page:', err);
    res.render('about', {
      pageTitle: 'वीआईपी के बारे में | विकासशील इंसान पार्टी',
      activeNav: 'about',
      page: {
        title: 'विकासशील इंसान पार्टी (VIP)',
        introText: '',
        sections: []
      }
    });
  }
});
// Journey of Mukesh Sahani (Synced with vip-a Admin Panel CMS: 'journey-mukesh-sahani')
app.get('/journey-of-mukesh-sahani', async (req, res) => {
  try {
    let pageData = await getCmsPage('journey-mukesh-sahani');
    if (!pageData || (!pageData.sections || pageData.sections.length === 0)) {
      const fallback = await getCmsPage('journey-mukesh');
      if (fallback && fallback.sections && fallback.sections.length > 0) pageData = fallback;
    }

    res.render('journey', {
      pageTitle: (pageData && pageData.title) ? `${pageData.title} | VIP Party` : 'श्री मुकेश सहनी (सन ऑफ मल्लाह) का जीवन संघर्ष | VIP Party',
      activeNav: 'about',
      page: pageData || {
        title: 'मुकेश सहनी जी का जीवन परिचय एवं राजनीतिक सफर',
        introText: '',
        sections: []
      }
    });
  } catch (err) {
    console.error('Error rendering /journey-of-mukesh-sahani page:', err);
    res.render('journey', {
      pageTitle: 'श्री मुकेश सहनी (सन ऑफ मल्लाह) का जीवन संघर्ष | VIP Party',
      activeNav: 'about',
      page: {
        title: 'मुकेश सहनी जी का जीवन परिचय एवं राजनीतिक सफर',
        introText: '',
        sections: []
      }
    });
  }
});

// Mission & Vision (Synced with vip-a Admin Panel CMS: 'mission-vision')
app.get('/mission-vision', async (req, res) => {
  try {
    let pageData = await getCmsPage('mission-vision');

    res.render('mission-vision', {
      pageTitle: (pageData && pageData.title) ? `${pageData.title} | मिशन एवं विज़न | VIP Party` : 'मिशन एवं विज़न | विकासशील इंसान पार्टी (VIP)',
      activeNav: 'about',
      page: pageData || {
        title: 'हमारा मिशन एवं विज़न',
        introText: '',
        sections: []
      }
    });
  } catch (err) {
    console.error('Error rendering /mission-vision page:', err);
    res.render('mission-vision', {
      pageTitle: 'मिशन एवं विज़न | विकासशील इंसान पार्टी (VIP)',
      activeNav: 'about',
      page: {
        title: 'हमारा मिशन एवं विज़न',
        introText: '',
        sections: []
      }
    });
  }
});
app.get('/jubba-sahani', renderRoute('अमर शहीद जुब्बा सहनी | जीवन एवं बलिदान | VIP Party', 'jubba'));
app.get('/history', renderRoute('हमारा इतिहास | विकासशील इंसान पार्टी', 'history'));
// Our Ideology (Synced with vip-a Admin Panel CMS: 'our-philosophy' / 'ideology')
app.get('/ideology', async (req, res) => {
  try {
    let pageData = await getCmsPage('our-philosophy');
    if (!pageData || (!pageData.sections || pageData.sections.length === 0)) {
      const fallback = await getCmsPage('ideology');
      if (fallback) pageData = fallback;
    }

    res.render('ideology', {
      pageTitle: (pageData && pageData.title) ? `${pageData.title} | हमारी विचारधारा | VIP Party` : 'हमारी विचारधारा एवं सिद्धांत | VIP Party',
      activeNav: 'about',
      page: pageData || {
        title: 'हमारी विचारधारा एवं सिद्धांत',
        introText: '',
        sections: []
      }
    });
  } catch (err) {
    console.error('Error rendering /ideology page:', err);
    res.render('ideology', {
      pageTitle: 'हमारी विचारधारा | विकासशील इंसान पार्टी (VIP)',
      activeNav: 'about',
      page: {
        title: 'हमारी विचारधारा एवं सिद्धांत',
        introText: '',
        sections: []
      }
    });
  }
});

// Nishad Vikas Sangh (NVS) (Synced with vip-a Admin Panel CMS: 'nishad-vikas-sangh')
app.get(['/nvs', '/nishad-vikas-sangh'], async (req, res) => {
  try {
    let pageData = await getCmsPage('nishad-vikas-sangh');
    if (!pageData || (!pageData.sections || pageData.sections.length === 0)) {
      const fallback = await getCmsPage('nishad-vikas');
      if (fallback && fallback.sections && fallback.sections.length > 0) pageData = fallback;
    }

    res.render('nvs', {
      pageTitle: (pageData && pageData.title) ? `${pageData.title} (NVS) | VIP Party` : 'निषाद विकास संघ (NVS) | विकासशील इंसान पार्टी',
      activeNav: 'about',
      page: pageData || {
        title: 'निषाद विकास संघ (NVS)',
        introText: '',
        sections: []
      }
    });
  } catch (err) {
    console.error('Error rendering /nvs page:', err);
    res.render('nvs', {
      pageTitle: 'निषाद विकास संघ (NVS) | विकासशील इंसान पार्टी',
      activeNav: 'about',
      page: {
        title: 'निषाद विकास संघ (NVS)',
        introText: '',
        sections: []
      }
    });
  }
});

// Major Issues (प्रमुख मुद्दे)
app.get(['/major-issues', '/issues'], (req, res) => {
  res.render('major-issues', {
    pageTitle: 'प्रमुख मुद्दे (Major Issues) | विकासशील इंसान पार्टी',
    activeNav: 'about'
  });
});
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
app.get('/vidhansabha-ticket', renderRoute('विधानसभा टिकट आवेदन फॉर्म | VIP Party', 'ticket'));

// Dedicated Member Page (Styled & functional like rjd.co.in/member)
app.get('/member', (req, res) => {
  res.render('forms/join', {
    pageTitle: 'सदस्य बनें | VIP Online Membership | विकासशील इंसान पार्टी',
    activeNav: 'member'
  });
});
app.get('/forms/join', (req, res) => {
  res.render('forms/join', {
    pageTitle: 'सदस्य बनें | VIP Online Membership | विकासशील इंसान पार्टी',
    activeNav: 'forms'
  });
});
app.get('/active-member', (req, res) => {
  res.redirect('/member');
});

// Member Registration Processing Handler
const handleMemberRegistration = async (req, res) => {
  try {
    const {
      name,
      fullName,
      phone,
      mobile,
      email,
      age,
      gender,
      education,
      state,
      district,
      loksabha,
      vidhansabha,
      assembly,
      block,
      panchayat,
      ward,
      referred_by,
      referredBy,
      address
    } = req.body;

    const applicantName = (name || fullName || '').trim();
    const applicantMobile = (phone || mobile || '').trim();

    if (!applicantName || !applicantMobile) {
      return res.status(400).json({
        success: false,
        message: 'कृपया पूरा नाम और मोबाइल नंबर दर्ज करें।'
      });
    }

    const uniqueId = await generateUniqueMemberId();
    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/members/${req.file.filename}`;
    }

    // Save to MongoDB Atlas in 'joins' collection (same as vip-a)
    if (mongoose.connection.readyState === 1) {
      try {
        await Join.create({
          fullName: applicantName,
          mobile: applicantMobile,
          email: (email || '').trim(),
          age: age ? parseInt(age, 10) : undefined,
          gender: gender || '',
          education: education || '',
          state: state || 'Bihar',
          district: district || '',
          loksabha: loksabha || '',
          assembly: vidhansabha || assembly || '',
          block: block || '',
          panchayat: panchayat || '',
          ward: ward || '',
          referredBy: referred_by || referredBy || '',
          address: (address || '').trim(),
          profilePhoto: photoUrl,
          memberId: uniqueId,
          type: 'party_member',
          status: 'Approved',
          mode: 'web_online'
        });
        console.log(`✅ New VIP Member registered: ${applicantName} (${uniqueId})`);
      } catch (dbSaveErr) {
        console.warn('⚠️ Could not save member to DB:', dbSaveErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'बधाई हो! आपकी सदस्यता सफलतापूर्वक दर्ज हो गई है।',
      data: {
        unique_id: uniqueId,
        memberId: uniqueId,
        name: applicantName,
        phone: applicantMobile,
        email: email || '',
        district: district || '',
        loksabha: loksabha || '',
        assembly: vidhansabha || assembly || '',
        block: block || '',
        photo: photoUrl
      }
    });
  } catch (err) {
    console.error('Member processing error:', err);
    return res.status(500).json({
      success: false,
      message: 'सर्वर पर सदस्यता दर्ज करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
    });
  }
};

app.post('/actions/process_member', upload.single('photo'), handleMemberRegistration);
app.post('/api/member/register', upload.single('photo'), handleMemberRegistration);
app.post('/api/join', upload.single('photo'), handleMemberRegistration);

// Other Nav & Footer Links
app.get('/it-cell', renderRoute('आईटी सेल एवं डिजिटल विंग | VIP Party', 'it-cell'));
// Dedicated Support Us / Donate Page (Synchronized with admin settings)
app.get('/donate', async (req, res) => {
  try {
    let settings = null;
    if (mongoose.connection.readyState === 1) {
      settings = await SupportSettings.findOne().lean();
    }
    if (!settings) {
      settings = {
        pageTitle: "दान करें / Donate",
        pageSubtitle: "पार्टी को मजबूत बनाने में अपना बहुमूल्य योगदान दें",
        partyNameHindi: "विकासशील इंसान पार्टी",
        partyNameEnglish: "Vikassheel Insaan Party",
        inspirationalMessage: "सामाजिक न्याय और बिहार के विकास की इस लड़ाई में अपना बहुमूल्य योगदान दें। आपका हर एक रुपया समाज में सकारात्मक बदलाव ला सकता है।",
        noticeText: "कृपया ध्यान दें: केवल इसी आधिकारिक बैंक खाते में दान करें। किसी अन्य व्यक्ति को नकद देने से बचें।",
        accountName: "Vikassheel Insaan Party",
        accountNameHindi: "विकासशील इंसान पार्टी",
        bankName: "State Bank of India",
        bankNameHindi: "भारतीय स्टेट बैंक",
        branchName: "06, Boring Road, Patna, Bihar - 800001",
        accountNumber: "41982736450",
        ifscCode: "SBIN0001513",
        upiId: "vipparty@sbi",
        qrCodeUrl: "",
        taxExemptionNotice: "आयकर अधिनियम की धारा 80GGC के तहत राजनीतिक दल को दिया गया दान 100% कर मुक्त है। (All donations to VIP are 100% tax exempt under Section 80GGC of the Income Tax Act.)",
        isVerified: true
      };
    }
    res.render('donate', {
      pageTitle: 'सहयोग करें - दान दें | Support Vikassheel Insaan Party',
      activeNav: 'donate',
      settings
    });
  } catch (err) {
    console.error('Error rendering donate page:', err);
    res.status(500).send('Error loading donate page');
  }
});
app.get('/support', (req, res) => res.redirect('/donate'));
app.get('/support-us', (req, res) => res.redirect('/donate'));

// API to submit donation acknowledgment / pledge
app.post('/api/donate/submit', async (req, res) => {
  try {
    const { donorName, donorPhone, donorEmail, panNumber, amount, utrNumber, paymentMode, state, district, message } = req.body;
    if (!donorName || !donorPhone || !amount) {
      return res.status(400).json({ success: false, message: 'कृपया नाम, मोबाइल नंबर और सहयोग राशि अनिवार्य रूप से भरें।' });
    }

    const receiptNumber = 'VIP-DON-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    if (mongoose.connection.readyState === 1) {
      await DonationRecord.create({
        receiptNumber,
        donorName: donorName.trim(),
        donorPhone: donorPhone.trim(),
        donorEmail: (donorEmail || '').trim(),
        panNumber: (panNumber || '').trim().toUpperCase(),
        amount: Number(amount),
        utrNumber: (utrNumber || '').trim(),
        paymentMode: paymentMode || 'UPI',
        state: state || 'Bihar',
        district: (district || '').trim(),
        message: (message || '').trim(),
        status: 'Pending Verification'
      });
      console.log(`🙏 New Donation pledge/receipt recorded: ${donorName} - ₹${amount} (${receiptNumber})`);
    }

    return res.json({
      success: true,
      message: 'धन्यवाद! आपके बहुमूल्य सहयोग की सूचना सफलतापूर्वक दर्ज कर ली गई है।',
      receiptNumber,
      amount,
      donorName
    });
  } catch (err) {
    console.error('Donation pledge error:', err);
    return res.status(500).json({ success: false, message: 'सर्वर पर दान की जानकारी दर्ज करने में त्रुटि हुई।' });
  }
});
app.get('/news', renderRoute('ताजा वीआईपी समाचार | VIP Party', 'news'));
app.get('/events', renderRoute('आगामी कार्यक्रम व रैलियां | VIP Party', 'events'));
app.get('/media', renderRoute('मीडिया एवं प्रेस कॉन्फ्रेंस | VIP Party', 'media'));

// Menu 1: Gallery
app.get('/gallery', renderRoute('गैलरी (फोटो एवं वीडियो) | VIP Party', 'gallery'));
app.get('/gallery/photo', renderRoute('फोटो गैलरी | विकासशील इंसान पार्टी', 'gallery'));
app.get('/gallery/video', renderRoute('वीडियो गैलरी | विकासशील इंसान पार्टी', 'gallery'));

// Menu 1: Press
app.get('/press', renderRoute('प्रेस एवं मीडिया | विकासशील इंसान पार्टी', 'press'));
app.get('/interview', renderRoute('विशेष साक्षात्कार (Interviews) | VIP Party', 'press'));
app.get('/press-release', renderRoute('प्रेस विज्ञप्ति (Press Release) | VIP Party', 'press'));

// Menu 1: Download
app.get('/download', renderRoute('डाउनलोड सेन्टर | विकासशील इंसान पार्टी', 'download'));
app.get('/download/leaders-photo', renderRoute('नेताओं की तस्वीरें | VIP Party', 'download'));
app.get('/download/infographics-banner', renderRoute('इन्फोग्राफिक्स और बैनर | VIP Party', 'download'));
app.get('/download/quotes', renderRoute('सुविचार एवं उद्धरण | VIP Party', 'download'));
app.get('/download/mobile-wallpaper', renderRoute('मोबाइल वॉलपेपर | VIP Party', 'download'));

// Menu 1: Forms Dedicated Pages
app.get('/volunteer', (req, res) => res.render('forms/volunteer', { pageTitle: 'वालंटियर के रूप में जुड़ें | VIP Party', activeNav: 'forms' }));
app.get('/forms/volunteer', (req, res) => res.render('forms/volunteer', { pageTitle: 'वालंटियर के रूप में जुड़ें | VIP Party', activeNav: 'forms' }));

app.get('/scholarship', (req, res) => res.render('forms/scholarship', { pageTitle: 'जुब्बा सहनी मेधा छात्रवृत्ति योजना | VIP Party', activeNav: 'forms' }));
app.get('/forms/scholarship', (req, res) => res.render('forms/scholarship', { pageTitle: 'जुब्बा सहनी मेधा छात्रवृत्ति योजना | VIP Party', activeNav: 'forms' }));

app.get('/candidature-up-2027', (req, res) => res.render('forms/candidature-up-2027', { pageTitle: 'यूपी 2027 उम्मीदवारी आवेदन फॉर्म | VIP Party', activeNav: 'forms' }));
app.get('/forms/candidature-up-2027', (req, res) => res.render('forms/candidature-up-2027', { pageTitle: 'यूपी 2027 उम्मीदवारी आवेदन फॉर्म | VIP Party', activeNav: 'forms' }));
app.get('/up-2027-candidature', (req, res) => res.redirect('/forms/candidature-up-2027'));

app.get('/forms/join-vip', (req, res) => res.redirect('/member'));

// Forms Hub & Dedicated Submission Success Page
app.get('/forms', (req, res) => res.render('forms/index', { pageTitle: 'सभी आधिकारिक आवेदन फॉर्म | Official Forms | VIP Party', activeNav: 'forms' }));
app.get('/forms/success', (req, res) => res.render('forms/success', { pageTitle: 'आवेदन सफलतापूर्वक दर्ज | Vikassheel Insaan Party (VIP)', activeNav: 'forms' }));
app.get('/form-success', (req, res) => res.redirect('/forms/success'));

// Menu 2: Dedicated Auth Pages (Login & SignUp in separate views/auth/ folder)
app.get('/login', (req, res) => res.render('auth/login', { pageTitle: 'Sign in | VIP Party', activeNav: 'login', googleClientId: process.env.GOOGLE_CLIENT_ID || '' }));
app.get('/auth/login', (req, res) => res.redirect('/login'));

app.get('/signup', (req, res) => res.render('auth/signup', { pageTitle: 'Create your account | VIP Party', activeNav: 'signup' }));
app.get('/auth/signup', (req, res) => res.redirect('/signup'));
app.get('/forgot-password', (req, res) => res.render('auth/forgot-password', { pageTitle: 'Reset password | VIP Party' }));
app.get('/google-login-setup', (req, res) => res.type('text/plain').sendFile(path.join(__dirname, 'GOOGLE_LOGIN_SETUP.md')));
app.get('/profile', (req, res) => {
  if (!req.currentUser) return res.redirect('/login');
  res.render('profile', { pageTitle: 'My profile | VIP Party', activeNav: 'profile', profileUser: req.currentUser });
});
app.post('/auth/logout', (req, res) => {
  res.clearCookie('vip_session', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.redirect('/');
});
async function uploadProfilePhotoToCloudinary(file) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    const error = new Error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the server environment.');
    error.statusCode = 503;
    throw error;
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'vip-profiles';
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`).digest('hex');
  const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' })[file.mimetype];
  const form = new FormData();
  form.append('file', new Blob([file.buffer], { type: file.mimetype }), `profile-${Date.now()}.${extension}`);
  form.append('api_key', CLOUDINARY_API_KEY);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`, { method: 'POST', body: form });
  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    console.error('Cloudinary profile upload failed:', result.error?.message || response.statusText);
    const error = new Error('Cloudinary could not upload this photo. Check the Cloudinary settings and try again.');
    error.statusCode = response.status >= 500 ? 502 : 400;
    throw error;
  }
  return result.secure_url;
}
app.post('/api/profile', (req, res, next) => {
  if (!req.currentUser) return res.status(401).json({ success: false, message: 'Please sign in to edit your profile.' });
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, message: 'Database is not connected. Profile changes cannot be saved yet.' });
  profilePhotoUpload.single('photo')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Photo upload failed.' });
    next();
  });
}, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const address = String(req.body.address || '').trim();
    const district = String(req.body.district || '').trim();
    const state = String(req.body.state || '').trim();
    const phoneInput = String(req.body.phone || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'Please enter your name.' });
    if (phoneInput && !/^\d{10}$/.test(phoneInput)) return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    if ([name, email, address, district, state].some((value) => value.length > 400)) return res.status(400).json({ success: false, message: 'One or more profile fields are too long.' });
    const update = { name, email, address, district, state };
    if (phoneInput) update.phone = phoneInput;
    if (req.file) update.photoURL = await uploadProfilePhotoToCloudinary(req.file);
    const updatedUser = await User.findByIdAndUpdate(req.currentUser._id, { $set: update }, { returnDocument: 'after', runValidators: true }).select('-password').lean();
    return res.json({ success: true, message: 'Profile saved successfully.', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(err.statusCode || 500).json({ success: false, message: err.statusCode === 503 ? err.message : (err.statusCode ? err.message : 'Profile could not be saved. Please try again.') });
  }
});
app.post('/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) return res.status(400).json({ success: false, message: 'Enter your mobile number and password.' });
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, message: 'Sign-in is temporarily unavailable.' });
    const user = await User.findOne({ phone: phone.trim() });
    if (!user || !user.password || user.password !== password) return res.status(401).json({ success: false, message: 'Mobile number or password is incorrect.' });
    setAuthCookie(res, user);
    return res.json({ success: true, message: 'Signed in successfully.', redirect: '/profile' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Sign-in could not be completed.' });
  }
});

// Auth Form Handlers (Connecting to same MongoDB 'users' collection)
app.post('/auth/signup', async (req, res) => {
  try {
    const { name, phone, email, district, password } = req.body;
    if (!name || !phone || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'कृपया नाम और मोबाइल नंबर अनिवार्य रूप से भरें।' });
    }

    if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, message: 'Registration is temporarily unavailable.' });
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ phone: phone.trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।' });
      }

      const newUser = await User.create({
        name: name.trim(),
        phone: phone.trim(),
        email: (email || '').trim(),
        district: (district || '').trim(),
        password,
        uid: 'VIP-USR-' + Date.now().toString().slice(-6)
      });
      console.log(`✅ New VIP User registered: ${newUser.name} (${newUser.phone})`);
    }

    return res.json({ success: true, message: 'बधाई! आपका खाता सफलतापूर्वक बन गया है।' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'खाता बनाने में त्रुटि हुई।' });
  }
});

function setAuthCookie(res, user) {
  const payload = Buffer.from(JSON.stringify({ uid: user.uid, exp: Date.now() + 604800000 })).toString('base64url');
  const secret = process.env.AUTH_SESSION_SECRET || process.env.MONGODB_URI || 'vip-session-secret-change-me';
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  res.cookie('vip_session', `${payload}.${signature}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 604800000 });
}

app.post('/auth/google', async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ success: false, message: 'Google sign-in is not configured. Set GOOGLE_CLIENT_ID on the server.' });
    const token = req.body?.credential;
    if (!token) return res.status(400).json({ success: false, message: 'Google credential is missing.' });
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (!response.ok) return res.status(401).json({ success: false, message: 'Google could not verify this account.' });
    const profile = await response.json();
    if (profile.aud !== process.env.GOOGLE_CLIENT_ID || profile.email_verified !== 'true' || !profile.email) return res.status(401).json({ success: false, message: 'This Google account could not be verified.' });
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, message: 'Sign-in is temporarily unavailable.' });
    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) user = await User.create({ name: profile.name || 'VIP Member', phone: `google:${profile.sub}`, email: profile.email.toLowerCase(), photoURL: profile.picture || '', password: '' });
    setAuthCookie(res, user);
    return res.json({ success: true, redirect: '/profile' });
  } catch (err) {
    console.error('Google sign-in error:', err);
    return res.status(500).json({ success: false, message: 'Google sign-in could not be completed.' });
  }
});

app.post('/auth/forgot-password', (req, res) => res.status(503).json({ success: false, message: 'Password reset email is not configured yet. Please contact VIP support for help.' }));
// Forms Submissions APIs (Saving to same MongoDB)
app.post('/api/forms/volunteer', async (req, res) => {
  try {
    const { fullName, mobile, email, gender, state, district, assemblyConstituency, village, volunteerTypes, availability, skills } = req.body;
    if (!fullName || !mobile || !district) {
      return res.status(400).json({ success: false, message: 'कृपया आवश्यक विवरण भरें।' });
    }

    const volunteerId = 'VIP-VOL-' + Math.floor(10000 + Math.random() * 90000);
    if (mongoose.connection.readyState === 1) {
      await Volunteer.create({
        volunteerId,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: (email || '').trim(),
        gender: gender || 'Male',
        state: state || 'Bihar',
        district: district.trim(),
        assemblyConstituency: (assemblyConstituency || '').trim(),
        village: (village || '').trim(),
        volunteerTypes: Array.isArray(volunteerTypes) ? volunteerTypes : [volunteerTypes].filter(Boolean),
        availability: availability || 'Full Time',
        skills: (skills || '').trim(),
        status: 'Pending'
      });
      console.log(`🤝 New Volunteer registered: ${fullName} (${volunteerId})`);
    }

    return res.json({ success: true, volunteerId, message: 'वालंटियर आवेदन सफलतापूर्वक दर्ज किया गया।' });
  } catch (err) {
    console.error('Volunteer submission error:', err);
    return res.status(500).json({ success: false, message: 'सर्वर पर आवेदन दर्ज करने में त्रुटि हुई।' });
  }
});

app.post('/api/forms/scholarship', async (req, res) => {
  try {
    const { studentName, fatherName, mobile, email, gender, category, currentCourse, institute, percentageMarks, familyAnnualIncome, district, assembly, address } = req.body;
    if (!studentName || !fatherName || !mobile || !currentCourse || !institute || !district) {
      return res.status(400).json({ success: false, message: 'कृपया सभी आवश्यक फ़ील्ड भरें।' });
    }

    const applicationId = 'VIP-SCH-' + Math.floor(10000 + Math.random() * 90000);
    if (mongoose.connection.readyState === 1) {
      await Scholarship.create({
        applicationId,
        studentName: studentName.trim(),
        fatherName: fatherName.trim(),
        mobile: mobile.trim(),
        email: (email || '').trim(),
        gender: gender || 'Male',
        category: category || 'Nishad / Mallah',
        currentCourse: currentCourse.trim(),
        institute: institute.trim(),
        percentageMarks: (percentageMarks || '').trim(),
        familyAnnualIncome: (familyAnnualIncome || '').trim(),
        district: district.trim(),
        assembly: (assembly || '').trim(),
        address: (address || '').trim(),
        status: 'Pending'
      });
      console.log(`🎓 New Scholarship Application: ${studentName} (${applicationId})`);
    }

    return res.json({ success: true, applicationId, message: 'छात्रवृत्ति आवेदन सफलतापूर्वक दर्ज किया गया।' });
  } catch (err) {
    console.error('Scholarship submission error:', err);
    return res.status(500).json({ success: false, message: 'छात्रवृत्ति आवेदन दर्ज करने में त्रुटि हुई।' });
  }
});

app.post('/api/forms/candidature-up-2027', async (req, res) => {
  try {
    const { applicantName, fatherOrHusbandName, mobile, whatsapp, age, gender, district, assemblyConstituency, casteCommunity, education, profession, activeInVipSince, politicalExperience, criminalCases } = req.body;
    if (!applicantName || !fatherOrHusbandName || !mobile || !district || !assemblyConstituency) {
      return res.status(400).json({ success: false, message: 'कृपया सभी आवश्यक फ़ील्ड भरें।' });
    }

    const candidatureId = 'VIP-UP27-' + Math.floor(10000 + Math.random() * 90000);
    if (mongoose.connection.readyState === 1) {
      await Candidature.create({
        candidatureId,
        applicantName: applicantName.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim(),
        mobile: mobile.trim(),
        whatsapp: (whatsapp || mobile || '').trim(),
        age: age ? parseInt(age, 10) : 25,
        gender: gender || 'Male',
        state: 'Uttar Pradesh',
        district: district.trim(),
        assemblyConstituency: assemblyConstituency.trim(),
        casteCommunity: (casteCommunity || '').trim(),
        education: (education || '').trim(),
        profession: (profession || '').trim(),
        activeInVipSince: (activeInVipSince || '').trim(),
        politicalExperience: (politicalExperience || '').trim(),
        criminalCases: (criminalCases || 'None').trim(),
        status: 'Under Review'
      });
      console.log(`🗳️ New UP 2027 Candidature Application: ${applicantName} (${candidatureId})`);
    }

    return res.json({ success: true, candidatureId, message: 'उम्मीदवारी आवेदन सफलतापूर्वक दर्ज किया गया।' });
  } catch (err) {
    console.error('Candidature submission error:', err);
    return res.status(500).json({ success: false, message: 'उम्मीदवारी आवेदन दर्ज करने में त्रुटि हुई।' });
  }
});

// Dedicated Contact Page (Exact RJD Layout)
app.get('/contact', (req, res) => {
  res.render('contact', {
    pageTitle: 'संपर्क सूत्र (Contact Us) | विकासशील इंसान पार्टी (VIP)',
    activeNav: 'contact'
  });
});

// Contact Form Handler
const handleContactSubmission = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    const senderName = (name || '').trim();
    const senderPhone = (phone || '').trim();
    const senderMsg = (message || '').trim();

    if (!senderName || !senderPhone || !senderMsg) {
      return res.status(400).json({
        success: false,
        message: 'कृपया पूरा नाम, मोबाइल नंबर और संदेश अनिवार्य रूप से दर्ज करें।'
      });
    }

    if (mongoose.connection.readyState === 1) {
      await Contact.create({
        name: senderName,
        phone: senderPhone,
        email: (email || '').trim(),
        subject: (subject || 'General Inquiry').trim(),
        message: senderMsg,
        status: 'New'
      });
      console.log(`📩 New VIP Contact Message from: ${senderName} (${senderPhone})`);
    }

    return res.json({
      success: true,
      message: 'धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी।'
    });
  } catch (err) {
    console.error('Contact processing error:', err);
    return res.status(500).json({
      success: false,
      message: 'संदेश भेजने में सर्वर पर त्रुटि हुई। कृपया पुनः प्रयास करें।'
    });
  }
};

app.post('/contact', handleContactSubmission);
app.post('/api/contact', handleContactSubmission);

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
