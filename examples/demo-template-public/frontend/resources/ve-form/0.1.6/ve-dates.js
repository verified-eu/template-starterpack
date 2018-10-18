var veDates = angular.module('VeDates', ['VeForm', 'ngAnimate', 'ui.bootstrap']);

veDates.service('VeDates', function($q, $http, VeForm){
	this.clear = function() {
		this.dt = null;
	};

	// Disable weekend selection
	this.disabled = function(date, mode) {
		return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
	};

	this.toggleMin = function() {
		this.minDate = this.minDate ? null : new Date();
	};
	this.toggleMin();

	this.maxDate = new Date(2020, 5, 22);

	this.setDate = function(year, month, day) {
		this.dt = new Date(year, month, day);
	};

	this.dateStr = function(t) {
		if ( !t ) return "";
		var dd = t.getDate();
		var mm = t.getMonth() + 1;
		if ( dd < 10 ) dd = '0'+dd;
		if ( mm < 10 ) mm = '0'+mm;
		return t.getFullYear() + '-' + mm + '-' + dd;
	};

	this.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	this.datePickerOptions = {
		popupPlacement: "top right"
	};

	this.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy','d!.M!.yyyy', 'shortDate'];
	this.format = this.formats[0];
	this.altInputFormats = ['M!/d!/yyyy'];

	var tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	var afterTomorrow = new Date();
	afterTomorrow.setDate(tomorrow.getDate() + 1);
	this.events = [
		{
			date: tomorrow,
			status: 'full'
		},
		{
			date: afterTomorrow,
			status: 'partially'
		}
	];

	this.getDayClass = function(date, mode) {
		if (mode === 'day') {
			var dayToCheck = new Date(date).setHours(0,0,0,0);

			for (var i = 0; i < this.events.length; i++) {
				var currentDay = new Date(this.events[i].date).setHours(0,0,0,0);

				if (dayToCheck === currentDay) {
					return this.events[i].status;
				}
			}
		}
		return '';
	};

});

veDates.directive( 'veDatePicker', function ( $compile, VeForm ) {
	return {
		restrict: 'AE',
		scope: true,
		replace: true,
		transclude: true,
		template: '<div class="{{veCols}}" ng-show="do(show)">'
						+ '<my-label ng-if="!nolabel" style="{{lastyle}}"></my-label>'
						+ '<input type="text" class="{{class}}" '
						+ 'uib-datepicker-popup="{{format}}" date-closer '
						+ 'min-date="minDate" popup-placement="{{placement}}" '
						+ 'ng-click="openDate()" '
						+ 'ng-model="model[key]" is-open="menus[key]" '
						+ 'ng-required="do(required)" readonly '
						+ 'clear-text="{{translations.clear[data.lang]}}" '
						+ 'close-text="{{translations.close[data.lang]}}" '
						+ 'current-text="{{translations.today[data.lang]}}" '
						+ 'alt-input-formats="altInputFormats" '
						+ '/></div>',
		link: function(scope,elem,attr) {
			VeForm.linkFun(scope,elem,attr,'datepicker');
			scope.class = "form-control";
			if ( attr.icon === "" ) scope.class += " datepicker-icon"
			scope.placement = "";
			if ( attr.bottom === "" ) scope.placement += " bottom";
			if ( attr.bottomRight === "" ) scope.placement += " bottom-right";
			scope.do = function (it) { return scope.$eval( it ); }
			scope.openDate = function() { scope.menus[scope.key] = true; }
		}
	}
}).directive( 'dateCloser', function ( $document ) {
	return {
		restrict: 'A',
		scope: false,
		require: 'ngModel',
		link: function ( scope, el, attr, ngModel ) {
			$document.on( 'click', function ( e ) {
			if ( scope.menus[scope.key] && el !== e.target && !el[ 0 ].contains( e.target ) ) {
					scope.$apply( function () { scope.menus[scope.key]=false; } )
				}
			} );
		}
	}
});
