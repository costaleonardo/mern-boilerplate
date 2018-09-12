/*
 * Posts routes file
 *
*/

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Validations
const validatePostInput = require('../../validation/post');

// @route  GET api/posts
// @desc   Get all posts
// @access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ noPostsFound: 'No posts found.'}));
});

// @route  GET api/posts/:post_id
// @desc   Get post by id
// @access Public
router.get('/:post_id', (req, res) => {
  Post.findById(req.params.post_id)
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ noPostFound: 'No post found with that ID.' }));
});

// @route  POST api/posts
// @desc   Create post
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors)
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      user: req.user.id
    });

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.json(err));
  }
);

// @route  DELETE api/posts/:post_id
// @desc   Delete post by ID
// @access Private
router.delete(
  '/:post_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.post_id)
          .then(post => {
            console.log(post);
            // Check for post owner
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notauthorized: 'User not authorized' });
            }

            // Delete
            post.remove().then(() => res.json({ success: true }));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      });
  }
);

module.exports = router;