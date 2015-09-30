(function () {
	'use strict';

	angular.module('app')
		.controller('BodyController', function (Projects) {
			
			var vm = this;

			vm.welcome = 'Hi There';

			//get projects from server
			Projects.get()
				.then(function (projects) {
					vm.projects = projects;
				});
		});
}());


