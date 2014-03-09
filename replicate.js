var Async = require('async');
var nano = require('nano');
var FindDeps = require('./');
var server = nano("http://isaacs.iriscouch.com");
var npm = server.db.use("registry");
var localCouch = nano("http://administrator:1234@127.0.0.1:5984/")
var localnpm = localCouch.db.use("copied_registry");
var fs = require('fs');

var debug = false;
var errors = []

var log = function(message){
	message = new Date().toISOString() + " : " + message; 
	if (debug) {
		console.log(message);
	}
	fs.appendFile("./replication.log", message + "\n", function(){});
}

var logError = function(message){
	message = new Date().toISOString() + " : " + message; 
	console.error(message);
	fs.appendFile("./replication.log.err", message + "\n", function(){});
}

log("starting replications...");

var replicationQueue = Async.queue(function (task, callback) {
	log("replicating " + task.packgeName + " -- waiting to be processed: " + replicationQueue.length());
	options = { create_target:true, doc_ids:[task.packgeName], continuous: false};
	localCouch.db.replicate("http://isaacs.iriscouch.com/registry", "http://administrator:1234@127.0.0.1:5984/copied_registry", options , function(err, body) {
		if (err || ! body.ok)
		{
			logError("ERRROR! package: " + JSON.stringify(task.packgeName));
			logError(body);
		} 
		log(task.packgeName + ".ok = " + body.ok);
    	callback(err);
	});
}, 100);

packages = require('./replication.json').packages;

FindDeps(packages, function(err, packgeName){
	if (err) {
		errors.push(err);
		logError("accumulated errors: " + errors);
		return logError("ERROR with package " + packgeName + ": " + err );
	}
	replicationQueue.push({packgeName: packgeName});
	log(packgeName + " pushed to queue");
});
