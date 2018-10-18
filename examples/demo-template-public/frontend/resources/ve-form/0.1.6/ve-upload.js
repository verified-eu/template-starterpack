var veUpload = angular.module('VeUpload', ['VeForm', 'ngFileUpload']);

veUpload.service('VeUpload', function($q, $http, VeForm, Upload, $timeout) {
	this.getFileList = function(scope) {
		VeLib.public_templates.getAllFiles()
		.then( function(files) {
			console.log("Scope:", scope)
			scope.uploadFiles = files
			scope.$apply( function() { scope.busy = scope.uploading = false } )
		})
	}

	this.uploadFile = function(scope,file){
		scope.busy = scope.uploading = true;
		VeLib.public_templates.getUploadUrl({ name: file.name })
		.then( function(response) {
			return Upload.http({
				url: response.url,
				method: "PUT",
				data: file,
				headers: {
					"Authorization": "JWT " + VeLib.core.state.get().internal.accessToken,
					"Content-Type": file.type
				}
			})
		})
		.then($timeout( this.getFileList(scope), 2500));
	}

	this.removeFile = function(scope, uid) {
		scope.busy = true;
		return VeLib.public_templates.removeFile(uid).then(function() {
			scope.uploadFiles = scope.uploadFiles.filter( function(currFile) { currFile.uid != uid })
		})
		.then(function(){ scope.$apply( function() { scope.busy = false })})
	}
});

veUpload.directive( 'veUploadButton', function ( $compile, VeUpload ) {
	return {
		restrict: 'E',
		replace: true,
		template: '<p ng-if="do(show)">'
						+ '<span class="btn btn-primary" ngf-select="uploadIt( $file )">{{text||translations.upload[data.lang]}}</span>'
						+ '</p>',
		link: function(scope,elem,attr) {
			if ( !scope.uploadFiles ) scope.uploadFiles = [];
			scope.show = attr.show ? attr.show : "true";
			scope.text = attr.text || "";
			scope.uploadIt = function (it) { return VeUpload.uploadFile( scope, it ); }
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
}).directive( 'veUploadList', function ( $compile, VeUpload ) {
	return {
		restrict: 'E',
		template: '<ul ng-if="do(show)">'
						+ '<li ng-repeat="file in uploadFiles">'
						+ '{{file.name}}&nbsp;-&nbsp;<a ng-click="removeIt(file.uid)">{{translations.remove[data.lang]||\"remove\"}}</a>'
						+ '</li></ul>',
		link: function(scope,elem,attr) {
			scope.removeIt = function (it) { return VeUpload.removeFile( scope, it ); }
			scope.do = function (it) { return scope.$eval( it ); }
		}
	}
});
