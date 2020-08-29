const mongoose = require('mongoose');
// Create a schema
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
    }]
  }, {
    timestamps: true
});

// Create a model using the schema
const Favorite = mongoose.model('Favorite', favoriteSchema); //mongoose.model() returns a constructor function

module.exports = Favorite;