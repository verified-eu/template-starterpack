var veForm = angular.module('VeForm', []);

veForm.service('VeForm', function ( $http ) {
	this.toDash = function(str) {
		return str.replace(/\W+/g, '-')
							.replace(/([a-z\d])([A-Z])/g, '$1-$2');
	}
	this.mod11 = function (input) {
		var control=2, sum=0;
		for ( var i=input.length-2; i >= 0; --i ) {
			sum += input.charAt(i)*control;
			if ( ++control > 7 ) control = 2;
		}
		var result = (11 - sum%11);
		return result === 11 ? 0 : result;
	};
	this.applyMask = function(scope, ngModel) { // Call to apply veMask to current string
		if ( !ngModel.$viewValue ) return;
		var str = ngModel.$viewValue;
		var pos = str.length; // chars in current String
		var change = 0;
		angular.forEach(scope.veMask, function(mask, key) { // Add spacers
			if ( key > pos ) return;
			if ( mask != ' ' && mask != '/' && mask != '-' && mask != '+' ) return;
			if ( key == pos ) { // Add trailing spacer character
				str += mask; change++;
			}
			if ( str[key] != mask ) { // Inject spacer
				str = str.substr(0,key) + mask + str.substr(key);
				pos++; change++;
			}
		});
		if ( change ) { // We have modified the string.
			ngModel.$setViewValue(str);
			ngModel.$render();
		}
		change = 0;
		angular.forEach(scope.veMask, function(mask, key) { // Remove high numbers
			if ( mask < '0' || mask > '9' ) return;
			var test = str[key];
			if ( test > mask ) {
				str = str.substr(0,key) + str.substr(key+1); change++;
			}
		});
		if ( change ) { // We have modified the string.
			ngModel.$setViewValue(str);
			ngModel.$render();
		}
	}
	this.DDNavigate = function (e, cb) { // DropDown navigation
		var key = e.which||e.charCode||e.keyCode;
		var cr = (key == 13), up = (key == 38), down = (key == 40);
		if ( !(cr || up || down) ) return;
		var t = e.target;
		e.preventDefault();
		e.stopPropagation();
		var elem = angular.element(t);
		if ( t.tagName == "INPUT" ) {
			angular.element(t).next().children()[0].focus();  // First li element
		} else if ( t.tagName == "LI" ) {
			var prev = document.activeElement.previousElementSibling,
					next = document.activeElement.nextElementSibling;
			if ( up && prev ) prev.focus();
			if ( down && next ) next.focus();
			if ( cr ) cb(t);
		}
	}

	this.inputFun = function(scope, elem, attr, ngModel) {
		scope.veValidator = "";
		scope.type = attr.type || 'text';
		if ( !attr.type ) return;
		if ( attr.type == 'number' && !angular.isUndefined(attr.noArrows)) scope.instyle = "hide-arrows";
		if ( attr.type == 'email' ) scope.pattern = /^[a-z0-9][a-z0-9._%+-]+@[a-z0-9][a-z0-9-]*\.[a-z0-9-.]{2,}$/i;
		if ( attr.type == 'check-email' ) {
			scope.type = 'email';
			scope.pattern = /^[a-z0-9][a-z0-9._%+-]+@[a-z0-9][a-z0-9-]*\.[a-z0-9-.]{2,}$/i;
			scope.checkEmail = function ( e1ID, e2ID ) {
				var e1 = scope.model[ e1ID ];
				var e2 = scope.model[ e2ID ];
				if ( !e1 || !e2 ) return false;
				if ( e1 == e2 ) return true;
				return false;
			};
			scope.veValid = "checkEmail('" + attr.key + "','" + attr.checkEmail + "')";
		}
		if ( attr.type == 'phone' ) {
			scope.pattern = /^[\+]{0,1}[0-9]{4,}$/;
			scope.type = 'text';
			scope.veValidator = "+0123456789";
			scope.maxLength = 16;
		}
		if ( attr.type == 'phone-no' ) {
			scope.pattern = /^[0-9]{2} [0-9]{2} [0-9]{2} [0-9]{2}$/;
			scope.type = 'text';
			scope.veMask = "99 99 99 99"
			scope.veValidator = "0123456789";
			scope.maxLength = 11;
		}
		if ( attr.type == 'phone-se' ) {
			scope.pattern = /^[+0-9][0-9]{4}[0-9]+$/;
			scope.type = 'text';
			scope.veValidator = "+0123456789";
			scope.maxLength = 15;
		}
		if ( attr.type == 'brreg-nr' ) { // This is validated by BrReg.
			scope.type = 'text';           // So no pattern can be used
			scope.veMask = "999 999 999"
			scope.veValidator = "0123456789";
			scope.minLength = scope.maxLength = 11;
		}
		if ( attr.type == 'org-no' ) {
			scope.pattern = /^[0-9]{3} [0-9]{3} [0-9]{3}$/;
			scope.type = 'text';
			scope.veMask = "999 999 999"
			scope.veValidator = "0123456789";
			scope.maxLength = 11;
		}
		if ( attr.type == 'org-se' ) {
			scope.pattern = /^[0-9]{6}-[0-9]{4}$/;
			scope.type = 'text';
			scope.veMask = "999999-9999"
			scope.veValidator = "0123456789";
			scope.maxLength = 11;
		}
		if ( attr.type == 'zip-no' || attr.type == 'zip-se' ) {
			scope.zipToTown = function ( zipID, townID ) {
				var zip = scope.model[ zipID ];
				if ( !zip || zip.length != scope.lists.postnummerLength ) return false;
				if ( scope.lists.postnummer[ zip ] ) {
					scope.model[ townID ] = scope.lists.postnummer[ zip ];
					return true;
				}
				return false;
			};
			scope.veValid = "zipToTown('" + attr.key + "','" + attr.zipTown + "')";
		}
		if ( attr.type == 'zip-no' ) {
			scope.pattern = /^[0-9]{4}$/;
			scope.type = 'text';
			scope.veValidator = "0123456789";
			scope.maxLength = 4;
		}
		if ( attr.type == 'zip-se' ) {
			scope.pattern = /^[0-9]{3} [0-9]{2}$/;
			scope.type = 'text';
			scope.veMask = "999 99"
			scope.veValidator = "0123456789";
			scope.maxLength = 6;
		}
		if ( attr.type == 'pin' ) {
			scope.pattern = /^[0-9]{4}$/;
			scope.type = 'text';
			scope.veMask = "9999"
			scope.veValidator = "0123456789";
			scope.maxLength = 4;
		}
		if ( attr.type == 'dob' ) {
			scope.pattern = /^[0-2][0-9][0-9][0-9]\-[0-1][0-9]\-[0-3][0-9]$/;
			scope.type = 'text';
			scope.veMask = "2999-19-39"
			scope.veValidator = "0123456789";
			scope.maxLength = 10;
		}
		if ( attr.type == 'date' ) {
			scope.pattern = /^[0-3][0-9]\-[0-1][0-9]\-[0-2][0-9][0-9][0-9]$/;
			scope.type = 'text';
			scope.veMask = "39-19-2999"
			scope.veValidator = "0123456789";
			scope.maxLength = 10;
		}
		if ( attr.type == 'ssn-no' ) {
			scope.pattern = /^[0-7][0-9][0-1][0-9]{3} [0-9]{5}$/;
			scope.type = 'text';
			scope.veMask = "791999 99999"
			scope.veValidator = "0123456789";
			scope.maxLength = 12;
		}
		if ( attr.type == 'ssn-se' ) {
			scope.pattern = /^[0-2][0-9][0-9][0-9][0-1][0-9][0-3][0-9]\-[0-9]{4}$/;
			scope.type = 'text';
			scope.veMask = "29991939-9999"
			scope.veValidator = "0123456789";
			scope.maxLength = 13;
		}
		if ( attr.type == 'bban-no' ) {
			scope.pattern = /^[0-9]{4} [0-9]{2} [0-9]{5}$/;
			scope.mod11 = this.mod11;
			scope.validateBBAN = function (bbanID) {
				var bban = scope.model[ bbanID ];
				if (!bban) return false;
				bban = bban.toString().replace(/[\.\ ]/g, '');
				if ( bban.length !== 11 ) return false;
				var check = parseInt(bban.charAt(bban.length - 1), 10);
				return check === this.mod11(bban);
			};
			scope.type = 'text';
			scope.veMask = "dddd dd ddddd";
			scope.veValidator = "0123456789 ";
			scope.placeholder = "11 siffer";
			scope.minLength = scope.maxLength = 13;
			scope.veValid = "validateBBAN('" + attr.key + "')";
		}
		if ( attr.type == 'date-no' ) {
			scope.pattern = /^[0-3][0-9]\/[0-1][0-9]-[0-2][0-9]{3}$/;
			scope.type = 'text';
			scope.veMask = "39/19-2999";
			scope.veValidator = "0123456789/-";
			scope.placeholder = "DD/MM-ÅÅÅÅ";
			scope.maxLength = 10;
		}
		if ( attr.type == 'percent' ) {
			scope.pattern = /^[1-9]\d{0,2}$/;
			scope.veMin = attr.min||0;
			scope.veMax = attr.max||100;
			scope.type = 'text';
			scope.veValidator = "0123456789";
			scope.placeholder = "%";
			scope.maxLength = 3;
		}
		if ( attr.type.match(/^(num|int)\-/) ) {
			scope.type = 'text';
			if ( attr.type.match(/min/) ){
				scope.veMin = attr.min||0;
			}
			if ( attr.type.match(/max/) ) {
				scope.veMax = attr.max;
			}
			scope.maxLength = attr.length||10;
		}
		if ( attr.type.match(/^num-/) ) {
			scope.pattern = /^[\d\.]+$/;
			scope.veValidator = "0123456789.";
		}
		if ( attr.type.match(/^int-/) ) {
			scope.pattern = /^\d+$/;
			scope.veValidator = "0123456789";
		}
	}
	this.conditionalFun = function(scope, elem, attr) {
		if ( attr.items ) scope.items = JSON.parse(attr.items);
		if ( attr.conditional ) scope.conditional = attr.conditional;
	}
	this.updateTexts = function(scope) {
		angular.forEach(scope.items, function(item) {
			var tk = item.textkey;
			if ( angular.isArray(tk) ) {
				item.text = "";
				angular.forEach(tk, function(k) {
					if ( k ) {
						if ( item.text != "" ) item.text += " ";
						item.text += scope.translations[k]
							? scope.translations[k][scope.data.lang]
							: k;
					}
				});
			} else {
				if ( tk && scope.translations[tk] )
					item.text = scope.translations[tk][scope.data.lang];
			}
		});
	}
	this.parseItems = function(scope,attr) {
		var obj = {};
		var items = attr.items;
		if ( items ) {
			items = JSON.parse(items);
		} else if ( scope.list ) {
			items = scope.list;
		} else {
			items = ['yes', 'no'];
		}
		if ( angular.isArray(items) ) { // Array to object
			angular.forEach(items, function(item) {
				obj[item] = { "text": item, "input": null };
			});
		} else if ( angular.isObject(items) ) {
			angular.forEach(items, function(value, item) {
				if ( angular.isObject(value) ) {
					var w = value.width || "100px";
					obj[item] = value;
					obj[item].style = value.style || "display: inline-block; width: " + w;
				} else {
					obj[item] = { "text": value, "input": null };
				}
			});
			angular.forEach(items, function(value, item) { // May need to tweak
				if ( obj[item].input ) {
					var margin = "";
					var test = obj[item].text && obj[item].text.length==1 && obj[item].text.charCodeAt(0) == 160;
					if ( attr.type == 'radio') // NB: label must be &nbsp; to test!
						margin = "2px 0 2px " + ( test ? "-3rem;" : "-2rem");
					if ( attr.type == 'checkbox')
						margin = "2px 0 2px " + ( test ? "-3rem;" : "-2rem");
					obj[item].style += "; margin: " + margin;
				}
				if ( obj[item].items && angular.isArray(obj[item].items) ) {
					var inner = {};
					angular.forEach(obj[item].items, function(it) {
						inner[it] = { "input": null, "style":"width:200px" };
					});
					obj[item].items = inner;
				}
			});
		} else { // How do we get here then?
			obj = items;
		}
		return obj;
	}
	this.linkFun = function(scope, elem, attr, type, ngModel) {
		scope.class = attr.class || "";
		scope.key = attr.key || "xxx";
		scope.model = attr.object ? scope[attr.object] : scope.data;
		if ( attr.objkey ) {
			scope.model = scope.model[attr.objkey];
			attr.idkey = attr.idkey || attr.objkey + "-" + attr.key;
		}
		if ( attr.index >= 0 )
			scope.model = scope.model[attr.index];
//	if ( attr.index ) console.log("Model: ", scope.data, attr.index, scope.data[attr.objkey], scope.data[attr.objkey][attr.index]);
		if ( attr.required == "" ) attr.required="true";
		if ( angular.isUndefined(attr.required) ) attr.required = "";
		if ( attr.required ) scope.required = attr.required;
		if ( attr.blocked ) scope.blocked = attr.blocked;
		if ( attr.label ) scope.label = attr.label;
		if ( attr.nolabel || attr.nolabel == "" ) scope.nolabel = true;
		if ( attr.labelkey ) scope.labelkey = attr.labelkey;
		if ( attr.count ) scope.count = attr.count;
		if ( attr.tip ) scope.tip = JSON.parse(attr.tip);
		if ( attr.buttons ) scope.buttons = JSON.parse(attr.buttons);
		if ( attr.list ) scope.list = scope.lists[attr.list] ? scope.lists[attr.list] : JSON.parse(attr.list);
		if ( attr.text ) scope.text = attr.text;
		if ( attr.bold || attr.bold == "" ) scope.bold = true;
		if ( attr.head ) scope.head = attr.head;
		if ( attr.small ) scope.small = attr.small;
		if ( attr.maxLength ) scope.maxLength = attr.maxLength;
		scope.show = attr.show ? attr.show : "true";
		if ( attr.change ) scope.veChange = attr.change;
		if ( attr.valid ) scope.veValid = attr.valid;
		if ( attr.readonly === null ) attr.readonly="false";
		if ( attr.readonly === "" ) attr.readonly="true";
		if ( attr.placeholder ) scope.placeholder = attr.placeholder;
		if ( attr.transparent ) scope.class += " transparent";
		if ( attr.rule === "" ) scope.rule = true;
		scope.readonly = attr.readonly;
		if ( attr.cols || attr.cols == "" ) {
			scope.veCols = "col";
			if ( attr.cols > 0 ) {
				scope.veCols += " col-" + attr.cols;
			}
		}
		scope.lastyle = scope.ddstyle = "";
		if ( attr.tip || attr.inline || attr.inline == "" ) {
			scope.lastyle += "display: inline-block;";
		}
		if ( attr.inline || attr.inline == "" ) {
			scope.inline = true;
			scope.ddstyle += "display: inline-block;";
		}
		if ( attr.bold || attr.bold == "" ) {
			scope.lastyle += "font-weight: bold;"
		}
		if ( type == 'dropdown' || type == 'radio' || type == 'checkbox' ||
			   type == 'input' || type == 'list' || type == 'language' || type == 'query' ) {
			if ( attr.menus ) scope.menus = attr.menus;
			scope.languages = scope.$parent.lists.languages;
			scope.mkey = attr.mkey || scope.key;
			scope.idkey = attr.key;
			if ( attr.objkey ) {
				scope.mkey = attr.objkey + scope.mkey;
			}
			if ( attr.index ) {
				scope.mkey += attr.index;
				scope.idkey += attr.index
			}
			if ( attr.inline ) {
				scope.lastyle += "width: " + JSON.parse(attr.inline)[0] + ";";
				scope.ddstyle += "width: " + JSON.parse(attr.inline)[1] + ";";
			}
		}
		if ( type == 'buttons' || type == 'busy' ) {
			scope.selected = attr.selected;
			scope.items = attr.items ? JSON.parse(attr.items) : {};
		}
		if ( type == 'input' ) this.inputFun(scope, elem, attr, ngModel);
		if ( type == 'query' ) {
			this.conditionalFun(scope, elem, attr);
			scope.items = this.parseItems(scope,attr);
			scope.negative = angular.isUndefined(attr.negative) ? false : true;
		}
		if ( type == 'header' ) {
			if ( attr.logo ) scope.logo = attr.logo;
			scope.w1 = (attr.logowidth ? parseInt(attr.logowidth)+20 : "180") + "px";
			scope.w2 = (attr.logowidth ? attr.logowidth : "160") + "px";
		}
		if ( type == 'footer' || type == 'alert') {
			scope.items = this.parseItems(scope,attr);
		}
		if ( type == 'radio' || type == 'checkbox' || type == 'dropdown' ) {
			attr.type = type;
			scope.items = this.parseItems(scope,attr);
			scope.style = attr.inline == "" ? "display: inline-block;" : "";
			scope.alerts = attr.alerts ? JSON.parse(attr.alerts) : null;
		}
		if ( type == 'button' ) {
			scope.click = attr.click;
		}
		if ( type == 'form' ) {
			scope.header = [];
			scope.form = attr.form || 'RecipientForm';
			scope.key = attr.key || 'recipient';
			scope.items = this.parseItems(scope,attr);
			scope.signatory = JSON.parse(attr.signatory);
			scope.actions = attr.actions ? JSON.parse(attr.actions) : {};
			attr.header = JSON.parse(attr.header);
			if ( angular.isObject(attr.header) ) {
				angular.forEach(attr.header, function(value, key) {
					scope.header.push({"head":key,"text":value})
				});
			}
		}
	}
})
.directive('veChange', function ($parse) {
	return { // Call function on any change
		restrict: 'A',
		scope: true,
		require: 'ngModel',
		link: function (scope, elem, attr, ngModel) {
			ngModel.$viewChangeListeners.push( function() {
				scope.$eval(attr.veChange); // Must be function defined on scope.
			});
		}
	}
})
.directive('veTranslate', function ($parse) {
	return { // Translate list object values
		restrict: 'A',
		scope: true,
		require: 'ngModel',
		link: function (scope, elem, attr, ngModel) {
			ngModel.$formatters.push(function(key) {
				if ( !scope.translations || !scope.translations[key] ) return key;
				return scope.translations[key][scope.data.lang];
			});
		}
	}
})
.directive('veReplace', function ($parse) {
	return { // Replace list key with text
		restrict: 'A',
		scope: true,
		require: 'ngModel',
		link: function (scope, elem, attr, ngModel) {
			ngModel.$formatters.push(function(key) {
				if ( !scope.list || !scope.list[key] ) return key;
				return (scope.list[key].text||scope.list[key]);
			});
		}
	}
})
.directive('veValid', function ($parse) {
	return { // Call function on change only if pattern is valid
		restrict: 'A',
		scope: true,
		require: 'ngModel',
		link: function (scope, elem, attr, ngModel) {
			ngModel.$viewChangeListeners.push( function() {
				var valid = true;
				if ( scope.pattern )
					valid = scope.pattern.test(ngModel.$viewValue);
				if ( valid ) scope.$eval(attr.veValid);
			});
		}
	}
})
.directive('veValidator', function ( $parse, VeForm ) {
	return {
		restrict: 'A',
		scope: true,
		require: 'ngModel',
		link: function (scope, elem, attr, ngModel) {
			var validate = function(key) {
				var bs = key == 8 || key == 46;
				var val = ngModel.$viewValue || "";
				if ( scope.veMask && !bs ) VeForm.applyMask(scope, ngModel); // Inject space according to mask.
				if ( scope.minLength && val.length < scope.minLength )
					scope.$apply(ngModel.$setValidity("auto", false));
				if ( scope.maxLength && val.length > scope.maxLength )
					scope.$apply(ngModel.$setValidity("auto", false));
				if ( scope.pattern && !scope.required && val == "" ) {
					scope.$apply(ngModel.$setValidity("auto", true));
				} else if ( scope.pattern ) {
					var valid = scope.pattern.test(val);
					if ( valid && scope.veValid )
						valid = scope.$eval(attr.veValid);
					if ( valid && scope.veMin )
						valid = ( parseFloat(ngModel.$viewValue) >= parseFloat(scope.$eval(scope.veMin)) )
					if ( valid && scope.veMax )
						valid = ( parseFloat(ngModel.$viewValue) <= parseFloat(scope.$eval(scope.veMax)) )
					scope.$apply(ngModel.$setValidity("auto", valid));
				}
			}
			elem.bind('keyup', function(e) {
				var key = e.which||e.charCode||e.keyCode;
				if ( key == 9 || key == 16 || key == 17 || key == 18 ) return;
				validate(key);
			});
			elem.bind('keydown', function(e) {
				var key = e.which||e.charCode||e.keyCode;
				if ( key == 9 || key == 13 )  // Tab must validate the field before leaving
					validate(key);
			});
			elem.bind('keypress', function(e) {
				if ( !scope.veValidator ) return;
				if ( e.ctrlKey ) return; // Pass ctrl keys (for copy/paste etc.)
				var key = e.which||e.charCode||e.keyCode;
				// Pass Tab, BS, Delete to default
				if ( key == 8 || key == 9 || key == 46 ) return;
				var char = String.fromCharCode(key), matches = [];
				var pos = ngModel.$viewValue ? ngModel.$viewValue.length : 0;
				if ( scope.maxLength ) { // Block if length exceeded
					if ( pos >= scope.maxLength ) { e.preventDefault(); return false; };
				}
				if ( scope.veMask ) { // Block on high numbers
					var mask = scope.veMask[pos];
					if ( mask >= '0' && mask <= '9' && char > mask ) { e.preventDefault(); return false; }
				}
				angular.forEach(scope.veValidator, function(value, key) {
					if ( char === value ) matches.push(char);
				}, matches);
				if ( matches.length == 0 ) { e.preventDefault(); return false; }
			});
		}
	}
})
.directive( 'myLabel', function() {
	return {
			restrict: 'E',
			scope: false,
			replace: true,
			template: '<label style="display: inline-block">{{label||translations[labelkey||key][data.lang]}}'
							+ '<small ng-if="small"><span ng-if="inline">&nbsp;&nbsp;</span><br ng-if="!inline">{{translations[small][data.lang]||small}}</small>'
							+ '<span ng-if="tip">&nbsp;&nbsp;<my-tip></my-tip></span></label>'
	}
})
.directive( 'myTip', function() {
	return {
			restrict: 'E',
			scope: false,
			replace: true,
			template: '<span ng-if="tip" class="tooltip">'
							+ '<span class="tooltip-message" ng-click="tips[mkey]=!tips[mkey]"></span></span>'
	}
})
.directive( 'myTipMessage', function() {
	return {
			restrict: 'E',
			scope: false,
			replace: true,
			template: '<span ng-if="tip" ng-show="tips[mkey]" class="tooltip-box">'
							+ '<div ng-repeat="(k,v) in tip track by $index">'
							+ '<div ng-if="k.substr(0,4)==\'text\'">{{translations[v][data.lang]||v}}</div>'
							+ '<div ng-if="k.substr(0,4)==\'imgs\'"><img ng-repeat="item in v" ng-src="{{item}}" /></div>'
							+ '<ul ng-if="k.substr(0,4)==\'list\'">'
							+ '<li ng-repeat="item in v">{{translations[item][data.lang]||item}}</li></ul>'
							+ '</div></span>'
	}
})
.directive( 'myList', function() {
	return {
			restrict: 'E',
			scope: false,
			replace: true,
			template: '<div class="data-list" style="{{ddstyle}}">'
							+ '<input type="text" ng-model="model[key]" '
							+ 'placeholder="{{translations[placeholder][data.lang]||placeholder}}" '
							+ 'ng-required="do(required) && do(show)" ng-disabled="do(blocked)" ng-readonly="do(readonly)" '
							+ 'ng-click="clickFun();$event.stopPropagation()" '
							+ 'ng-change="menus[mkey]=true" ve-translate ve-replace  />'
							+ '<ul ng-show="menus[mkey]" menu-closer="menus[mkey]">'
							+ '<li ng-repeat="(k,v) in items track by $index" tabindex="1" '
							+ 'ng-click="model[key]=k; menus[mkey]=false; do(v.click)">{{translations[k][data.lang]||v.text||k}}</li></ul>'
							+ '</div>',
	}
})
.directive( 'veInput', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div class="{{veCols}}" ng-show="do(show)">'
						+ '<my-label ng-if="!nolabel" style="{{lastyle}}"></my-label>'
						+ '<input type="{{type}}" ng-model="model[key]" ve-change="{{veChange}}" ve-valid="{{veValid}}"'
						+ 'placeholder="{{translations[placeholder][data.lang]||placeholder}}" '
						+ 'ng-required="do(required) && do(show)" ng-readonly="do(readonly)" style="{{ddstyle}}" '
						+ 'ng-class="instyle" ve-validator="{{veValidator}}"/>'
						+ '<my-tip-message></my-tip-message>'
						+ '<div ng-transclude></div></div>',
		link: function(scope,elem,attr) {
			VeForm.linkFun(scope,elem,attr,'input');
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'veTextarea', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div class="{{veCols}}" ng-show="do(show)"><my-label ng-if="!nolabel"></my-label>'
						+ '<my-tip></my-tip><my-tip-message></my-tip-message>'
						+ '<textarea type="text" ng-model="model[key]" ve-change="{{veChange}}" ve-valid="{{veValid}}" '
						+ 'placeholder="{{translations[placeholder][data.lang]||placeholder}}" '
						+ 'ng-required="required" ve-validator="{{veValidator}}"></textarea></div>',
		link: function(s,e,a) {
			VeForm.linkFun(s,e,a,'textarea')
			s.do = function (it) { return s.$eval( it ); }
		}
	}
})
.directive( 'veDropdown', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div class="{{veCols}}" ng-show="do(show)">'
						+ '<my-label ng-if="!nolabel" style="{{lastyle}}"></my-label>'
						+ '<my-list></my-list>'
						+ '<my-tip-message></my-tip-message>'
						+ '<div ng-repeat="(item,value) in alerts"><span ng-if="item==model[key]" class="alert alert-info">{{value}}</span>'
						+ '</div></div>',
		link: function(s,e,a) {
			VeForm.linkFun(s,e,a,'dropdown');
			s.do = function (it) { return s.$eval( it ); }
			s.clickFun = function() {
				if ( a.clear ) s.model[s.key] = null;
				s.menus[s.mkey] = true;
			}
			e.bind('keydown',  function (e) {
				VeForm.DDNavigate(e, function(t) {
					s.model[s.key] = t.innerText;
					s.$apply(s.menus[s.mkey] = false);
				})
			});
		}
	}
})
.directive( 'veDateDrop', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div class="{{veCols}}" ng-show="do(show)">'
						+ '<my-label ng-if="!nolabel" style="{{lastyle}}"></my-label><br>'
						+ '<div class="data-list" style="display: inline-block; width: 25%">'
						+ '<input type="text" ng-model="model[key].day" ng-readonly="true" ng-required="do(required)" '
						+ 'ng-click="menus[dkey]=true; $event.stopPropagation()" />'
						+ '<ul ng-show="menus[dkey]" menu-closer="menus[dkey]">'
						+ '<li ng-repeat="i in lists.days" ng-click="model[key].day=i; menus[dkey]=false">{{i}}</li>'
						+ '</ul></div>'
						+ '<div class="data-list" style="display: inline-block; width: 25%">'
						+ '<input type="text" ng-model="model[key].month" ng-readonly="true" ng-required="required" '
						+ 'ng-click="menus[mkey]=true; $event.stopPropagation()" />'
						+ '<ul ng-show="menus[mkey]" menu-closer="menus[mkey]">'
						+ '<li ng-repeat="i in lists.months" ng-click="model[key].month=i; menus[mkey]=false">{{i}}</li>'
						+ '</ul></div>'
						+ '<div class="data-list" style="display: inline-block; width: 50%">'
						+ '<input type="text" ng-model="model[key].year" ng-readonly="true" ng-required="required" '
						+ 'ng-click="menus[ykey]=true; $event.stopPropagation()" />'
						+ '<ul ng-show="menus[ykey]" menu-closer="menus[ykey]">'
						+ '<li ng-repeat="i in lists.years" ng-click="model[key].year=i; menus[ykey]=false">{{i}}</li>'
						+ '</ul></div>'
						+ '<my-tip-message></my-tip-message>'
						+ '<div ng-repeat="(item,value) in alerts"><span ng-if="item==model[key]" class="alert alert-info">{{value}}</span>'
						+ '</div></div>',
		link: function(s,e,a) {
			VeForm.linkFun(s,e,a,'dropdown');
			s.dkey= s.mkey+'d';
			s.ykey= s.mkey+'y';
			s.mkey+='m';
			s.do = function (it) { return s.$eval( it ); }
		}
	}
})
.directive( 'veListSelector', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div class="{{veCols}} ng-show="do(show)">'
						+ '<my-label ng-if="!nolabel" style="{{lastyle}}"></my-label>'
						+ '<div class="data-list">'
						+ '<input type="text" ng-model="model[key]" '
						+ 'placeholder="{{translations[placeholder][data.lang]||placeholder}}" '
						+ 'ng-required="required" ng-readonly="readonly" style="{{ddstyle}}" '
						+ 'ng-click="menus[mkey]=true; $event.stopPropagation()" ng-change="menus[mkey]=true" />'
						+ '<ul ng-show="menus[mkey]" menu-closer="menus[mkey]">'
						+ '<li ng-repeat="(i,value) in list | filter :model[key] | limitTo: 10" '
						+ 'ng-click="model[key]=value; menus[mkey]=false">{{value}}</li></ul>'
						+ '</div><my-tip-message></my-tip-message></div>',
		link: function(scope,elem,attr) {
			VeForm.linkFun(scope,elem,attr,'list');
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'veLabel', function ( $compile, $interpolate, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div class="{{veCols}}" ng-show="do(show)">'
			+ '<my-label ng-if="!nolabel" style="margin: 0;{{lastyle}}"></my-label>'
			+ '<span ng-repeat="(key,item) in buttons" style="margin-left: 1rem">'
			+ '<input type="button" ng-disabled="do(item.disabled)" ng-click="do(item.click)"'
			+ ' value="{{item.value||translations[key][data.lang]}}" style="padding: 0.6rem; margin: 0"/>'
			+ '</span>'
			+ '<my-tip-message></my-tip-message>'
			+ '<ul ng-if="list"><li ng-repeat="item in list track by $index">{{translations[item][data.lang]||item}}</li></ul>'
			+ '<div ng-if="text">{{text}}</div>'
			+ '<div ng-transclude></div>'
			+ '</div>',
		link: function(scope,elem,attr,ctrl,trans) {
			VeForm.linkFun(scope,elem,attr,'label');
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'veCounter', function ( $compile, $interpolate, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div class="{{veCols}}">'
			+ '<label style="margin: 0;{{lastyle}}">{{label||translations[key][data.lang]}} {{count}}</label>'
			+ '</div>',
		link: function(scope,elem,attr,ctrl) {
			VeForm.linkFun(scope,elem,attr,'label');
		}
	}
})
.directive( 'veSection', function ( $compile, $interpolate, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div class="{{class}}"><h3>{{label}}</h3>'
			+ '<hr ng-if="rule"></div>',
		link: function(scope,elem,attr,ctrl,trans) {
			trans(scope, function(clone) {
				if ( clone[0] ) scope.label = $interpolate(clone[0].innerHTML)(scope);
			});
			VeForm.linkFun(scope,elem,attr,'label');
		}
	}
})
.directive( 'veFooter', function ( $compile, $interpolate, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div><h3>{{label}}</h3>'
						+ '<div ng-transclude></div><hr />'
						+ '<div class="flex-columns transparent">'
						+ '<div ng-repeat="item in items" class="{{veCols}}">'
						+ '<label style="font-weight: bold;">{{translations[item.label][data.lang]||item.label}}&nbsp;</label>'
						+ '<div ng-repeat="i in item.text">{{i}}<br></div>'
						+ '<div ng-repeat="(url,txt) in item.links"><a href="{{url}}" target="_blank">{{txt}}<a><br></div>'
						+ '</div></div></div>',
		link: function(scope,elem,attr,ctrl,trans) {
			VeForm.linkFun(scope,elem,attr,'footer');
		}
	}
})
.directive( 'veQuery', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div class="{{veCols}}" ng-show="do(show)">'
						+ '<my-label ng-if="!nolabel"></my-label>'
						+ '<div ng-transclude></div>'
						+ '<div ng-repeat="item in [\'yes\', \'no\']" style="display: inline-block">'
						+ '<input type="radio" name="{{idkey}}" id="{{key}}-{{item}}" ng-model="model[key]" ng-checked="model[key]==item"'
						+ 'ng-click="model[key]=item" ng-required="true"/>'
						+ '<label for="{{key}}-{{item}}">{{text||translations[item][data.lang]}}'
						+ '</div><div ng-if="model[key]==(negative?\'no\':\'yes\')">'
						+ '<div ng-repeat="(i,item) in items" style="width: 100%; padding: 2px 0 2px 0;" >'
						+ '<input ng-if="item.input==\'text\'||!item.input" type="text" ng-model="model[conditional][i]" ng-required="true" placeholder="{{translations[item.text][data.lang]||item.text}}" />'
						+ '<div ng-if="item.input==\'radio\'" style="padding: 6px 2px 4px 2px; display: inline-block">{{translations[item.text][data.lang]||item.text}}&nbsp;&nbsp;</div>'
						+ '<div ng-if="item.input==\'radio\'" ng-repeat="(j,val) in item.items" style="display: inline-block">'
						+ '<input type="radio" name="{{idkey}}-{{i}}" id="{{idkey}}-{{i}}-{{j}}" ng-model="model[conditional][i]" ng-checked="model[conditional][i]==j"'
						+ 'ng-click="model[conditional][i]=j" ng-required="true" />'
						+ '<label for="{{idkey}}-{{i}}-{{j}}">{{translations[j][data.lang]||j}}</label>'
						+ '<input ng-if="val.input&&model[conditional][i]==j" type="text" ng-model="model[conditional][val.input]" ng-required="true" placeholder="{{translations[val.input][data.lang]||val.input}}" style={{val.style}} />'
						+ '</div>'
						+ '</div></div></div>',
		link: function(s,e,a) {
			VeForm.linkFun(s,e,a,'query');
			s.do = function (it) { return s.$eval( it ); }
		}
	}
})
.directive( 'veCheckbox', function ( $compile, $interpolate, VeForm ) {
	return {
		restrict: 'E',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div class="{{veCols}}" ng-show="do(show)">'
			+ '<div ng-transclude></div>'
			+ '<h3 ng-if="head" style="margin: 0 0 1rem 0">{{head}}</h3>'
			+ '<label ng-if="label" style="margin: 0;{{lastyle}}">{{label}}&nbsp;</label>'
			+ '<label ng-if="labelkey||(translations[key]&&!nolabel)" style="margin: 0;{{lastyle}}">{{translations[labelkey][data.lang]||translations[key][data.lang]}}&nbsp;</label>'
			+ '<div ng-repeat="(i,item) in items track by $index" style="{{style}}" class="{{item.class}}">'
			+ '<input type="checkbox" name="{{idkey}}" id="{{idkey}}-{{i}}" ng-model="model[key][i]" ng-checked="model[key][i]" '
			+ 'ng-required="do(required) && do(show) && isSelected()==0" ng-click="do(item.click)" />'
			+ '<label for="{{idkey}}-{{i}}">{{translations[item.text][data.lang]||item.text||translations[item.key][data.lang]}}</label>'
			+ '<span ng-if="item.tip" class="tooltip">'
			+ '<span class="tooltip-message" ng-click="tips[i]=!tips[i]" style="margin-left: -2rem"></span></span>'
			+ '<input ng-if="item.input" type="{{item.input}}" ng-model="model[item.key]" placeholder="{{translations[item.placeholder][data.lang]||item.placeholder}}"'
			+ 'style="{{item.style}}" ng-required="model[key][i]" ng-disabled="!model[key][i]" />'
			+ '<span ng-if="item.unit">&nbsp;{{item.unit}}</span>'
			+ '<div ng-if="item.small" style="margin: -0.5rem 0 1rem 0">'
			+ '<small>{{item.small}}</small></div>'
			+ '<span ng-if="item.tip" ng-show="tips[i]" class="tooltip-box">'
			+ '<span ng-repeat="(k,v) in item.tip track by $index">'
			+ '<span ng-if="k.substr(0,4)==\'text\'">{{translations[v][data.lang]||v}}</span>'
			+ '<span ng-if="k.substr(0,3)==\'url\'"><a href="{{v}}">{{v}}</a></span>'
			+ '<span ng-if="k.substr(0,4)==\'imgs\'"><img ng-repeat="item in v" ng-src="{{item}}" /></span>'
			+ '<ul ng-if="k.substr(0,4)==\'list\'">'
			+ '<li ng-repeat="item in v">{{translations[item][data.lang]||item}}</li></ul>'
			+ '</span></span>'
			+ '</div>'
			+ '<div ng-repeat="(item,value) in alerts"><span ng-if="model[key][item]" class="alert alert-info">{{translations[value][data.lang]||value}}</span>'
			+ '</div>',
		link: function(scope,elem,attr,ctrl,trans) {
			VeForm.linkFun(scope,elem,attr,'checkbox');
			scope.isSelected = function () {
				var cnt=0; angular.forEach(scope.model[scope.key], function(item) {
					if ( item ) cnt++;
				});
				return cnt;
			}
			scope.maxSelected = function (num) {
				var valid = scope.isSelected() <= num;
				console.log("Check: ", scope.isSelected(), num)
				// scope.$apply(ngModel.$setValidity("auto", valid));
			}
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'veRadio', function ( $compile, $interpolate, VeForm ) {
	return {
		restrict: 'E',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div class="{{veCols}}" ng-show="do(show)">'
			+ '<div ng-transclude></div>'
			+ '<my-label ng-if="!nolabel" style="{{lastyle}}"></my-label>'
			+ '<span ng-if="!nolabel&&inline">&nbsp;&nbsp;</span>'
			+ '<div ng-repeat="(i,item) in items" style="{{style}}">'
			+ '<input type="radio" name="{{idkey}}" id="{{idkey}}-{{i}}" ng-model="model[key]" ng-checked="model[key]==i"'
			+ 'ng-click="model[key]=i;do(item.click)" ng-required="do(required) && do(show)" ng-disabled="do(blocked)" />'
			+ '<label for="{{idkey}}-{{i}}">{{translations[item.text][data.lang]||item.text}}</label><span ng-if="item.tip" class="tooltip">'
			+ '<span class="tooltip-message" ng-click="tips[i]=!tips[i]" style="margin-left: -2rem"></span>&nbsp;&nbsp;</span>'
			+ '<span ng-if="item.input"><input type="{{item.input}}" ng-model="model[item.key]" placeholder="{{item.placeholder}}"'
			+ 'style="{{item.style}}" ng-required="do(show) && model[key]==i" ng-disabled="model[key]!=i" />&nbsp;&nbsp;</span>'
			+ '<span ng-if="item.list"><div class="data-list" style="{{item.style}}">'
			+ '<input type="text" ng-model="model[item.key]" ng-readonly="true" ng-required="do(show) && model[key]==i" '
			+ 'ng-disabled="model[key]!=i" ng-click="menus[item.key]=true; $event.stopPropagation()" />'
			+ '<ul ng-show="menus[item.key]" menu-closer="menus[item.key]">'
			+ '<li ng-repeat="i in lists[item.list]" ng-click="model[item.key]=i; menus[item.key]=false">{{i}}</li>'
			+ '</ul></div>&nbsp;&nbsp;</span>'
			+ '<span ng-if="item.tip" ng-show="tips[i]" class="tooltip-box">'
			+ '<span ng-repeat="(k,v) in item.tip track by $index">'
			+ '<span ng-if="k.substr(0,4)==\'text\'">{{translations[v][data.lang]||v}}</span>'
			+ '<span ng-if="k.substr(0,3)==\'url\'"><a href="{{links[v.link]||v.link}}" target="_new">{{translations[v.text][data.lang]||v.text}}</a></span>'
			+ '<span ng-if="k.substr(0,4)==\'imgs\'"><img ng-repeat="item in v" ng-src="{{item}}" /></span>'
			+ '<ul ng-if="k.substr(0,4)==\'list\'">'
			+ '<li ng-repeat="item in v">{{translations[item][data.lang]||item}}</li></ul>'
			+ '</span></span>'
			+ '</div>'
			+ '<my-tip-message></my-tip-message>'
			+ '<div ng-if="text">{{translations[text][data.lang]||text}}</div>'
			+ '<div ng-repeat="(item,value) in alerts"><span ng-if="model[key]==item" class="alert alert-info">'
			+ '<span ng-repeat="(k,v) in value">'
			+ '<span ng-if="k.substr(0,4)==\'text\'">{{translations[v][data.lang]||v}}</span>'
			+ '<span ng-if="k.substr(0,3)==\'url\'"><a href="{{links[v.link]||v.link}}" target="_new">{{translations[v.text][data.lang]||v.text}}</a></span>'
			+ '<span ng-if="k.substr(0,4)==\'imgs\'"><img ng-repeat="item in v" ng-src="{{item}}" /></span>'
			+ '<ul ng-if="k.substr(0,4)==\'list\'">'
			+ '<li ng-repeat="item in v">{{translations[item][data.lang]||item}}</li></ul>'
			+ '</span></span>'
			+ '</div>',
		link: function(scope,elem,attr,ctrl,trans) {
			VeForm.linkFun(scope,elem,attr,'radio');
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'veHeader', function ( $compile, $interpolate, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div class="flex-columns" style="align-items: center">'
			+ '<div ng-if="logo" ng-style="{\'width\': w1}"><img ng-src="{{logo}}" ng-style="{\'width\': w2}" /></div>'
			+ '<div ng-if="label" style="font-size: 18pt; font-weight: bold">{{label}}</div>'
			+ '<div ng-if="key" style="font-size: 18pt; font-weight: bold">{{translations[key][data.lang]}}</div>'
			+ '<div ng-transclude></div>',
		link: function(scope,elem,attr,ctrl,trans) {
			VeForm.linkFun(scope,elem,attr,'header');
		}
	}
})
.directive( 'veTip', function ( $compile ) {
	return {
		restrict: 'AE',
		scope: false,
		replace: true,
		transclude: true,
		template: '<span class="tooltip">'
			+ '<span class="tooltip-message" ng-click="tips[key]=!tips[key]"></span>'
			+ '<span class="tooltip-box" ng-show="tips[key]"><ng-transclude></ng-transclude></span></span>'
	}
})
.directive( 'veAlertBox', function($compile, VeForm) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div ng-show="do(show)"><div ng-repeat="item in items">'
			+ '<span ng-show="{{item.show}}" class="alert alert-{{item.type}}">'
			+ '<h2><span ng-if="item.text">{{item.text}}</span>'
			+ '<span ng-if="item.key">{{translations[item.key][data.lang]||item.key}}</span>'
			+ '<span ng-repeat="k in item.keys">{{translations[k][data.lang]||k}}</span>'
			+ '</h2></span></div></div>',
		link: function(scope, elem, attr) {
			VeForm.linkFun(scope,elem,attr,'alert');
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'veButtons', function ($compile, VeForm) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div style="margin: 1rem 0 1rem 0" ng-show="do(show)">'
			+ '<div ng-repeat="(key,item) in items" style="display: inline-block; margin-right: 1rem">'
			+ '<input type="{{item.type}}" ng-disabled="do(item.disabled)" ng-click="do(item.click)"'
			+ ' value="{{item.value||translations[key][data.lang]||key}}" />'
			+ '</div></div>',
		link: function(scope, elem, attr) {
			VeForm.linkFun(scope,elem,attr,'buttons');
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'veButtonGroup', function ($compile, VeForm) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div style="margin: 1rem 0 1rem 0" ng-show="do(show)" class="btn-group">'
			+ '<div ng-repeat="(key,item) in items" style="display: inline-block">'
			+ '<input type="{{item.type}}" ng-disabled="do(item.disabled)" ng-click="do(item.click)" '
			+ ' value="{{item.value||translations[key][data.lang]}}" class="{{getClass(key)}}" />'
			+ '</div></div>',
		link: function(scope, elem, attr) {
			VeForm.linkFun(scope,elem,attr,'buttons');
			scope.myClass = "btn-secondary";
			scope.setActive = function(key) {
				console.log("Check: ", scope.selected, scope.$eval(scope.selected), elem, key)
				if ( key == scope.$eval(scope.selected) ) elem.addClass('btn-primary');
			}
			scope.do = function (it) { return scope.$eval( it ); }
			scope.getClass = function (b) {
				var ret = "btn-secondary";
				if ( b == scope.$eval(scope.selected) ) ret += " btn-primary";
				return ret;
			}
		}
	}
})
.directive( 'veBusy', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		template: '<div ng-show="do(show)" style="text-align: center">'
			+ '<img src="assets/loader.gif" /><h4>'
			+ '<div ng-repeat="(k,item) in items" ng-show="do(item.show)">'
			+ '{{item.text||translations[k][data.lang]}}'
			+ '</div></h4><br></div>',
		link: function(scope, elem, attr) {
			VeForm.linkFun(scope,elem,attr,'busy');
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'veSignatoryForm', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: false,
		replace: true,
		template: '<div ng-show="forms[form]" ng-form="form">'
			+ '<h2>{{header[!signUrl?0:1].head}}</h2><p>{{header[!signUrl?0:1].text}}</p>'
			+ '<div class="flex-columns">'
			+ '<div class="col col-1" ng-init="model[key]==null">'
			+ '<div ng-repeat="(i,item) in items" style="{{style}}">'
			+ '<input type="radio" name="{{key}}" id="{{key}}-{{i}}" ng-model="model[key]" ng-checked="model[key]==i"'
			+ 'ng-click="model[key]=i" ng-required="true" />'
			+ '<label for="{{key}}-{{i}}">{{item.text}}</label></div></div>'
			+ '<div ng-repeat="(i,item) in items" class="col col-1" ng-hide="model[key]!=i">'
			+ '<b>{{item.info}}</b></div>'
			+ '<div class="col col-3" ng-if="model[key]!=null" ng-repeat="(i,label) in signatory">'
			+ '<label>{{label}}</label>'
			+ '<input type="text" ng-model="recipient[i]" ng-required="true" /></div>'
			+ '<div class="col-1" ng-show="!signUrl"><p>'
			+ '<div ng-repeat="(key,item) in actions" style="display: inline-block; margin-right: 1rem">'
			+ '<input type="button" ng-disabled="do(item.disabled)" ng-click="do(item.click)"'
			+ ' value="{{item.value||translations[key][data.lang]}}" />'
			+ '</div></p></div></div></div>',
		link: function(scope, elem, attr) {
			VeForm.linkFun(scope,elem,attr,'form');
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
})
.directive( 'menuCloser', function ( $document ) {
	return {
		restrict: 'A',
		scope: {
			menuCloser: '=',
		},
		link: function ( scope, el, attr ) {
			$document.on( 'click', function ( e ) {
				if ( scope.menuCloser && el !== e.target && !el[ 0 ].contains( e.target ) ) {
					scope.$apply( function () { scope.menuCloser=false; } )
				}
			} );
		}
	}
});
