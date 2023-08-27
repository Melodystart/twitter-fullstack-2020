const { Tweet, User, Like, Followship } = require('../models')

const adminController = {
  signInPage: (req, res) => {
    return res.render('admin/signin')
  },
  signIn: async (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/admin/tweets')
  },
  getTweets: async (req, res, next) => {
    try {
      let tweets = await Tweet.findAll({
        order: [['updatedAt', 'DESC']],
        include: User
      })
      tweets = tweets.map(tweet => ({
        ...tweet.toJSON(),
        simpleText: tweet.description.substring(0, 50)
      })
      )
      return res.render('admin/tweets', { tweets })
    } catch (error) {
      next(error)
    }
  },
  // deleteTweet: async (req, res, next) => {
  //   const { tweetId } = req.params
  //   try {
  //     const tweet = await Tweet.findByPk(tweetId)
  //     const replies = await Reply.findAll({ where: { TweetId: tweetId } })
  //     const likes = await Like.findAll({ where: { TweetId: tweetId } })

  //     if (!tweet) throw new Error("This tweet didn't exist!")
  //     await tweet.destroy()

  //     if (replies) await Reply.destroy({ where: { TweetId: tweetId } })

  //     if (likes) await Like.destroy({ where: { TweetId: tweetId } })

  //     return res.redirect('/admin/tweets')
  //   } catch (error) {
  //     next(error)
  //   }
  deleteTweet: (req, res, next) => {
    return Tweet.findByPk(req.params.id)
      .then(tweet => {
        if (!tweet) throw new Error("Tweet did'n exist!")
        return tweet.destroy()
      })
      .then(() => res.redirect('/admin/tweets'))
      .catch(err => next(err))
  },
  getUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        where: { role: 'user' },
        order: [['createdAt', 'DESC']]
      })

      const [tweets, follows, likes] = await Promise.all([
        Tweet.findAll({ raw: true }),
        Followship.findAll({ raw: true }),
        Like.findAll({ raw: true })
      ])

      // 推文數
      const tweetsMap = {}
      tweets.forEach(tweet => {
        if (!tweetsMap[tweet.UserId]) {
          tweetsMap[tweet.UserId] = 1
        } else {
          tweetsMap[tweet.UserId] = tweetsMap[tweet.UserId] + 1
        }
      })

      // 跟隨中 / 跟隨者數
      const followingsMap = {}
      const followersMap = {}
      follows.forEach(follow => {
        if (!followingsMap[follow.followerId]) {
          followingsMap[follow.followerId] = 1
        } else {
          followingsMap[follow.followerId] = followingsMap[follow.followerId] + 1
        }
        if (!followersMap[follow.followingId]) {
          followersMap[follow.followingId] = 1
        } else {
          followersMap[follow.followingId] = followersMap[follow.followingId] + 1
        }
      })

      // 推文被喜歡數
      const tweetLikedMap = {}
      likes.forEach(like => {
        if (!tweetLikedMap[like.TweetId]) {
          tweetLikedMap[like.TweetId] = 1
        } else {
          tweetLikedMap[like.TweetId] = tweetLikedMap[like.TweetId] + 1
        }
      })

      // 全部推文被喜歡總數
      const userLikedMap = {}
      tweets.forEach(tweet => {
        if (tweetLikedMap[tweet.id]) {
          if (!userLikedMap[tweet.UserId]) {
            userLikedMap[tweet.UserId] = 0
          }
          userLikedMap[tweet.UserId] = userLikedMap[tweet.UserId] + tweetLikedMap[tweet.id]
        }
      })

      const userData = await users.map((user, index) => ({
        ...user.toJSON(),
        tweetsCount: tweetsMap[user.id] ? tweetsMap[user.id] : 0,
        followingsCount: followingsMap[user.id] ? followingsMap[user.id] : 0,
        followersCount: followersMap[user.id] ? followersMap[user.id] : 0,
        likeCount: userLikedMap[user.id] ? userLikedMap[user.id] : 0
      }))

      // 依推文數量排序
      const sortedUser = userData.sort((a, b) => b.tweetsCount - a.tweetsCount)

      res.render('admin/users', { user: sortedUser })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = adminController
