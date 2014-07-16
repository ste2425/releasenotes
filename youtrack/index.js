var http = require("http"),
	querystring = require('querystring'),
	async = require('async'),
	issuesUrl = __CONFIG.youtrack.issueUrl + "?",
	getVersionsUrl = __CONFIG.youtrack.releaseVersionUrl,
	_cookie;


exports.getReleaseVersions = function(limit, callback) {
	GetLoginCookie(function(err, Cookie) {
		makeGetUrlCall(getVersionsUrl, Cookie, function(err, versions) {
			if (versions && versions.version) {
				callback(err, versions.version.slice(versions.version.length - limit));
			} else if (versions && versions.value) {
				callback(err || versions.value, []);
			} else {
				callback(err, []);
			}
		});
	});
}

exports.appendHotfixes = function(List, Hotfix, callback) {
	var out = [];

	for (var i in Hotfix) {
		var tmphotfixes = Hotfix[i].field.hotfix[0].split(',');
		tmphotfixes.forEach(function(item) {
			out.push({
				id: Hotfix[i].id,
				summary: Hotfix[i].field.summary,
				description: Hotfix[i].field.description,
				type: Hotfix[i].field.type[0],
				state: Hotfix[i].field.state[0],
				subsystem: Hotfix[i].field.subsystem[0],
				hotfix: item
			});
		})
	}

	var out = group(out, function(groupBy) {
		return [groupBy.hotfix.substring(0, groupBy.hotfix.lastIndexOf('.')), 'Fix: ' + groupBy.hotfix.substring(groupBy.hotfix.lastIndexOf('.') + 1)];
	});
	for (var i in out) {
		for (var y in List) {
			if (List[y].version == i) {
				List[y].details.Hotfix = out[i];
			}
		}
	}
	callback(null, List);
}

exports.getEntries = function(versionNumbers, callback) {
	var hotfixArray = [];
	var intrimVersion = "",
		lastVersion = versionNumbers[versionNumbers.length - 1];

	async.series([

		function(seriesCB) {
			//getLoginCookie
			GetLoginCookie(function(err, cookie) {
				if (err) {
					seriesCB(err, null);
				} else {
					_cookie = cookie;
					seriesCB();
				}
			});
		},
		function(seriesCB) {
			async.map(versionNumbers, function(version, mapCB) {
				var objectArray = [];
				//build url
				var searchForBlank = version == lastVersion ? "Release Version: [blank]" : "";
				version = version.replace('_[blank]', '');
				var filterString = Format('Release Notes: Yes Release Version: {0} {1} Subsystem: -[blank] Subsystem: -Security State: complete State: released State: {Merged to develop} State: {Integration Testing} State: {Product Owner Review}', version, searchForBlank);
				var query = querystring.stringify({
					filter: filterString,
					with: ['comment',
						'summary',
						'subsystem',
						'description',
						'state',
						'type',
						'hotfix'
					],
					max: '100'
				});
				//get items
				makeGetUrlCall(issuesUrl + query, _cookie, function(err, res) {
					if (err) {
						mapCB(err, null);
					} else {
						//convert field object from key value array to object
						for (var i in res.issue) {
							//add release version to item
							var field = {
								version: version
							};
							for (var y in res.issue[i].field) {
								field[res.issue[i].field[y].name.toLowerCase()] = res.issue[i].field[y].value;
							}
							res.issue[i].field = field;
						}
						//Find any items marked as hotfix and seperate
						res.issue.forEach(function(item, i, arr) {

							if (item.field.hotfix && item.field.hotfix != '[blank]') {
								hotfixArray.push(item);
							}
							objectArray.push({
								id: item.id,
								summary: item.field.summary,
								description: item.field.description,
								type: item.field.type[0],
								state: item.field.state[0],
								subsystem: item.field.subsystem[0]
							});

						});
						mapCB(null, {
							version: version,
							details: group(objectArray, function(item) {
								return [formatType(item.type), item.subsystem];
							})
						});
					}
				});
			}, seriesCB);
		}
	], function(err, rs) {
		if (err) {
			callback(err);
		} else {
			callback(null, rs[1], hotfixArray);
		}
	})
}

function formatType(type) {
	if (type == "Bug" ||
		type == "Cosmetic" ||
		type == "Usability") {
		return "Bug";
	}

	if (type == "Feature" ||
		type == "User Story" ||
		type == "Task") {
		return "Feature";
	}

	if (type == "Enhancement" ||
		type == "Performance") {
		return "Enhancement";
	}

	return "";
}

var group = function(arr, by) {
	if (arr) {
		var groups = {},
			group,
			values,
			i = arr.length,
			j,
			key,
			group_keys,
			out = [];

		// make sure we specified how we want it grouped
		if (!by) {
			return arr;
		}
		while (i--) {

			// find out group values for this item
			values = (typeof(by) === "function" && by(arr[i]) ||
				typeof arr[i] === "object" && arr[i][by] ||
				arr[i]);

			// make sure our group values are an array
			values = values instanceof Array && values || [values];

			// recursively group
			group = groups;
			for (j = 0; j < values.length; j++) {
				key = values[j];
				group = (group[key] || (group[key] = j === values.length - 1 && [] || {}));
			}

			// for the last group, push the actual item onto the array
			group = (group instanceof Array && group || []).push(arr[i]);
		}

		return groups;
	}
};

function GetLoginCookie(callback) {
	var options = {
		host: __CONFIG.youtrack.host,
		port: __CONFIG.youtrack.port,
		path: __CONFIG.youtrack.loginUrl + "?" + querystring.stringify({
			login: __CONFIG.login.username,
			password: __CONFIG.login.password
		}),
		method: "POST"
	}
	http.request(options, function(res) {
		res.on('data', function(d) {});
		res.on('end', function() {
			callback(null, res.headers['set-cookie']);
		});
	}).on("error", function(e) {
		callback(e, null);
	}).end();
}

function makeGetUrlCall(url, cookie, callback) {
	var options = {
		host: __CONFIG.youtrack.host,
		port: __CONFIG.youtrack.port,
		path: url,
		headers: {
			"Cookie": cookie,
			"Accept": "application/json"
		}
	}
	var data = "";
	http.get(options, function(response) {

		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			try {
				data = JSON.parse(data);
			} catch (e) {
				callback(e, null);
			}
			callback(null, data);
		});
	}).on("error", function(e) {
		callback(e, null);
	});
}

Format = function() {
	var s = arguments[0];
	for (var i = 0; i < arguments.length - 1; i++) {
		var reg = new RegExp("\\{" + (i) + "\\}", "gm");
		s = s.replace(reg, arguments[i + 1]);
	}
	return s;
}