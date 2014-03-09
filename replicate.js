var Async = require('async');
var nano = require('nano');
var FindDeps = require('./');
var server = nano("http://isaacs.iriscouch.com");
var npm = server.db.use("registry");
var localCouch = nano("http://administrator:1234@127.0.0.1:5984/")
var localnpm = localCouch.db.use("copied_registry");

var replicationQueue = Async.queue(function (task, callback) {
    packgeName = task.packgeName;
	options = { create_target:true, doc_ids:[packgeName], continuous: false};
	localCouch.db.replicate("http://isaacs.iriscouch.com/registry", "http://administrator:1234@127.0.0.1:5984/copied_registry", options , function(err, body) {
		if (err || ! body.ok)
		{
			console.error("ERRROR! package: " + packgeName);
			console.log(body);
		} 
		console.log(packgeName + ".ok = " + body.ok);
    	callback(err);
	});
}, 2);

FindDeps(["traverse"], function(packgeName){
	replicationQueue.push({packgeName: packgeName});
	console.log(packgeName + " was found and pushed to queue");
});
