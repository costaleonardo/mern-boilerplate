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

// @route  POST api/posts/like/:post_id
// @desc   Like post
// @access Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this post' });
          }

          
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

// @route  POST api/posts/unlike/:post_id
// @desc   Unlike post with ID
// @access Private
router.post(
  '/unlike/:post_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this post' });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

// @router POST api/posts/comment/:post_id
// @desc   Add comment to a post
// @access Private
router.post(
  '/comment/:post_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.json(400).json(errors);
    }

    Post
      .findById(req.params.post_id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          user: req.user.id
        };

        post.comments.unshift(newComment);

        post
          .save()
          .then(post => res.json(post))
          .catch(err => res.status(404).json(err));
      })
      .catch(err => res.status(404).json({ postNotFound: 'No post found.' }));
  }
);

// @route  DELETE api/posts/comment/:post_id/:comment_id
// @desc   Delete comment from post by id
// @access Private
router.delete(
  '/comment/:post_id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post
    .findById(req.params.post_id)
    .then(post => {
      // Check if comment exists
      if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({ commentDoesNotExist: 'Comment does not exist.' });
      }

      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      post.comments.splice(removeIndex, 1);

      post
        .save()
        .then(post => res.json(post))
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json({ commentNotFound: 'No comment found.' }));
  }
);

module.exports = router;