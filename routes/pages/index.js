const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')

const admin = require('./modules/admin')
const followships = require('./modules/followships')
const replies = require('./modules/replies')
const tweets = require('./modules/tweets')
const users = require('./modules/users')

// Controllers
const userController = require('../../controllers/pages/user-controller')

// middleware
const { generalErrorHandler } = require('../../middleware/error-handler')
const { authenticated, adminAuthenticated } = require('../../middleware/auth')

// user signup
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

// user signin
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('userSignin', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

// user logout
router.get('/logout', userController.logout)

// admin route
router.use('/admin', adminAuthenticated, admin)

// followship oute
router.use('/followships', authenticated, followships)

// reply route
router.use('/replies', authenticated, replies)

// tweets route
router.use('/tweets', authenticated, tweets)

// users route
router.use('/users', authenticated, users)

router.use('/', (req, res) => res.redirect('/tweets'))
router.use('/', generalErrorHandler)

module.exports = router
