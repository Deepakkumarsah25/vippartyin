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

exports.renderNewsPage = (req, res) => res.render('press/news', { activeNav: 'press' });
exports.renderInterviewPage = (req, res) => res.render('press/interview', { activeNav: 'press' });
exports.renderPressReleasePage = (req, res) => res.render('press/press-release', { activeNav: 'press' });

exports.getNews = backendRequest('/api/news');
exports.getPressReleases = backendRequest('/api/media/pressrelease');
exports.getInterviews = backendRequest('/api/videos');
