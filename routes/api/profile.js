/*
 * Profile routes file
 *
*/

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile model
const Profile = require('../../models/Profile');

// Load User profile
const User = require('../../models/User');

// @route GET api/profile/test
// @desc  Tests profile route
// @desc  Public
router.get('/test', (req, res) => res.json({ msg: 'Profiles works.' }));

// @route  GET api/profile
// @desc   Get current users profile
// @access Private
router.get(
  '/', 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
      let errors = {};
       Profile.findOne({ user: req.user.id })
          .then(profile => {
              if (!profile) {
                  errors.noprofile = 'There is no profile for this user.';
                  return res.status(404).json(errors);
              }
              res.json(profile);
          })
          .catch(err => res.status(404).json(err));
  }
);

// @route POST api/profile
// @desc Create or edit user profile
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let errors = {};
    let profileFields = {};
    
    profileFields.user = req.user.id;

    if (req.body.username) {
      profileFields.username = req.body.username;
    }

    if (req.body.company) {
      profileFields.company = req.body.company;
    }

    if (req.body.website) {
      profileFields.website = req.body.website;
    }

    if (req.body.location) {
      profileFields.location = req.body.location;
    }

    if (req.body.bio) {
      profileFields.bio = req.body.bio;
    }

    if (req.body.status) {
      profileFields.status = req.body.status;
    }

    if (req.body.githubusername) {
      profileFields.githubusername = req.body.githubusername;
    }

    // Split skills into arry
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }

    profileFields.social = {};

    if (req.body.youtube) {
      profileFields.social.youtube = req.body.youtube;
    }

    if (req.body.twitter) {
      profileFields.social.twitter = req.body.twitter;
    }

    if (req.body.facebook) {
      profileFields.social.facebook = req.body.facebook;
    }

    if (req.body.linkedin) {
      profileFields.social.linkedin = req.body.linkedin;
    }

    if (req.body.instagram) {
      profileFields.social.instagram = req.body.instagram;
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          )
            .then(profile => res.json(profile));
        } else {
          // Check if handle exists
          Profile.findOne({ handle: profileFields })
            .then(profile => {
              if (profile) {
                errors.handle = 'Username already exists.';
                res.status(400).json(erros);
              }

              // Save profile
              new Profile(profileFields).save()
                .then(profile => res.json(profile));
            });
        }
      });
  }
);

module.exports = router;