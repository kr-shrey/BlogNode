var mongoose = require('mongoose');
var postSchema = mongoose.Schema({

  content          : String,
  post_by_id       : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  post_date_time   : { type: Date, default: Date.now },
  seen             : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  post_by_name     : String

});
module.exports = mongoose.model('Post', postSchema);
