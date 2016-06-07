var mongoose = require('mongoose');
mongoose.connect('mongodb://jonathanabout:y4LGlfmvY2BS5KA4eLM9509FW0pu@ds027505.mlab.com:27505/sdwimmobackend', function(err) {
    if (err) return console.log(err)
});
