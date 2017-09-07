const restify = require('restify');
const Notification = require('./models/Notification.js');
const log = require('./config/log.js');
const config = require('./config/config.json');


exports.showNotifications = function (req, res, next) {
  console.log(req.user.id);
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

exports.markRead = function (req, res, next) {
  Notification.findById(req.params.id).exec((err, notification) => {
    if(err) {
      log.error(err);
      return next(new restify.InternalServerError(err));
    }
    if(!notification) {
      return next(new restify.NotFoundError());
    }
    if(notification.user_id != req.user.id) {
      return next(new restify.ForbiddenError("You can only mark your own notifications read"));
    }

    notification.read = req.body.read;
    notification.save((err) => {
      res.json({
        success: true,
        data: notification
      });
      return next();
    })
  })
}

function validate_notification(n) {
  if(n.audience_type != 'user')
    return "Invalid audience type";
  if(!n.audience_params)
    return "You must supply at least one audience parameter";
  if(!n.service || !n.category || !n.category_name || !n.time || !n.heading || !n.body)
    return "You must fill all required fields";
  return null;
}

exports.castNotification = function (req, res, next) {
  // TODO check for correct format
  // TODO check that request came from notification cast and not a mean script kiddie

  var errors = validate_notification(req.body);
  if(errors) {
    return next(new restify.UnprocessableEntityError(errors));
  }

  saves = req.body.audience_params.length;
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

    console.log("Saving ", notification);

    notification.save((err) => {
      if(err)
        log.error(err);

      saves--;
      if(saves == 0) {
        res.json({
          success: true
        });
        return next();
      }
    });
  });
}