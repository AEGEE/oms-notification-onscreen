const restify = require('restify');
const Notification = require('./models/Notification.js');
const log = require('./config/log.js');
const config = require('./config/config.json');


exports.showNotifications = function (req, res, next) {
  Notification
  .find({user_id: req.user.id})
  .sort({created_at: -1})
  .exec((err, notifications) => {
    if(err) {
      log.error(err);
      return next(new restify.InternalServerError(err));
    }

    res.json(notifications);
    return next();
  });
};

exports.castNotification = function (req, res, next) {
  // TODO check for correct format
  // TODO check that request came from notification cast and not a mean script kiddie

  req.body.audience_params.forEach((user_id) => {
    notification = new Notification({
      user_id: user_id,
      service: req.body.service,
      category: req.body.category,
      category_name: req.body.category_name,
      time: req.body.time,
      heading: req.body.heading,
      heading_link: req.body.heading_link,
      heading_link_params: req.body.heading_link_params,
      heading_url: req.body.heading_url,
      body: req.body.body
    });

    notification.save((err) => {
      log.err(err);
    });
  });
}