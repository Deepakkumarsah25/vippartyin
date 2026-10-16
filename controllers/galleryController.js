const forwardGalleryRequest = (backendPath) => async (req, res) => {
  const adminUrl = (process.env.ADMIN_API_URL ).replace(/\/$/, '');
  const query = new URLSearchParams(req.query).toString();

  try {
    const response = await fetch(`${adminUrl}${backendPath}${query ? `?${query}` : ''}`);
    const body = await response.text();

    res
      .status(response.status)
      .type(response.headers.get('content-type') || 'application/json')
      .send(body);
  } catch (error) {
    console.error(`Gallery API proxy failed (${backendPath}):`, error.message);
    res.status(502).json({
      success: false,
      message: 'Gallery service is unavailable.'
    });
  }
};

exports.renderPhotoGallery = (req, res) => {
  res.render('media_resources/photo', {
    pageTitle: 'फोटो गैलरी | विकासशील इंसान पार्टी',
    activeNav: 'gallery'
  });
};

exports.renderVideoGallery = (req, res) => {
  res.render('media_resources/video', {
    pageTitle: 'वीडियो गैलरी | विकासशील इंसान पार्टी',
    activeNav: 'gallery'
  });
};

exports.getPhotoAlbums = forwardGalleryRequest('/api/albums');
exports.getGalleryVideos = forwardGalleryRequest('/api/videos');

