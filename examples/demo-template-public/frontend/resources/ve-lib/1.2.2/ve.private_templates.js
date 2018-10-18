(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["private_templates"] = factory();
	else
		root["VeLib"] = root["VeLib"] || {}, root["VeLib"]["private_templates"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _actions = __webpack_require__(331);
	
	var _actions2 = _interopRequireDefault(_actions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var PrivateTemplates = function PrivateTemplates() {
		_classCallCheck(this, PrivateTemplates);
	
		this.actions = _actions2.default;
	};
	
	var privateTemplates = new PrivateTemplates();
	
	Object.setPrototypeOf(privateTemplates, _actions2.default);
	
	module.exports = privateTemplates;

/***/ }),

/***/ 331:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _recipients = __webpack_require__(332);
	
	var _recipients2 = _interopRequireDefault(_recipients);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var call = VeLib.core.remote.callForData;
	var configs = VeLib.core.configs.get();
	var state = VeLib.core.state;
	
	var Actions = function () {
		function Actions() {
			_classCallCheck(this, Actions);
	
			this.saveRecipients = _recipients2.default.saveRecipients;
			this.saveRecipient = _recipients2.default.saveRecipient;
			this.removeRecipient = _recipients2.default.removeRecipient;
		}
	
		_createClass(Actions, [{
			key: "putTemplateData",
			value: function putTemplateData(data, noCommit) {
				var templateUid = state.get().remoteEntities.template.uid;
				//TODO: SET contentType to reflect user's permissions
				var callDetails = {
					method: "POST",
					url: "" + templateUid + configs.userDataAppendix,
					body: data
				};
				if (noCommit) {
					callDetails.params = {
						noCommit: true
					};
				}
	
				return call(callDetails);
			}
		}, {
			key: "getTemplateData",
			value: function getTemplateData() {
				var t = state.get().remoteEntities.template;
	
				if (t && t.userData) return Promise.resolve(t.userData);else return Promise.resolve({});
			}
		}]);
	
		return Actions;
	}();
	
	var actions = new Actions();
	exports.default = actions;

/***/ }),

/***/ 332:
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var callRaw = VeLib.core.remote.callRaw;
	var configs = VeLib.core.configs;
	var state = VeLib.core.state;
	
	var expose = {
		addRecipient: function addRecipient(recipient) {
			var url = configs.envelopesAppendix + "/" + state.get().remoteEntities.envelope.id + configs.recipientsAppendix;
	
			return callRaw({
				method: "POST",
				url: url,
				body: recipient
			}).then(function (response) {
				return response.headers.location;
			});
		},
		putRecipient: function putRecipient(recipient) {
			var url = configs.envelopesAppendix + "/" + state.get().remoteEntities.envelope.id + configs.recipientsAppendix + "/" + recipient.id;
	
			return callRaw({
				method: "PUT",
				url: url,
				body: recipient
			});
		},
	
		saveRecipient: function saveRecipient(recipient) {
			if (recipient.id) return expose.putRecipient(recipient);else return expose.addRecipient(recipient);
		},
	
		saveRecipients: function saveRecipients(recArray) {
			var promArray = [];
			recArray.forEach(function (rec) {
				return promArray.push(expose.saveRecipient(rec));
			});
			return Promise.all(promArray);
		},
	
		removeRecipient: function removeRecipient(recipient) {
			var url = configs.envelopesAppendix + "/" + state.get().remoteEntities.envelope.id + configs.recipientsAppendix + "/" + recipient.id;
	
			return callRaw({
				method: "DELETE",
				url: url
			});
		}
	};
	
	exports.default = expose;

/***/ })

/******/ })
});
;
//# sourceMappingURL=ve.private_templates.js.map