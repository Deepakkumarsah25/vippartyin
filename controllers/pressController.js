const { News, Video, MediaGallery } = require('../models/publicContent');

const sendRows = (res, rows, key) => res.json({ success: true, count: rows.length, [key]: rows, data: rows });

const sendMongoRows = (model, filter, sort, key) => async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 30;
    const rows = await model.find(filter).sort(sort).limit(limit).lean();
    return sendRows(res, rows, key);
  } catch (error) {
    console.error(`${key} MongoDB query failed:`, error.message);
    return res.status(503).json({ success: false, message: 'Press service is unavailable.' });
  }
};

const renderFromMongo = (model, filter, sort, view, activeNav = 'press') => async (req, res) => {
  let initialItems = [];
  try {
    initialItems = await model.find(filter).sort(sort).limit(100).lean();
  } catch (error) {
    console.error(`${view} MongoDB query failed:`, error.message);
  }
  return res.render(view, { activeNav, initialItems });
};

exports.renderNewsPage = renderFromMongo(
  News,
  { active: true },
  { featured: -1, displayOrder: 1, date: -1, createdAt: -1 },
  'press/news'
);
exports.renderInterviewPage = renderFromMongo(
  Video,
  { isPublished: true, category: /^interview$/i },
  { createdAt: -1, _id: -1 },
  'press/interview'
);
exports.renderPressReleasePage = renderFromMongo(
  MediaGallery,
  { isPublished: true, category: 'pressrelease' },
  { date: -1, createdAt: -1 },
  'press/press-release'
);

exports.getNews = sendMongoRows(News, { active: true }, { featured: -1, displayOrder: 1, date: -1, createdAt: -1 }, 'news');
exports.getPressReleases = sendMongoRows(MediaGallery, { isPublished: true, category: 'pressrelease' }, { date: -1, createdAt: -1 }, 'media');
exports.getInterviews = sendMongoRows(Video, { isPublished: true, category: /^interview$/i }, { createdAt: -1, _id: -1 }, 'videos');
