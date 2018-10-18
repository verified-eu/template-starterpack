var brReg = angular.module('BrReg', ['VeForm']);

brReg.service('BrReg', function($q, $http, VeForm){
	this.brreg = "https://data.brreg.no/enhetsregisteret/";
	this.searchName = function(name) {
		var link = this.brreg + "enhet.json?page=0&size=10&$filter=startswith%28navn%2C%27" + encodeURIComponent(name) + "%27%29";
		var deferred = $q.defer();
		$http.get(link).then(function(d){
			deferred.resolve(d.data.data);
		}, function() {
			deferred.reject(arguments);
		});
		return deferred.promise;
	};
	this.searchNr = function(nr) {
		var link = this.brreg + "enhet/" + nr + ".json";
		var deferred = $q.defer();
		$http.get(link).then(function(d){
			deferred.resolve(d);
		}, function() {
			deferred.reject(arguments);
		});
		return deferred.promise;
	};
	this.update = function(scope,d) {
		if ( !scope || !scope.data || !d ) return;
		brReg.stopped = true;
		var orgno = d.organisasjonsnummer.toString();
		scope.model.orgNumber = orgno.substr(0,3) + " " +
			orgno.substr(3,3) + " " + orgno.substr(6,3);
		scope.model.companyName = d.navn;
		if ( d.forretningsadresse ) {
			scope.model.postalAddress = d.forretningsadresse.adresse;
			scope.model.postalCode = d.forretningsadresse.postnummer;
			scope.model.postalTown = d.forretningsadresse.poststed;
			scope.model.Country = d.forretningsadresse.land;
		}
		if ( d.naeringskode1 ) {
			scope.model.business = d.naeringskode1.beskrivelse;
			scope.model.businessCode = d.naeringskode1.kode;
		}
		scope.model.InBrReg = true;
		scope.model.InFoReg = d.registrertIForetaksregisteret == "J";
		scope.model.InMvaReg = d.registrertIMvaregisteret == "J";
		scope.model.Konkurs = d.konkurs == "J";
		scope.model.Avvikling = d.underAvvikling == "J";
		scope.model.Tvangs = d.underTvangsavviklingEllerTvangsopplosning == "J";
	};
});

brReg.directive('getBrregNr', function($parse, $timeout, BrReg, VeForm){
	return {
		require: 'ngModel',
		link: function(scope, elem, attr, ngModel) {
			ngModel.options = { "debounce": 300 };

			scope.$watch(function() {
				return ngModel.$modelValue;
			}, function() {
				if ( brReg.stopped ) { // Stopped by update
					ngModel.$setValidity("auto", true);
					brReg.stopped = false; return;
				}
				var val = ngModel.$modelValue;
				if ( !val ) return;
				val = val.toString().replace(/[\.\s]/g,"");
				if ( val.length != 9 ) return;
				var valid = scope.checkNr(val);
				console.log("Check: ", val, valid)
				if ( scope.checkNr(val) )
					scope.searchNr(val);
				else
					ngModel.$setValidity("auto", false);
			});
			scope.checkNr = function (OrgNo) { // Checksum check
				if (!OrgNo) return false;
				var check = parseInt(OrgNo.charAt(OrgNo.length - 1), 10);
				return check === VeForm.mod11(OrgNo);
			};
			scope.searchNr = function(value) {
				BrReg.searchNr(value).then(function(ret){
					if ( ret.data ) {
						BrReg.update(scope,ret.data);
						if ( scope.updateForm ) scope.updateForm(ret.data);
						ngModel.$setValidity("auto", true);
					} else {
						ngModel.$setValidity("auto", false);
					}
				})
				.catch(function(err) {
					ngModel.$setValidity("auto", false);
				})
			}
		}
	}
});

