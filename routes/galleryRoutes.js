const express = require('express');
const {
  getPhotoAlbums,
  getGalleryVideos,
  renderPhotoGallery,
  renderVideoGallery
} = require('../controllers/galleryController');

const router = express.Router();

router.get('/albums', getPhotoAlbums);
router.get('/videos', getGalleryVideos);
router.get('/photo', renderPhotoGallery);
router.get('/video', renderVideoGallery);

module.exports = router;
