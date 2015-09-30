'use strict';

var mongoose = require('mongoose');
var ProjectSchema = new mongoose.Schema({
	title: String,
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	created_at: {type: Date, default: Date.now}
});

mongoose.model('Project', ProjectSchema);

