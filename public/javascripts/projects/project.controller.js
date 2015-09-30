(function () {
	
	'use strict';

	angular.module('app')
		.controller('ProjectController', function (project, Projects) {
			var vm = this;

			vm.project = project;
			vm.del = Projects.del;
		});
}());