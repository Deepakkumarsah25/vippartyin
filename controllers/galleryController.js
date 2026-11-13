const { Album, Video } = require('../models/publicContent');

const loadAlbums = async () => Album.find({ isPublished: true })
  .sort({ createdAt: -1, _id: -1 }).limit(30).lean();
const loadVideos = async () => Video.find({ isPublished: true })
  .sort({ createdAt: -1, _id: -1 }).limit(30).lean();

exports.renderPhotoGallery = async (req, res) => {
  let initialAlbums = [];
  try { initialAlbums = await loadAlbums(); }
  catch (error) { console.error('Photo gallery MongoDB query failed:', error.message); }
  res.render('media_resources/photo', {
    pageTitle: 'फोटो गैलरी | विकासशील इंसान पार्टी',
    activeNav: 'gallery',
    initialAlbums
  });
};

exports.renderVideoGallery = async (req, res) => {
  let initialVideos = [];
  try { initialVideos = await loadVideos(); }
  catch (error) { console.error('Video gallery MongoDB query failed:', error.message); }
  res.render('media_resources/video', {
    pageTitle: 'वीडियो गैलरी | विकासशील इंसान पार्टी',
    activeNav: 'gallery',
    initialVideos
  });
};

// Serve published albums directly from MongoDB. Album and photo URLs point to Cloudinary.
exports.getPhotoAlbums = async (req, res) => {
  try {
    const albums = await loadAlbums();
    return res.json({ success: true, count: albums.length, data: albums });
  } catch (error) {
    console.error('Gallery albums MongoDB query failed:', error.message);
    return res.status(503).json({ success: false, message: 'Gallery service is unavailable.' });
  }
};

exports.getPhotoAlbumById = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid album ID.' });
    }
    const album = await Album.findOne({ _id: req.params.id, isPublished: true }).lean();
    if (!album) return res.status(404).json({ success: false, message: 'Album not found.' });
    return res.json({ success: true, data: album });
  } catch (error) {
    console.error('Gallery album detail MongoDB query failed:', error.message);
    return res.status(503).json({ success: false, message: 'Gallery service is unavailable.' });
  }
};

exports.getGalleryVideos = async (req, res) => {
  try {
    const videos = await loadVideos();
    return res.json({ success: true, count: videos.length, data: videos });
  } catch (error) {
    console.error('Gallery videos MongoDB query failed:', error.message);
    return res.status(503).json({ success: false, message: 'Gallery service is unavailable.' });
  }
};
