(function () {
	'use strict';

	angular.module('app')
		.controller('NewProjectCtrl', function ($modalInstance, Users) {
			var vm = this;

			vm.users   = Users.users;
			vm.project = {};

			vm.close = function close() {
				$modalInstance.close(vm.project);
			};

			vm.dismiss = function dismiss() {
				$modalInstance.dismiss();
			};
		});
}());