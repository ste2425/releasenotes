Format = function() {
	var s = arguments[0];
	for(var i = 0; i < arguments.length -1; i++) {
		var reg = new RegExp("\\{" + (i) + "\\}", "gm");
		s = s.replace(reg, arguments[i + 1]);
	}
	return s;
}

isEmpty = function(object){
    for(var prop in object){
        if (Object.prototype.hasOwnProperty.call(object, prop)) {
          return false;
        }
    }
    return true;
}

countItems = function(object) {
    var count = 0;
    for (var i in object) {
        count += object[i].length;
    }
    return count;
}

FormatDate = function(date) {
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
    var yyyy = date.getFullYear();
    return String(dd + "-" + mm + "-" + yyyy);
}