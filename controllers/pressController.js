const { News, Video, MediaGallery } = require('../models/publicContent');

const backendRequest = (backendPath) => async (req, res) => {
  const backendUrl = (process.env.ADMIN_API_URL || 'http://localhost:9191').replace(/\/$/, '');
  const query = new URLSearchParams(req.query).toString();

  try {
    const response = await fetch(`${backendUrl}${backendPath}${query ? `?${query}` : ''}`);
    const body = await response.text();
    res.status(response.status)
      .type(response.headers.get('content-type') || 'application/json')
      .send(body);
  } catch (error) {
    console.error(`Press API request failed (${backendPath}):`, error.message);
    res.status(502).json({ success: false, message: 'Press service is unavailable.' });
  }
};

const renderWithMongoData = (model, filter, sort, view) => async (req, res) => {
  let initialItems = [];
  try {
    initialItems = await model.find(filter).sort(sort).limit(30).lean();
  } catch (error) {
    console.error(`${view} MongoDB query failed:`, error.message);
  }
  res.render(view, { activeNav: 'press', initialItems });
};

exports.renderNewsPage = renderWithMongoData(
  News,
  { active: true },
  { featured: -1, displayOrder: 1, date: -1, createdAt: -1 },
  'press/news'
);
exports.renderInterviewPage = renderWithMongoData(
  Video,
  { isPublished: true, category: /^interview$/i },
  { createdAt: -1, _id: -1 },
  'press/interview'
);
exports.renderPressReleasePage = renderWithMongoData(
  MediaGallery,
  { isPublished: true, category: 'pressrelease' },
  { date: -1, createdAt: -1 },
  'press/press-release'
);

exports.getNews = backendRequest('/api/news');
exports.getPressReleases = backendRequest('/api/media/pressrelease');
exports.getInterviews = backendRequest('/api/videos');
