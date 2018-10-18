var app = angular.module('mainApp', ['VeForm', 'ngFileUpload', 'VeUpload']);

app.controller('mainController',function($scope, $http, $timeout, $window, $interval, VeForm) {

	// Our descriptor (Note that your token needs permission to the descriptor chosen here in order for any of this to work)
	var descriptor = 'demo-template-public';

	// Our main angular data object that we'll send as template payload
	$scope.data = {};

	// our template instance. This will be assigned on VeLib initialization
	var template = null;

	// Whether or not to show the loader
	$scope.busy = false;

	// Needed for the ve-form tooltips to work
	$scope.tips = {};

	// Initialize VeLib with our descriptor
	VeLib.core.init({ descriptor_id: descriptor })
	.then(function(ok) {
		return VeLib.public_templates.init();
	})
	.then(function(status) {
		return VeLib.public_templates.getTemplateInterface();
	})
	.then(function(templates) {
		template = templates[0];
	})
	.catch(function(error) {
		alert('Error during template initialization. Make sure you use a valid access token.');
	});

	$scope.submit = function () {

		// Copy paste this output into a json formatter and use it in your printpdf-json file for testing
		console.log(JSON.stringify($scope.data));

		// Makes the loader appear and is typically used to disable form inputs
		$scope.busy = true;

		// Decides whether or not the envelope should be forwarded to the first recipient. When forwarded an email with signing link will be sent out. When not forwarded a signlink can be retrieved from VeLib.
		$scope.data._isForwarded = false;

		// Choose a filename for the document we will be generating. Does not have to end in .pdf
		$scope.data.fileName = "Demo Template.pdf";

		// Set template data
		template.setData(JSON.parse(angular.toJson($scope.data)));

		// Submit template data
		VeLib.public_templates.submitFormData()

		.then(function() {
			// Add our recipient(s)
			return VeLib.public_templates.addRecipients([
				{
					"givenName": $scope.data.lastName,
					"familyName": $scope.data.firstName,
					"language": "sv_SE",
					"signingMethod": "bankid-se",
					"email": $scope.data.email,
					"order": 1,
					"role": {
						"action": "sign",
						"label": "Signer",
						"name": "signer"
					}
				}
			])
		})

		.then(function () {
			// Publish the envelope
			return VeLib.public_templates.publish();

		} ).then(function (url) {
			// Redirect user to the signing page, you can also set language and redirect url here
			window.location.href = url + '&lang=sv_SE&redirect_to=' + encodeURIComponent($scope.redirectSign);
		} )
		.catch(function(error) {
			console.log(error);
		});

	}

});
