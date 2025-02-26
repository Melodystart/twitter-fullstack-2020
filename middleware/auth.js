const helpers = require('../_helpers')

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).role === 'user') {
      return next()
    } else {
      return res.redirect('/admin/tweets')
    }
  }
  req.flash('error_messages', '使用前請先登入')
  return res.redirect('/signin')
}

const adminAuthenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).role === 'admin') {
      return next()
    } else {
      return res.redirect('/tweets')
    }
  }
  req.flash('error_messages', '使用前請先登入')
  return res.redirect('/admin/signin')
}

module.exports = {
  authenticated,
  adminAuthenticated
}
