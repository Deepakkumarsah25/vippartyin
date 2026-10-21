const adminBaseUrl = () => (process.env.ADMIN_API_URL || 'http://localhost:9191').replace(/\/$/, '');

const forwardGalleryRequest = (backendPath) => async (req, res) => {
  const adminUrl = adminBaseUrl();
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

// Enhanced getPhotoAlbums: fetches list and populates photos array for each album post
exports.getPhotoAlbums = async (req, res) => {
  const adminUrl = adminBaseUrl();
  const query = new URLSearchParams(req.query).toString();

  try {
    const response = await fetch(`${adminUrl}/api/albums${query ? `?${query}` : ''}`, {
      signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Failed to fetch albums' });
    }

    const payload = await response.json();
    let albums = Array.isArray(payload) ? payload : (payload.data || []);

    if (Array.isArray(albums) && albums.length > 0) {
      // Fetch photos array for albums so each card has its multiple photos
      const enhancedAlbums = await Promise.all(
        albums.map(async (album) => {
          if (Array.isArray(album.photos) && album.photos.length > 0) {
            return album;
          }
          if (album._id) {
            try {
              const detailRes = await fetch(`${adminUrl}/api/albums/${encodeURIComponent(album._id)}`, {
                signal: AbortSignal.timeout(4000)
              });
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                if (detailData && detailData.data && Array.isArray(detailData.data.photos) && detailData.data.photos.length > 0) {
                  return {
                    ...album,
                    photos: detailData.data.photos,
                    photoCount: detailData.data.photos.length,
                    description: detailData.data.description || album.description || ''
                  };
                }
              }
            } catch (detailErr) {
              // fallback gracefully
            }
          }
          const defaultPhotos = [album.cover || album.image || album.imageUrl || album.mediaUrl].filter(Boolean);
          return {
            ...album,
            photos: defaultPhotos,
            photoCount: defaultPhotos.length
          };
        })
      );

      if (Array.isArray(payload)) {
        return res.json(enhancedAlbums);
      } else {
        payload.data = enhancedAlbums;
        return res.json(payload);
      }
    }

    return res.json(payload);
  } catch (error) {
    console.error('Gallery albums fetch error:', error.message);
    res.status(502).json({
      success: false,
      message: 'Gallery service is unavailable.'
    });
  }
};

exports.getPhotoAlbumById = async (req, res) => {
  const adminUrl = adminBaseUrl();
  try {
    const response = await fetch(`${adminUrl}/api/albums/${encodeURIComponent(req.params.id)}`, {
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Gallery album detail failed:', error.message);
    res.status(502).json({ success: false, message: 'Gallery service unavailable.' });
  }
};

exports.getGalleryVideos = forwardGalleryRequest('/api/videos');
