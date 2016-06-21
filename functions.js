var jwt = require('jsonwebtoken');

module.exports = {
  middleware: function (req, res, next, role) {
    var roleUser = req.body.role || req.query.role || req.headers['x-access-role'] || null;
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if ((token & role == null) || (token & roleUser == role)) {
      // verifies secret and checks exp
      jwt.verify(token, req.app.get('secretKey'), function(err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      // if there is no token
      // return an error
      return res.status(403).json({
        success: false,
        message: 'No token provided.'
      });
    }
  }
}
