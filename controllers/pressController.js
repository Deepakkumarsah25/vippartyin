const { News, Video, MediaGallery } = require('../models/publicContent');

const getBackendUrls = () => [...new Set([
  'http://localhost:9191',
  process.env.ADMIN_API_URL
].filter(Boolean).map((url) => url.replace(/\/+$/, '')))];

const getItemsFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  for (const key of ['data', 'news', 'videos', 'media', 'items']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const backendRequest = (backendPath) => async (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  let emptyResponse = null;

  try {
    for (const backendUrl of getBackendUrls()) {
      try {
        const response = await fetch(`${backendUrl}${backendPath}${query ? `?${query}` : ''}`, {
          signal: AbortSignal.timeout(5000)
        });
        const body = await response.text();
        if (!response.ok) continue;

        let payload;
        try { payload = JSON.parse(body); } catch { payload = null; }
        if (getItemsFromPayload(payload).length > 0) {
          return res.status(response.status)
            .type(response.headers.get('content-type') || 'application/json')
            .send(body);
        }
        emptyResponse = { status: response.status, contentType: response.headers.get('content-type'), body };
      } catch (error) {
        console.warn(`Press API request failed (${backendPath}, ${backendUrl}):`, error.message);
      }
    }

    if (emptyResponse) {
      return res.status(emptyResponse.status)
        .type(emptyResponse.contentType || 'application/json')
        .send(emptyResponse.body);
    }
    return res.status(502).json({ success: false, message: 'Press service is unavailable.' });
  } catch (error) {
    console.error(`Press API request failed (${backendPath}):`, error.message);
    res.status(502).json({ success: false, message: 'Press service is unavailable.' });
  }
};

const renderWithMongoData = (model, filter, sort, view, backendPath, remoteFilter = () => true) => async (req, res) => {
  let initialItems = [];
  for (const backendUrl of getBackendUrls()) {
    try {
      const response = await fetch(`${backendUrl}${backendPath}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;
      const payload = await response.json();
      const rows = getItemsFromPayload(payload).filter(remoteFilter);
      if (rows.length) {
        initialItems = rows.slice(0, 30);
        break;
      }
    } catch (error) {
      console.warn(`${view} admin API request failed:`, error.message);
    }
  }

  if (!initialItems.length) {
    try {
      initialItems = await model.find(filter).sort(sort).limit(30).lean();
    } catch (error) {
      console.error(`${view} MongoDB query failed:`, error.message);
    }
  }

  res.render(view, { activeNav: 'press', initialItems });
};

exports.renderNewsPage = renderWithMongoData(
  News,
  { active: true },
  { featured: -1, displayOrder: 1, date: -1, createdAt: -1 },
  'press/news',
  '/api/news?limit=30',
  (item) => item.active !== false
);
exports.renderInterviewPage = renderWithMongoData(
  Video,
  { isPublished: true, category: /^interview$/i },
  { createdAt: -1, _id: -1 },
  'press/interview',
  '/api/videos?limit=30',
  (item) => item.isPublished !== false && String(item.category || '').toLowerCase() === 'interview'
);
exports.renderPressReleasePage = renderWithMongoData(
  MediaGallery,
  { isPublished: true, category: 'pressrelease' },
  { date: -1, createdAt: -1 },
  'press/press-release',
  '/api/media/pressrelease',
  (item) => item.isPublished !== false && String(item.category || '').toLowerCase() === 'pressrelease'
);

exports.getNews = backendRequest('/api/news');
exports.getPressReleases = backendRequest('/api/media/pressrelease');
exports.getInterviews = backendRequest('/api/videos');
