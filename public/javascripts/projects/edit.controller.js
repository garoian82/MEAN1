(function () {
	'use strict';

	angular.module('app')
		.controller('EditController', function (project, Projects, Users) {
			var vm = this;

			vm.users   = Users.users;
			vm.project = project;
			vm.update  = Projects.put;
		});
}());