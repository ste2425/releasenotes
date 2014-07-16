app.controller('nodeController', function($scope, $http, $route, $timeout, youTrackService, errorService) {
    $scope.selectedObjectes = [];
    $scope.Errors = [];
    $scope.loaded = 0;
    $scope.displayDataObject = {};
    $scope.dataObject = {};
    addResizeListener();
    $scope.ReleaseVersions = [];
    $scope.ready = false;
    $scope.releasesLoading = false;
    $scope.dataLoading = false;
    $scope.selectedVersion = "";
    $scope.itemType = 'ALL'

    $scope.selectRelease = function(Version, type) {
        if (Version.substring(0, Version.indexOf('.')) < 5) {
            type = 'HR';
        }
        $scope.showHide(Version, type);
    }
    $scope.showHide = function(Version, type) {
        $scope.itemType = type;
        if (!$scope.dataLoading) {
            $scope.selectedVersion = Version;
            $scope.displayItem = [];

            for (var i in $scope.dataObject) {
                if ($scope.dataObject[i].version == Version) {
                    $scope.displayItem.push({
                        Type: 'Feature',
                        Subsystems: angular.copy($scope.dataObject[i].details.Feature),
                        Count: countItems($scope.dataObject[i].details.Feature)
                    });
                    $scope.displayItem.push({
                        Type: 'Enhancement',
                        Subsystems: angular.copy($scope.dataObject[i].details.Enhancement),
                        Count: countItems($scope.dataObject[i].details.Enhancement)
                    });
                    $scope.displayItem.push({
                        Type: 'Bug',
                        Subsystems: angular.copy($scope.dataObject[i].details.Bug),
                        Count: countItems($scope.dataObject[i].details.Bug)
                    });
                    $scope.displayItem.push({
                        Type: 'Hotfixes',
                        Subsystems: angular.copy($scope.dataObject[i].details.Hotfix),
                        Count: countItems($scope.dataObject[i].details.Hotfix)
                    });
                    break;
                }
            }
            if (type && type != 'ALL') {
                $scope.filter(type);
            }
            $timeout(resize);

        }
    }

    $scope.releasesLoading = true;
    youTrackService.getReleaseVersions(function(err, versions) {
        if (err) {
            $scope.releasesLoading = false;
            errorService.showError(err.Error);
        } else {
            versions.Data.forEach(function(item, i, arr) {
                if (item.released) {
                    arr[i].releaseDateFormatted = " - Released (" + FormatDate(new Date(parseInt(item.releaseDate))) + ")";
                } else {
                    arr[i].releaseDateFormatted = " - Coming Soon.";
                }
            });
            $scope.ReleaseVersions = versions.Data;
            $scope.releasesLoading = false;
            $scope.getData();
        }
    });

    $scope.noRecords = function(object) {
        return isEmpty(object);
    }
    $scope.noRecordsAll = function(object) {
        if ($scope.noRecords(object.Bug) && $scope.noRecords(object.Feature) && $scope.noRecords(object.Enhancement)) {
            return true;
        }

        return false;
    }
    $scope.filter = function(type) {
        for (var i in $scope.displayItem) {
            var count = 0;
            for (var y in $scope.displayItem[i].Subsystems) {
                var items = $scope.displayItem[i].Subsystems[y];
                if (items) {
                    items = items.filter(function(item) {
                        return item.id.indexOf(type) != -1;
                    });
                }
                if (items.length == 0) {
                    delete $scope.displayItem[i].Subsystems[y];
                } else {
                    count += items.length;
                    $scope.displayItem[i].Subsystems[y] = items;
                }
            }
            $scope.displayItem[i].Count = count;
        }
    }
    $scope.getData = function() {
        $scope.dataLoading = true;
        youTrackService.getData($scope.ReleaseVersions, function(err, data) {
            if (err) {
                $scope.dataLoading = false;
            } else {
                $scope.dataObject = data.Data;
                $scope.dataLoading = false;
                $scope.selectRelease($scope.ReleaseVersions[0].value, 'ALL')
            }
        });
    }
});

function addResizeListener() {
    resize();
    if (window.addEventListener)
        window.addEventListener("resize", resize, false);
    else
        document.body.onresize = resize;

}

function resize() {
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var height2 = (height - (document.getElementById("title").offsetHeight + document.getElementById("navigation").offsetHeight + 10));

    if ($('.panel-body').get()) {
        $('.panel-body').height((height2 - 225) > 200 ? height2 - 225 : 200);
    }
}