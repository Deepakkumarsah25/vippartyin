const mongoose = require('mongoose');

// These model names mirror the content collections used by the admin app.
const modelFor = (name) => mongoose.models[name] || mongoose.model(name, new mongoose.Schema({}, { strict: false }));

module.exports = {
  Album: modelFor('albumsgallery'),
  Video: modelFor('videosgallery'),
  News: modelFor('News'),
  MediaGallery: modelFor('MediaGallery')
};