brReg.directive('getBrregName', function(BrReg){
	return {
		require: 'ngModel',
		link: function(scope, elem, attr, ngModel) {
			ngModel.options = { "debounce": 300 };

			scope.$watch(function() {
				if ( !ngModel.$modelValue ) return 0;
				return ngModel.$modelValue.length;
			}, function(newValue,oldValue) {
				if ( brReg.stopped ) { // Stopped by update
					ngModel.$setValidity("auto", true);
					brReg.stopped = false; return;
				}
				if ( newValue < 3 ) return;
				var val = ngModel.$modelValue;
				if ( val ) scope.search(val);
			});
			scope.search = function(value) {
				BrReg.searchName(value).then(function(list){
					if ( value.length != ngModel.$modelValue.length ) return;
					scope.lists.BrRegDatalist = {};
					if ( !list ) {
						ngModel.$setValidity("auto", false)
					} else if ( list.length == 1 && list[0].navn.length == value.length ) {
						BrReg.update(scope,list[0]);
						if ( scope.updateForm ) scope.updateForm(list[0]);
						ngModel.$setValidity("auto", true)
					} else {
						var valid = false;
						list.forEach(function(item) {
							scope.lists.BrRegDatalist[item.navn] = item.organisasjonsnummer;
							if ( item.navn.length == value.length ) {
								BrReg.update(scope,item);
								valid = true;
							}
						});
						ngModel.$setValidity("auto", valid)
					}
				})
			}
		}
	}
})
.directive('brregNr', function($parse, $timeout, BrReg, VeForm) {
	return {
		restrict: 'E',
		scope: true,
		replace: true,
		template: '<div class="{{veCols}}"><label>{{label||translations[key][data.lang]}}</label>'
			+ '<input type="text" ng-model="model[key]" placeholder="{{translations[placeholder][data.lang]||placeholder}}" ve-change="{{veChange}}" '
			+ 'ng-required="required" ng-readonly="readonly"'
			+ 've-validator="{{veValidator}}" ve-valid="{{veValid}}" get-brreg-nr /></div>',
		link: function(s,e,a) {
			a.type = "brreg-nr"
			VeForm.linkFun(s,e,a,'input');
		}
	}
})
.directive('brregName', function(BrReg, VeForm) {
	return {
		restrict: 'E',
		scope: true,
		replace: true,
		template: '<div class="{{veCols}}"><label>{{label||translations[key][data.lang]}}</label>'
			+ '<div class="data-list">'
			+ '<input type="text" ng-model="model[key]" placeholder="{{translations[placeholder][data.lang]||placeholder}}" ve-change="{{veChange}}" '
			+ 'ng-change="menus.brreg=true; $event.stopPropagation()" ng-click="menus.brreg=!menus.brreg"'
			+ 'ng-required="required" ng-readonly="readonly" ve-validator="{{veValidator}}" get-brreg-name />'
			+ '<ul ng-show="menus.brreg" on-click-outside="menus.brreg=false">'
			+ '<li ng-repeat="(i,value) in lists.BrRegDatalist track by $index"'
			+ ' ng-click="model[key]=i; menus.brreg=!menus.brreg">{{i}}</li>'
			+ '</ul></div></div>',
		link: function(s,e,a) {
			a.type = "brreg-name"
			VeForm.linkFun(s,e,a,'input');
		}
	}
})
.directive('brregStatusBox', function( $compile ) {
	return {
		restrict: 'E',
		scope: false,
		replace: true,
		template: '<div class="flex-columns" style="width: 100%"><div class="col col-2">'
			+ '<b>{{translations.InBrReg[data.lang]||"I enhetsregisteret"}}:&nbsp;</b>'
			+ '<i ng-if="data.InBrReg">{{translations.yes[data.lang]||"Ja"}}</i>'
			+ '<i ng-if="data.InBrReg==false">{{translations.no[data.lang]||"Nei"}}</i></br>'
			+ '<b>{{translations.InFoReg[data.lang]||"I foretaksregisteret"}}:&nbsp;</b>'
			+ '<i ng-if="data.InFoReg">{{translations.yes[data.lang]||"Ja"}}</i>'
			+ '<i ng-if="data.InFoReg==false">{{translations.no[data.lang]||"Nei"}}</i></br>'
			+ '<b>{{translations.InMvaReg[data.lang]||"I MVA-registeret"}}:&nbsp;</b>'
			+ '<i ng-if="data.InMvaReg">{{translations.yes[data.lang]||"Ja"}}</i>'
			+ '<i ng-if="data.InMvaReg==false">{{translations.no[data.lang]||"Nei"}}</i></br>'
			+ '</div><div class="col col-2">'
			+ '<b>{{translations.Konkurs[data.lang]||"Konkurs"}}:&nbsp;</b>'
			+ '<i ng-if="data.Konkurs">{{translations.yes[data.lang]||"Ja"}}</i>'
			+ '<i ng-if="data.Konkurs==false">{{translations.no[data.lang]||"Nei"}}</i></br>'
			+ '<b>{{translations.Avvikling[data.lang]||"Under avvikling"}}:&nbsp;</b>'
			+ '<i ng-if="data.Avvikling">{{translations.yes[data.lang]||"Ja"}}</i>'
			+ '<i ng-if="data.Avvikling==false">{{translations.no[data.lang]||"Nei"}}</i></br>'
			+ '<b>{{translations.Tvangs[data.lang]||"Under tvangsavvikling/oppløsning"}}:&nbsp;</b>'
			+ '<i ng-if="data.Tvangs">{{translations.yes[data.lang]||"Ja"}}</i>'
			+ '<i ng-if="data.Tvangs==false">{{translations.no[data.lang]||"Nei"}}</i></br>'
			+ '</div><div>'
	}
});
