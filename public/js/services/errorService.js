app.controller('errorController', function($scope, $modalInstance, error) {
	$scope.error = error;
	$scope.close = function() {
		$modalInstance.dismiss('cancel');
	};
});

app.factory('errorService', ['$http', '$modal',
	function($http, $modal) {
		return {
			showError: function(error) {
				if (!modalInstance) {
					var modalInstance = $modal.open({
						templateUrl: 'template/errorModal.html',
						controller: 'errorController',
						resolve: {
							error: function() {
								return error;
							}
						}
					});
				}

				modalInstance.result.then(function(selectedItem) {}, function() {
					modalInstance = null;
				});
			}
		}
	}
]);