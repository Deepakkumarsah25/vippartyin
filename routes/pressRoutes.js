const express = require('express');
const {
  renderNewsPage,
  renderInterviewPage,
  renderPressReleasePage,
  getNews,
  getPressReleases,
  getInterviews
} = require('../controllers/pressController');

const router = express.Router();

router.get('/press', (req, res) => res.redirect('/news'));
router.get('/news', renderNewsPage);
router.get('/interview', renderInterviewPage);
router.get('/press-release', renderPressReleasePage);

router.get('/api/press/news', getNews);
router.get('/api/press/releases', getPressReleases);
router.get('/api/press/interviews', getInterviews);

module.exports = router;
