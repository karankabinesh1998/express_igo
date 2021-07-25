const Model = require('../Model');

const skipUrls = [
  '/admin/login'
];

module.exports = async (req, res, next) => {
  try {
    if (skipUrls.includes(req.url)) return next();
    const authToken = req?.headers?.authorization;
    if (authToken) {
      const query = `select user.id, user.email_id, user.userType from tbl_token inner join tbl_user_web as user on user.id = tbl_token.user_id where token = '${authToken}'`;
      const response = await Model.executeNativeQuery(query);
      if (response && response.length) {
        next();
      } else {
        res.status(401);
        res.send({ message: 'Not Authenticated' });
      }
    } else {
      res.status(401);
      res.send({ message: 'Not Authenticated' });
    };
  } catch(error) {
    console.log('Error while authenticating', error)
    res.status(500);
    res.send({ message: 'General error' });
  }
};
