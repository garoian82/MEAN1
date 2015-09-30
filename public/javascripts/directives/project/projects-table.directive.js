(function () {
	'use strict';

	angular.module('app.ui')
		//always camel case the directive in the .directive
		
		.directive('projectsTable', function (Projects) {
			//CREAT THE DDO (Directive Definition Object)

			function controller ($scope) {
				$scope.remove = Projects.del;
			}
			
			return {
				restrict: 'E',
				templateUrl: 'partials/directives/project-table.html',
				controller: controller,
				scope: {
					projects: '=',
					remove: '='
				}
			};
		});
}());