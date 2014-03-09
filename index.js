var Hoek = require('hoek');
var nano = require('nano');
var server = nano("http://isaacs.iriscouch.com/");
var npm = server.db.use("registry");

var findDependencies = function(npm, accumulatedPackges, packageName, onNewPackage) {
	npm.get(packageName, function(err, npmPackage){
		if (err) {
			return onNewPackage(err, packageName);
		}
		for (version in npmPackage.versions) {
			var currentVersion = npmPackage.versions[version];
			dependencies = [];
			if (currentVersion.dependencies)
				dependencies = Object.keys(currentVersion.dependencies)
			if (currentVersion.peerDependencies)
				dependencies = dependencies.concat(Object.keys(currentVersion.peerDependencies));
			dependencies.forEach(function(dependentPackage){
				if (!accumulatedPackges[dependentPackage])
				{
					onNewPackage(undefined, dependentPackage);
					accumulatedPackges[dependentPackage] = true;
					process.nextTick(function(){
						findDependencies(npm, accumulatedPackges, dependentPackage, onNewPackage);
					});
				}
			});
		}
		module.exports
	});
};

module.exports = function(initialPackages, onNewPackage){ 
	packages = Object.create(null);
	initialPackages.forEach(function(packageName){
		packages[packageName] = true;
		onNewPackage(undefined, packageName);
		findDependencies(npm, packages, packageName, onNewPackage);
	});
};

