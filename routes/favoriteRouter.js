const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
    .route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))  //handle preflight requests
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
			.then((favorites) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(favorites);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach(camp => {
                        if (!favorite.campsites.includes(camp._id)) {
                            favorite.campsites.push(camp._id);
                        }
                    });
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /favorites");
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    favorite.remove()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }
            })
            .catch(err => next(err));
        });

favoriteRouter
    .route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))  //handle preflight requests
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end(
			`GET operation not supported on /favorites/${req.params.campsiteId}`
		);
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)  //check if the campsite is valid
            .then((campsite) => {
                if (campsite) { //if campsite is valid
                    Favorite.findOne({ user: req.user._id })
                        .then((favorite) => {
                            if (favorite) { //if the user has Favorite document 
                                if (!favorite.campsites.includes(req.params.campsiteId)) {
                                    favorite.campsites.push(req.params.campsiteId);
                                    favorite.save()
                                        .then(favorite => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(favorite);
                                        })
                                        .catch(err => next(err));
                                } else {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'text/plain');
                                    res.end('That campsite is already in the list of favorites!');
                                }
                            } else { //if the user does not have associated favorite doc, create one
                                Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader("Content-Type", "application/json");
                                        res.json(favorite);
                                    })
                                    .catch((err) => next(err));
                            }
                        })
                        .catch((err) => next(err));
                } else {  //if campsite is invalid
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
					err.status = 404;
					return next(err);
                }
            })
            .catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end(
			`PUT operation not supported on /favorites/${req.params.campsiteId}`
		);
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
			.then((favorite) => {
				if (favorite) {
                    const index = favorite.campsites.indexOf(req.params.campsiteId);
                    const deleted = favorite.campsites[index];
                    if (index !== -1) {
                        favorite.campsites.splice(index, 1);  //remove 1 item at given index
                        favorite.save()
                            .then(favorite => {
                                Favorite.findById(favorite._id)
                                    .then(favorite => {
                                        console.log('Favorite Campsite Deleted!', favorite);
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            })
                            .catch(err => next(err));
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('That campsite is not in the list of favorites!');
                    }
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('There is no favorited campsite for this user!');
                }
			})
            .catch((err) => next(err));
	});

module.exports = favoriteRouter;