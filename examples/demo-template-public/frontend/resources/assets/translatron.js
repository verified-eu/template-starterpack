"use strict";
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Google Sheets downloader with fallback

	Example.js:
	//                                                          Sheet ID                                       API key
	//                                                              |                                             |
	var gSheet = new Translatron($scope, $http, "1IYQWYkWHRG5WFqE5PZZJQyMcZSQzUeR_TWwuuaHcNac", "AIzaSyAQ_9O5X3xyckpNa2yZ3W7I-1dVxHk5Scc");
	gSheet.loadData("trans", "translations", "A1:F");
	
	Will load the range (optional) from the sheet named 'translations' into $scope.trans,
	where the first column becomes the keys and the preceding columns becomes an array
	with the different translations for that key.
	If there are any errors it will try to fallback to 'assets/translations.json'.
	
	
	Example.html:
	
	<script src="../common/assets/translatron.js"></script>
	<ve-input cols="3" key="givenName" label="{{trans.givenName[lang]}}"></ve-input>
	
	
	-mBruksaas
 */

var Translatron = function () {
	function Translatron(scope, http, googleID, googleKey) {
		_classCallCheck(this, Translatron);
		
		this.scope = scope;
		this.http = http;
		this.gID = googleID;
		this.gKey = googleKey;
	}
	
	_createClass(Translatron, [{
		key: "loadData",
		value: function loadData(intoArray, sheetName, range) {
			function format(data) {
				var ret = {};
				for (var i = 1; i <= data.length - 1; i++) {
					var key = data[i][0];
					ret[key] = {};
					for (var l = 1; l <= data[0].length - 1; l++) {
						var lang = data[0][l];
						var val = data[i][l];
						ret[key][lang] = val === "null" ? null : val;
					}
				}
				return ret;
			}
			
			range = range ? "!" + range : "";
			return this.http.get("https://sheets.googleapis.com/v4/spreadsheets/" + this.gID + "/values/" + sheetName + range + "/?key=" + this.gKey).then(function (d) {
				this.scope[intoArray] = format(d.data.values);
			}.bind(this), function (err) {
				console.log("Error loading '" + sheetName + "' from Google, using fallback");
				this.http.get("assets/" + sheetName + ".json").then(function (d) {
					this.scope[intoArray] = format(d.data.values);
					console.log("Got fallback '" + sheetName + "': ", this.scope[intoArray]);
				}.bind(this), function (err) {
					console.log("Error: Fallback " + sheetName + ".json not found");
				}.bind(this));
			}.bind(this));
		}
	}]);
	
	return Translatron;
}();