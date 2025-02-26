const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const { User, Like } = require('../models')

passport.use('userSignin', new LocalStrategy(
  {
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, account, password, cb) => {
    try {
      const user = await User.findOne({ where: { account } })
      if (!user) return cb(null, false, req.flash('error_messages', '此帳號不存在'))
      if (user.role !== 'user') return cb(null, false, req.flash('error_messages', '此帳號不存在'))

      const passwordCompare = await bcrypt.compare(password, user.password)
      if (!passwordCompare) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
      return cb(null, user)
    } catch (err) {
      return cb(err)
    }
  })
)

passport.use('adminSignin', new LocalStrategy({
  usernameField: 'account',
  passwordField: 'password',
  passReqToCallback: true
},
async (req, account, password, cb) => {
  try {
    const user = await User.findOne({ where: { account } })
    if (!user) return cb(null, false, req.flash('error_messages', '此帳號不存在'))
    if (user.role !== 'admin') return cb(null, false, req.flash('error_messages', '此帳號不存在'))

    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
    return cb(null, user)
  } catch (err) {
    return cb(err)
  }
})
)

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findByPk(id, {
      include: [
        { model: Like },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
    return cb(null, user.toJSON())
  } catch (err) {
    cb(err)
  }
})

module.exports = passport
