const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');

const galleryRoutes = require('./routes/galleryRoutes');
const pressRoutes = require('./routes/pressRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vip_website';
const AUTH_COOKIE_SECRET = process.env.AUTH_COOKIE_SECRET || process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function createAuthToken(uid) {
  const encodedUid = Buffer.from(String(uid)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_COOKIE_SECRET).update(encodedUid).digest('base64url');
  return `${encodedUid}.${signature}`;
}

function readAuthToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [encodedUid, signature] = token.split('.');
  if (!encodedUid || !signature) return null;
  const expected = crypto.createHmac('sha256', AUTH_COOKIE_SECRET).update(encodedUid).digest();
  let supplied;
  try { supplied = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;
  try { return Buffer.from(encodedUid, 'base64url').toString(); } catch { return null; }
}

function setAuthCookie(res, uid) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `vip_session=${createAuthToken(uid)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`);
}

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

// Download Item Schema (Synchronized with shared MongoDB Atlas collection 'downloaditems')
const downloadItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['leaders-photo', 'infographics-banner', 'quotes', 'mobile-wallpaper'],
      index: true,
    },
    imageUrl: { type: String, required: true, trim: true },
    publicId: { type: String, default: '' },
    caption: { type: String, default: '', trim: true },
    author: { type: String, default: '', trim: true },
    fileSize: { type: String, default: '1.5 MB' },
    dimensions: { type: String, default: '1920x1080' },
    format: { type: String, default: 'JPG' },
    downloadsCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);
const DownloadItem = mongoose.models.DownloadItem || mongoose.model('DownloadItem', downloadItemSchema);

// Helper function to fetch active downloads from DB with API fallback
async function getDownloadItems(category = 'all', searchQuery = '') {
  try {
    if (mongoose.connection.readyState === 1) {
      const filter = { isPublished: true };
      if (category && category !== 'all') {
        filter.category = category;
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim();
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { caption: { $regex: q, $options: 'i' } },
          { author: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
        ];
      }
      return await DownloadItem.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();
    }
  } catch (err) {
    console.warn('DB download fetch note:', err.message);
  }

  // API Fallback
  try {
    const adminUrl = process.env.ADMIN_API_URL || 'http://localhost:9191';
    const url = category && category !== 'all'
      ? `${adminUrl}/api/downloads/api/list/${category}`
      : `${adminUrl}/api/downloads/api/list`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success && json.data) {
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return json.data.filter(item =>
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.caption && item.caption.toLowerCase().includes(q)) ||
          (item.author && item.author.toLowerCase().includes(q))
        );
      }
      return json.data;
    }
  } catch (apiErr) {
    console.warn('API fallback note:', apiErr.message);
  }

  return [];
}

