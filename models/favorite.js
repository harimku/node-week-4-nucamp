const mongoose = require('mongoose');
const Schema = mongoose.Schema;  //using shorthand

// Create a schema
const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
    }]
});

// Create a model using the schema
const Favorite = mongoose.model('Favorite', favoriteSchema); //mongoose.model() returns a constructor function

module.exports = Favorite;