const mongoose = require('mongoose');
const config = require('../config/config.json');

const notificationSchema = mongoose.Schema({
  user_id: {type: String, index: true},
  created_at: { type: Date, expires: config.notifications_max_age, default: Date.now },
  read: { type: Boolean, default: false},
  service: String,
  category: String,
  category_name: String,
  time: String,
  heading: String,
  heading_link: String,
  heading_link_params: mongoose.Schema.Types.Mixed,
  heading_url: String,
  body: String
}, {
  toJSON: {
    virtuals: true 
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
