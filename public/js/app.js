var app = angular.module('nodeApp', ['ngRoute', 'ui.bootstrap'])

app.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function(a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if (reverse) filtered.reverse();
    return filtered;
  };
});

app.filter('buildLabel', function() {
  return (function(state) {
    state = state.toLowerCase();
    return {
      'label-complete': state == 'complete',
      'label-released': state == 'released',
      'label-review': state == 'product owner review',
      'label-merged': state == 'merged to develop',
      'label-integration': state == 'integration testing'
    }
  });
})