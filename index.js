
var nano = require('nano');
var server = nano("http://isaacs.iriscouch.com/");
var npm = server.db.use("registry");

var findDependencies = function(npm, accumulatedPackges, packageName, onNewPackage) {
	npm.get(packageName, function(err, npmPackage){
		for (version in npmPackage.versions) {
			for (dependentPackage in npmPackage.versions[version].dependencies) {
				if (!accumulatedPackges[dependentPackage])
				{
					onNewPackage(dependentPackage);
					accumulatedPackges[dependentPackage] = true;
					process.nextTick(function(){
						findDependencies(npm, accumulatedPackges, dependentPackage, onNewPackage);
					});
				}
			}
		}
		module.exports
	});
};

module.exports = function(initialPackages, onNewPackage){ 
	packages = Object.create(null);
	initialPackages.forEach(function(packageName){
		packages[packageName] = true;
		onNewPackage(packageName);
		findDependencies(npm, packages, packageName, onNewPackage);
	});
};

