const adminBaseUrls = () => [...new Set([
  'http://localhost:9191',
  process.env.ADMIN_API_URL
].filter(Boolean).map((url) => url.replace(/\/+$/, '')))];
const { Album, Video } = require('../models/publicContent');

const loadAlbums = async () => Album.find({ isPublished: true })
  .sort({ createdAt: -1, _id: -1 }).limit(30).lean();
const loadVideos = async () => Video.find({ isPublished: true })
  .sort({ createdAt: -1, _id: -1 }).limit(30).lean();

const getItemsFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  for (const key of ['data', 'albums', 'videos', 'items']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const loadFromAdmin = async (backendPath, filter = () => true) => {
  for (const adminUrl of adminBaseUrls()) {
    try {
      const response = await fetch(`${adminUrl}${backendPath}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;
      const rows = getItemsFromPayload(await response.json()).filter(filter);
      if (rows.length) return rows.slice(0, 30);
    } catch (error) {
      console.warn(`Gallery admin API request failed (${backendPath}, ${adminUrl}):`, error.message);
    }
  }
  return [];
};

const forwardGalleryRequest = (backendPath) => async (req, res) => {
  const query = new URLSearchParams(req.query).toString();

  for (const adminUrl of adminBaseUrls()) {
    try {
      const response = await fetch(`${adminUrl}${backendPath}${query ? `?${query}` : ''}`, {
        signal: AbortSignal.timeout(5000)
      });
      const body = await response.text();
      if (!response.ok) continue;

      return res
        .status(response.status)
        .type(response.headers.get('content-type') || 'application/json')
        .send(body);
    } catch (error) {
      console.warn(`Gallery API proxy failed (${backendPath}, ${adminUrl}):`, error.message);
    }
  }

  return res.status(502).json({ success: false, message: 'Gallery service is unavailable.' });
};

exports.renderPhotoGallery = async (req, res) => {
  let initialAlbums = await loadFromAdmin('/api/albums?limit=30');
  if (!initialAlbums.length) {
    try { initialAlbums = await loadAlbums(); }
    catch (error) { console.error('Photo gallery MongoDB query failed:', error.message); }
  }
  res.render('media_resources/photo', {
    pageTitle: 'फोटो गैलरी | विकासशील इंसान पार्टी',
    activeNav: 'gallery',
    initialAlbums
  });
};

exports.renderVideoGallery = async (req, res) => {
  let initialVideos = await loadFromAdmin('/api/videos?limit=30', (item) => item.isPublished !== false);
  if (!initialVideos.length) {
    try { initialVideos = await loadVideos(); }
    catch (error) { console.error('Video gallery MongoDB query failed:', error.message); }
  }
  res.render('media_resources/video', {
    pageTitle: 'वीडियो गैलरी | विकासशील इंसान पार्टी',
    activeNav: 'gallery',
    initialVideos
  });
};

// Enhanced getPhotoAlbums: fetches list and populates photos array for each album post
exports.getPhotoAlbums = async (req, res) => {
  const query = new URLSearchParams(req.query).toString();

  for (const adminUrl of adminBaseUrls()) {
    try {
      const response = await fetch(`${adminUrl}/api/albums${query ? `?${query}` : ''}`, {
        signal: AbortSignal.timeout(6000)
      });

      if (!response.ok) continue;

      const payload = await response.json();
      const albums = getItemsFromPayload(payload);

      if (albums.length > 0) {
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

        if (Array.isArray(payload)) return res.json(enhancedAlbums);
        payload.data = enhancedAlbums;
        return res.json(payload);
      }

      return res.json(payload);
    } catch (error) {
      console.warn(`Gallery albums fetch failed (${adminUrl}):`, error.message);
    }
  }
  return res.status(502).json({ success: false, message: 'Gallery service is unavailable.' });
};

exports.getPhotoAlbumById = async (req, res) => {
  for (const adminUrl of adminBaseUrls()) {
    try {
      const response = await fetch(`${adminUrl}/api/albums/${encodeURIComponent(req.params.id)}`, {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      if (response.ok || response.status < 500) return res.status(response.status).json(data);
    } catch (error) {
      console.warn(`Gallery album detail failed (${adminUrl}):`, error.message);
    }
  }
  return res.status(502).json({ success: false, message: 'Gallery service unavailable.' });
};

exports.getGalleryVideos = forwardGalleryRequest('/api/videos');
