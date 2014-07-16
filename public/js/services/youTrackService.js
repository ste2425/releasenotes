app.factory('youTrackService', function($http) {
	return {
		getReleaseVersions: function(CB) {
			$http({
				method: 'GET',
				url: '/getreleaseversions'
			}).success(function(data, status, headers, config) {
				CB(null, {
					Status: status,
					Headers: headers,
					Data: data
				});
			}).error(function(data, status, headers, config) {
				CB({
					Error: data,
					Status: status,
					Headers: headers
				}, null);
			});
		},
		getData: function(versions, CB) {
			var queryParameters = [];

			for (var y = versions.length - 1; y >= 0; y--) {
				if (versions[y].released == 'false') {
					versions[y].value = versions[y].value + '_[blank]';
					break;
				}
			}
			versions.forEach(function(item){
				queryParameters.push(item.value);
			});
			
			$http({
				method: 'GET',
				url: '/data',
				params: {
					version: queryParameters
				}
			}).success(function(data, status, headers, config) {
				CB(null, {
					Status: status,
					Headers: headers,
					Data: data
				});
			}).error(function(data, status, headers, config) {
				CB({
					Error: data,
					Status: status,
					Headers: headers
				}, null);
			});
		}
	}
})