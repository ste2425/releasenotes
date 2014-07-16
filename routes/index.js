//Custom Modules
var TCLive = require('../youtrack/index.js');

exports.renderIndex = function() {
	return function(req, res) {
		res.render('index');
	}
};

exports.getReleaseVersions = function() {
	return function(req, res) {
		TCLive.getReleaseVersions(3, function(err, ReleaseVersions) {
			res.status(err ? 500 : 200).send(err ? {
				Info: err,
				Message: 'Error getting release versions.'
			} : ReleaseVersions);
		})
	}
}

exports.getItems = function(filedb, walk) {
	return function(req, res) {
		TCLive.getEntries(req.query.version, function(err, entries, hotfix) {
			if (err) {
				res.status(500).send({
					info: err,
					message: 'Error getting data.'
				});
			} else {
				TCLive.appendHotfixes(entries, hotfix, function(err, results) {
					res.status(err ? 500 : 200).send(err ? {
						Info: err,
						Message: 'Error getting release versions.'
					} : results);
				});
			}
		});
	}
}