// Helper to fetch download counts for category pills
async function getDownloadStats() {
  try {
    if (mongoose.connection.readyState === 1) {
      const totalDownloads = await DownloadItem.countDocuments({ isPublished: true });
      const leadersPhotoCount = await DownloadItem.countDocuments({ category: 'leaders-photo', isPublished: true });
      const infographicsCount = await DownloadItem.countDocuments({ category: 'infographics-banner', isPublished: true });
      const quotesCount = await DownloadItem.countDocuments({ category: 'quotes', isPublished: true });
      const wallpaperCount = await DownloadItem.countDocuments({ category: 'mobile-wallpaper', isPublished: true });
      return {
        totalDownloads,
        leadersPhotoCount,
        infographicsCount,
        quotesCount,
        wallpaperCount,
      };
    }
  } catch (err) { }
  return {
    totalDownloads: 0,
    leadersPhotoCount: 0,
    infographicsCount: 0,
    quotesCount: 0,
    wallpaperCount: 0,
  };
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

  // 3. Fetch from the local admin API first, then try the configured remote API.
  const adminUrls = [...new Set([
    'http://localhost:9191',
    process.env.ADMIN_API_URL
  ].filter(Boolean).map((url) => url.replace(/\/+$/, '')))];

  for (const adminUrl of adminUrls) {
    try {
      const response = await fetch(`${adminUrl}/api/scroller?t=${Date.now()}`);
      if (!response.ok) continue;

      const payload = await response.json();
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.banners)
          ? payload.banners
          : [];
      const banners = items
        .filter((item) => item.type === 'image' && item.active !== false && (item.mediaUrl || item.imageUrl))
        .map((item) => ({
          _id: String(item._id),
          imageUrl: item.mediaUrl || item.imageUrl,
          title: item.originalName || item.title || 'VIP Party Hero Banner',
          type: 'image',
          source: 'scroller'
        }));

      if (banners.length > 0) return banners;
    } catch (apiErr) {
      // Try the next configured admin API.
    }
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

app.use(async (req, res, next) => {
  try {
    const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map((part) => {
      const index = part.indexOf('=');
      return index < 0 ? ['', ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    }).filter(([key]) => key));
    const uid = readAuthToken(cookies.vip_session);
    if (uid && mongoose.connection.readyState === 1) {
      req.currentUser = await User.findOne({ uid }).select('-password').lean();
    }
  } catch (error) {
    console.warn('Could not restore the signed-in user:', error.message);
  }
  next();
});

// Global template variables middleware
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.isDbConnected = isDbConnected;
  res.locals.siteName = 'विकासशील इंसान पार्टी (VIP)';
  res.locals.heroBanners = [];
  res.locals.currentUser = req.currentUser || null;
  res.locals.tickerAnnouncements = [];
  res.locals.tickerAnnouncementsAvailable = false;
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

app.use('/api/gallery', galleryRoutes);
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
app.get('/about', (req, res) => res.render('about', {
  pageTitle: 'पार्टी के बारे में | विकासशील इंसान पार्टी',
  activeNav: 'about'
}));
app.get('/journey-of-mukesh-sahani', (req, res) => res.render('journey', {
  pageTitle: 'श्री मुकेश सहनी (सन ऑफ मल्लाह) का जीवन संघर्ष | VIP Party',
  activeNav: 'journey'
}));
app.get('/jubba-sahani', renderRoute('अमर शहीद जुब्बा सहनी | जीवन एवं बलिदान | VIP Party', 'jubba'));
app.get('/history', renderRoute('हमारा इतिहास | विकासशील इंसान पार्टी', 'history'));
app.get('/ideology', (req, res) => res.render('ideology', {
  pageTitle: 'हमारी विचारधारा एवं सिद्धांत | विकासशील इंसान पार्टी (VIP)',
  activeNav: 'ideology'
}));
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
app.use('/', pressRoutes);
app.get('/events', renderRoute('आगामी कार्यक्रम व रैलियां | VIP Party', 'events'));
app.get('/media', renderRoute('मीडिया एवं प्रेस कॉन्फ्रेंस | VIP Party', 'media'));

// Menu 1: About Sub-Items
app.get('/mission-vision', (req, res) => res.render('mission-vision', {
  pageTitle: 'मिशन एवं विज़न | विकासशील इंसान पार्टी',
  activeNav: 'mission'
}));
app.get('/major-issues', (req, res) => res.render('major-issues', {
  pageTitle: 'प्रमुख मुद्दे | विकासशील इंसान पार्टी',
  activeNav: 'issues'
}));
app.get('/nvs', (req, res) => res.render('nvs', {
  pageTitle: 'निषाद विकास संघ (NVS) | VIP Party',
  activeNav: 'nvs'
}));

// Menu 1: Gallery
app.use('/gallery', galleryRoutes);
app.get('/gallery', renderRoute('गैलरी (फोटो एवं वीडियो) | VIP Party', 'gallery'));

// Menu 1: Press
app.get('/press', renderRoute('प्रेस एवं मीडिया | विकासशील इंसान पार्टी', 'press'));

// Menu 1: Download Section (Fully dynamic, responsive & connected to shared database)
app.get('/download', async (req, res) => {
  const searchQuery = (req.query.q || '').trim();
  const items = await getDownloadItems('all', searchQuery);
  const stats = await getDownloadStats();
  res.render('download/index', {
    pageTitle: 'डाउनलोड सेन्टर | विकासशील इंसान पार्टी (VIP)',
    activeNav: 'download',
    currentCategory: 'all',
    searchQuery,
    items,
    stats,
  });
});

app.get('/download/leaders-photo', async (req, res) => {
  const searchQuery = (req.query.q || '').trim();
  const items = await getDownloadItems('leaders-photo', searchQuery);
  const stats = await getDownloadStats();
  res.render('download/index', {
    pageTitle: 'नेताओं की तस्वीरें (Leaders Photo) | VIP Party',
    activeNav: 'download',
    currentCategory: 'leaders-photo',
    searchQuery,
    items,
    stats,
  });
});

app.get('/download/infographics-banner', async (req, res) => {
  const searchQuery = (req.query.q || '').trim();
  const items = await getDownloadItems('infographics-banner', searchQuery);
  const stats = await getDownloadStats();
  res.render('download/index', {
    pageTitle: 'इन्फोग्राफिक्स और बैनर (Infographics & Banner) | VIP Party',
    activeNav: 'download',
    currentCategory: 'infographics-banner',
    searchQuery,
    items,
    stats,
  });
});

app.get('/download/quotes', async (req, res) => {
  const searchQuery = (req.query.q || '').trim();
  const items = await getDownloadItems('quotes', searchQuery);
  const stats = await getDownloadStats();
  res.render('download/index', {
    pageTitle: 'सुविचार एवं उद्धरण (Quotes) | VIP Party',
    activeNav: 'download',
    currentCategory: 'quotes',
    searchQuery,
    items,
    stats,
  });
});

app.get('/download/mobile-wallpaper', async (req, res) => {
  const searchQuery = (req.query.q || '').trim();
  const items = await getDownloadItems('mobile-wallpaper', searchQuery);
  const stats = await getDownloadStats();
  res.render('download/index', {
    pageTitle: 'मोबाइल वॉलपेपर 4K (Mobile Wallpaper) | VIP Party',
    activeNav: 'download',
    currentCategory: 'mobile-wallpaper',
    searchQuery,
    items,
    stats,
  });
});

// Direct File Download Proxy (Increments download counter and serves attachment)
app.get('/download/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let item = null;
    if (mongoose.connection.readyState === 1) {
      item = await DownloadItem.findById(id);
      if (item) {
        item.downloadsCount = (item.downloadsCount || 0) + 1;
        await item.save();
      }
    }
    if (!item) {
      return res.redirect('/download');
    }

    // Clean safe filename
    const safeTitle = item.title.replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_').substring(0, 50);
    const ext = path.extname(item.imageUrl) || '.jpg';
    const downloadName = `VIP_${safeTitle}${ext}`;

    // If local path
    if (item.imageUrl.startsWith('/')) {
      const localPath = path.join(__dirname, 'public', item.imageUrl);
      if (fs.existsSync(localPath)) {
        return res.download(localPath, downloadName);
      }
      const backendLocalPath = path.resolve(__dirname, '../backend/public', item.imageUrl.replace(/^\//, ''));
      if (fs.existsSync(backendLocalPath)) {
        return res.download(backendLocalPath, downloadName);
      }
      const backendUploadPath = path.resolve(__dirname, '../backend/uploads/downloads', path.basename(item.imageUrl));
      if (fs.existsSync(backendUploadPath)) {
        return res.download(backendUploadPath, downloadName);
      }
    }

    // If Cloudinary URL
    if (item.imageUrl.includes('cloudinary.com')) {
      const dlUrl = item.imageUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(safeTitle)}/`);
      return res.redirect(dlUrl);
    }

    // Remote HTTP URL: Stream as attachment
    if (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://')) {
      try {
        const fetchRes = await fetch(item.imageUrl);
        if (fetchRes.ok) {
          const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
          const arrayBuffer = await fetchRes.arrayBuffer();
          return res.send(Buffer.from(arrayBuffer));
        }
      } catch (streamErr) {
        console.warn('Proxy download stream error, falling back to redirect:', streamErr.message);
      }
    }

    return res.redirect(item.imageUrl);
  } catch (err) {
    console.error('File download error:', err);
    return res.redirect('/download');
  }
});

// Download Counter Track API
app.post('/api/download/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const item = await DownloadItem.findByIdAndUpdate(
        id,
        { $inc: { downloadsCount: 1 } },
        { new: true }
      );
      if (item) {
        return res.json({ success: true, downloadsCount: item.downloadsCount });
      }
    }
    return res.json({ success: true, downloadsCount: 1 });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Menu 1: Forms Dedicated Pages
app.get('/forms', (req, res) => res.render('forms/index', { pageTitle: 'सभी फॉर्म | VIP Party', activeNav: 'forms' }));
app.get('/forms/success', (req, res) => res.render('forms/success', { pageTitle: 'आवेदन सफलतापूर्वक दर्ज | VIP Party', activeNav: 'forms' }));

app.get('/volunteer', (req, res) => res.render('forms/volunteer', { pageTitle: 'वालंटियर के रूप में जुड़ें | VIP Party', activeNav: 'forms' }));
app.get('/forms/volunteer', (req, res) => res.render('forms/volunteer', { pageTitle: 'वालंटियर के रूप में जुड़ें | VIP Party', activeNav: 'forms' }));

app.get('/scholarship', (req, res) => res.render('forms/scholarship', { pageTitle: 'जुब्बा सहनी मेधा छात्रवृत्ति योजना | VIP Party', activeNav: 'forms' }));
app.get('/forms/scholarship', (req, res) => res.render('forms/scholarship', { pageTitle: 'जुब्बा सहनी मेधा छात्रवृत्ति योजना | VIP Party', activeNav: 'forms' }));

app.get('/candidature-up-2027', (req, res) => res.render('forms/candidature-up-2027', { pageTitle: 'यूपी 2027 उम्मीदवारी आवेदन फॉर्म | VIP Party', activeNav: 'forms' }));
app.get('/forms/candidature-up-2027', (req, res) => res.render('forms/candidature-up-2027', { pageTitle: 'यूपी 2027 उम्मीदवारी आवेदन फॉर्म | VIP Party', activeNav: 'forms' }));
app.get('/up-2027-candidature', (req, res) => res.redirect('/forms/candidature-up-2027'));

app.get('/forms/join-vip', (req, res) => res.redirect('/member'));

// Menu 2: Dedicated Auth Pages (Login & SignUp in separate views/auth/ folder)
app.get('/login', (req, res) => res.render('auth/login', { pageTitle: 'VIP Party | Sign in', activeNav: 'login', googleClientId: process.env.GOOGLE_CLIENT_ID || '' }));
app.get('/auth/login', (req, res) => res.render('auth/login', { pageTitle: 'VIP Party | Sign in', activeNav: 'login', googleClientId: process.env.GOOGLE_CLIENT_ID || '' }));

app.get('/signup', (req, res) => res.render('auth/signup', { pageTitle: 'साइन अप (Sign Up) | VIP Party', activeNav: 'signup' }));
app.get('/auth/signup', (req, res) => res.render('auth/signup', { pageTitle: 'साइन अप (Sign Up) | VIP Party', activeNav: 'signup' }));

// Auth Form Handlers (Connecting to same MongoDB 'users' collection)
app.post('/auth/signup', async (req, res) => {
  try {
    const { name, phone, email, district, password } = req.body;
    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanDistrict = String(district || '').trim();

    if (!cleanName || !cleanPhone || !cleanEmail || !cleanDistrict || !password) {
      return res.status(400).json({ success: false, message: 'Name, mobile, email, district and password are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Account service is temporarily unavailable. Please try again shortly.' });
    }

    const existingPhone = await User.findOne({ phone: cleanPhone }).select('_id');
    if (existingPhone) {
      return res.status(409).json({ success: false, field: 'phone', message: 'This mobile number is already registered. Please sign in.' });
    }
    const existingEmail = await User.findOne({ email: cleanEmail }).select('_id');
    if (existingEmail) {
      return res.status(409).json({ success: false, field: 'email', message: 'This email address is already registered. Please sign in.' });
    }

    const newUser = await User.create({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      district: cleanDistrict,
      password: String(password),
      uid: `VIP-USR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
    });
    console.log(`New VIP User registered: ${newUser.name} (${newUser.phone})`);
    return res.json({ success: true, message: 'Your account has been created successfully.' });
  } catch (err) {
    console.error('Signup error:', err);
    if (err?.code === 11000) {
      if (err.keyPattern?.phone || err.keyValue?.phone) {
        return res.status(409).json({ success: false, field: 'phone', message: 'This mobile number is already registered. Please sign in.' });
      }
      if (err.keyPattern?.email || err.keyValue?.email) {
        return res.status(409).json({ success: false, field: 'email', message: 'This email address is already registered. Please sign in.' });
      }
      return res.status(500).json({ success: false, message: 'Could not create your account because of a database conflict. Please try again.' });
    }
    return res.status(500).json({ success: false, message: 'Could not create your account. Please try again.' });
  }
});
app.post('/auth/login', async (req, res) => {
  try {
    const phone = String(req.body?.phone || '').replace(/\D/g, '');
    const password = String(req.body?.password || '');
    if (!/^[6-9]\d{9}$/.test(phone) || !password) {
      return res.status(400).json({ success: false, message: 'Enter your valid 10-digit mobile number and password.' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Login service is temporarily unavailable. Please try again shortly.' });
    }

    const user = await User.findOne({ phone });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Mobile number or password is incorrect.' });
    }
    setAuthCookie(res, user.uid);
    return res.json({ success: true, message: 'Signed in successfully.', redirect: '/' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Could not sign in. Please try again.' });
  }
});

app.post('/auth/logout', (req, res) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `vip_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
  res.redirect('/');
});

app.post('/auth/google', async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const credential = String(req.body?.credential || '');
    if (!clientId || !credential) {
      return res.status(400).json({ success: false, message: 'Google sign-in is not configured.' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Login service is temporarily unavailable.' });
    }

    const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyResponse.ok) {
      return res.status(401).json({ success: false, message: 'Google could not verify this sign-in. Please try again.' });
    }
    const profile = await verifyResponse.json();
    if (profile.aud !== clientId || profile.email_verified !== 'true' || !profile.email || !profile.sub) {
      return res.status(401).json({ success: false, message: 'Google account verification failed.' });
    }

    const email = profile.email.toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        uid: `VIP-GGL-${profile.sub}`,
        name: profile.name || 'VIP Member',
        phone: `google:${profile.sub}`,
        email,
        password: '',
        photoURL: profile.picture || ''
      });
    }
    setAuthCookie(res, user.uid);
    return res.json({ success: true, redirect: '/' });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ success: false, message: 'Google sign-in could not be completed.' });
  }
});

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

    let referenceId = `VIP-CON-${Date.now().toString().slice(-8)}`;
    if (mongoose.connection.readyState === 1) {
      const contactRecord = await Contact.create({
        name: senderName,
        phone: senderPhone,
        email: (email || '').trim(),
        subject: (subject || 'General Inquiry').trim(),
        message: senderMsg,
        status: 'New'
      });
      referenceId = `VIP-CON-${String(contactRecord._id).slice(-8).toUpperCase()}`;
      console.log(`📩 New VIP Contact Message from: ${senderName} (${senderPhone})`);
    }

    return res.json({
      success: true,
      referenceId,
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

// Dedicated Privacy Policy Page
app.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', {
    pageTitle: 'Privacy Policy | VIP Party (विकासशील इंसान पार्टी)',
    activeNav: 'privacy'
  });
});
app.get('/privacy', (req, res) => {
  res.render('privacy-policy', {
    pageTitle: 'Privacy Policy | VIP Party (विकासशील इंसान पार्टी)',
    activeNav: 'privacy'
  });
});

// Dedicated Terms & Conditions Page
app.get('/terms-and-conditions', (req, res) => {
  res.render('terms-and-conditions', {
    pageTitle: 'Terms & Conditions | VIP Party (विकासशील इंसान पार्टी)',
    activeNav: 'terms'
  });
});
app.get('/terms', (req, res) => {
  res.render('terms-and-conditions', {
    pageTitle: 'Terms & Conditions | VIP Party (विकासशील इंसान पार्टी)',
    activeNav: 'terms'
  });
});

// XML sitemap for public website pages
app.get('/sitemap.xml', (req, res) => {
  const siteUrl = (process.env.SITE_URL || process.env.WEBSITE_URL || 'https://vipparty.in').replace(/\/$/, '');
  const publicPaths = [
    '/',
    '/about',
    '/journey-of-mukesh-sahani',
    '/jubba-sahani',
    '/history',
    '/ideology',
    '/constitution',
    '/prerna',
    '/office',
    '/leaders',
    '/organization',
    '/officials',
    '/president',
    '/pravakta',
    '/youth',
    '/women-wing',
    '/vidhansabha',
    '/vidhan-parishad',
    '/loksabha',
    '/parliament',
    '/candidate-declaration',
    '/vidhansabha-ticket',
    '/member',
    '/donate',
    '/events',
    '/media',
    '/mission-vision',
    '/major-issues',
    '/nvs',
    '/gallery',
    '/press',
    '/download',
    '/volunteer',
    '/scholarship',
    '/candidature-up-2027',
    '/contact',
    '/privacy-policy',
    '/terms-and-conditions'
  ];

  const urls = publicPaths
    .map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`)
    .join('\n');

  res
    .status(200)
    .type('application/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
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
