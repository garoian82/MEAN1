(function () {
	'use strict';
	angular.module('app', ['ui.router', 'app.ui', 'ui.bootstrap'])

	.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
		//Default route
		$urlRouterProvider.otherwise('/projects');

		//Define our states 
		$stateProvider
			.state('projects', {
				url: '/projects',
				templateUrl: 'partials/projects/index.html',
				controller: 'ProjectsController',
				controllerAs: 'projectsController',
				resolve: {
					users: ["Users", function (Users) {
						return Users.get();
					}],
					projects: ["Projects", "users", function (Projects, users) {
						return Projects.get();
					}]
				}
			})

			.state('projects.detail', {
				url: '/:projectId',
				templateUrl: 'partials/projects/detail.html',
				controller: 'ProjectController',
				controllerAs: 'projectController',
				resolve: {
					project: ["Projects", "$stateParams", "projects", function (Projects, $stateParams, projects) {
						return Projects.find($stateParams.projectId);
					}]
				}
			})
			.state('projects.detail.edit', {
				url: '/edit',
				templateUrl: 'partials/projects/edit.html',
				controller: 'EditController',
				controllerAs: 'editController'
			})
			.state('new', {
				url: '/new',
				templateUrl: 'partials/projects/add.html',
				controller: 'AddController',
				controllerAs: 'addController'
			});
	}]);

}());
(function () {
	'use strict';

	angular.module('app.ui', []);
	
}());
(function () {
	'use strict';

	angular.module('app')
		.controller('BodyController', ["Projects", function (Projects) {
			
			var vm = this;

			vm.welcome = 'Hi There';

			//get projects from server
			Projects.get()
				.then(function (projects) {
					vm.projects = projects;
				});
		}]);
}());



(function () {
	'use strict';

	angular.module('app')
		.factory('User', function () {

			function User(data) {
				_.merge(this, {
					first_name: '',
					last_name: '',
					email: ''
				}, data || {});
			}

			User.prototype = {
				fullName: function fullName() {
					return this.first_name + ' ' + this.last_name;
					debugger;
				}
			};

			return User;
		});
}());
(function () {
	'use strict';

	angular.module('app')
		.filter('niceDate', function () {
			return function (timeStamp, format) {
				format = format || 'MMMM Do, YYYY';
				var m = moment(timeStamp);
				return m.format(format);
			};
		});
}());
(function () {
	'use strict';

	angular.module('app')
		.controller('EditController', ["project", "Projects", "Users", function (project, Projects, Users) {
			var vm = this;
			debugger;
			vm.users   = Users.users;
			vm.project = project;
			vm.update  = Projects.put;
		}]);
}());
(function () {
	'use strict';

	angular.module('app')
		.controller('NewProjectCtrl', ["$modalInstance", "Users", function ($modalInstance, Users) {
			var vm = this;

			vm.users   = Users.users;
			vm.project = {};

			vm.close = function close() {
				$modalInstance.close(vm.project);
			};

			vm.dismiss = function dismiss() {
				$modalInstance.dismiss();
			};
		}]);
}());
(function () {
	
	'use strict';

	angular.module('app')
		.controller('ProjectController', ["project", "Projects", function (project, Projects) {
			var vm = this;

			vm.project = project;
			vm.del = Projects.del;
		}]);
}());
(function () {
	
	'use strict';

	angular.module('app')
		.controller('ProjectsController', ["projects", "Projects", "$modal", "$state", function (projects, Projects, $modal, $state) {
			var vm = this;

			vm.projects = projects;
			vm.remove = Projects.del;
			vm.addProject = function addProject() {
				var modalInstatance = $modal.open ({
					templateUrl: 'partials/projects/new.html',
					controller: 'NewProjectCtrl',
					controllerAs: 'newProject',
					size: 'md'
				}).result.then(function (res) {
					Projects.post(res);
				});
					
			};
			
		}]);
}());
(function () {
	'use strict';


	angular.module('app')
		.service('Projects', ["$http", "$state", "Users", function ($http, $state, Users) {
			
			var vm = this;

			vm.projects = [];

			//use lodash to find a prarticular project id
			vm.find = function find(projectId) {
				return _.find(vm.projects, {_id: projectId});
			};

			//get our projects from our server
			vm.get = function get () {
				return $http.get('/projects')
				.then(function (res) {
					vm.projects.splice(0);
					res.data.forEach(function (project) {
						project.user = Users.find(project.user);
						vm.projects.push(project);
					});
					return vm.projects;
				});
			};

			vm.post = function post(project) {

				return $http.post('/projects/', project)
				.then(function (res) {
					debugger;
					res.data.user = Users.find(res.data.user);
					vm.projects.push(res.data);
					debugger;
				});
			};

			// vm.post = function post(project) {

			// 	return $http.post('/projects/')
			// 	.then(function (res) {
			// 		vm.projects.push({project});
			// 		$state.go('projects');
			// 		debugger;
			// 	});
			// };

			vm.put = function put(project) {
				var data = {title: project.title};
				return $http.put('/projects/' + project._id, data)
				.then(function (res) {
					$state.go('projects.detail', {projectId: project._id});
				}, function (err) {
					//TODO: handle when we can't update a project.
				});
			
			};

			vm.remove = function remove (projectId) {
				_.remove(vm.projects, {_id: projectId._id});
			};

			vm.del = function del (projectId) {
				return $http.delete('/projects/' + projectId)
				.then(function (res) {
					vm.remove(projectId);
					$state.go('projects');
				});

			};
		}]);
}());









(function () {

	'use strict';

	angular.module('app')
		.service('Users', ["$http", "User", function ($http, User) {
			var vm = this;
			vm.users = [];

			vm.find = function find(userId) {
				return _.find(vm.users, {_id: userId});
			};

			vm.get = function get() {
				return $http.get('/users')
				.then(function (res) {
					vm.users.splice(0);

					res.data.forEach(function (user) {
						vm.users.push(new User(user));
					});

					return vm.users;
				});
			};

		}]);

}());
(function () {
	'use strict';

	angular.module('app.ui')
		//always camel case the directive in the .directive
		
		.directive('projectsTable', ["Projects", function (Projects) {
			//CREAT THE DDO (Directive Definition Object)

			function controller ($scope) {
				$scope.remove = Projects.del;
			}
			controller.$inject = ["$scope"];
			
			return {
				restrict: 'E',
				templateUrl: 'partials/directives/project-table.html',
				controller: controller,
				scope: {
					projects: '=',
					remove: '='
				}
			};
		}]);
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJ1aS5tb2R1bGUuanMiLCJib2R5LmNvbnRyb2xsZXIuanMiLCJmYWN0b3JpZXMvdXNlci5mYWN0b3J5LmpzIiwiZmlsdGVycy9kYXRlLmZpbHRlci5qcyIsInByb2plY3RzL2VkaXQuY29udHJvbGxlci5qcyIsInByb2plY3RzL25ldy1wcm9qZWN0LmNvbnRyb2xsZXIuanMiLCJwcm9qZWN0cy9wcm9qZWN0LmNvbnRyb2xsZXIuanMiLCJwcm9qZWN0cy9wcm9qZWN0cy5jb250cm9sbGVyLmpzIiwic2VydmljZXMvcHJvamVjdHMuc2VydmljZS5qcyIsInNlcnZpY2VzL3VzZXJzLnNlcnZpY2UuanMiLCJkaXJlY3RpdmVzL3Byb2plY3QvcHJvamVjdHMtdGFibGUuZGlyZWN0aXZlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQUEsWUFBQTtDQUNBO0NBQ0EsUUFBQSxPQUFBLE9BQUEsQ0FBQSxhQUFBLFVBQUE7O0VBRUEsZ0RBQUEsVUFBQSxnQkFBQSxvQkFBQTs7RUFFQSxtQkFBQSxVQUFBOzs7RUFHQTtJQUNBLE1BQUEsWUFBQTtJQUNBLEtBQUE7SUFDQSxhQUFBO0lBQ0EsWUFBQTtJQUNBLGNBQUE7SUFDQSxTQUFBO0tBQ0EsaUJBQUEsVUFBQSxPQUFBO01BQ0EsT0FBQSxNQUFBOztLQUVBLGdDQUFBLFVBQUEsVUFBQSxPQUFBO01BQ0EsT0FBQSxTQUFBOzs7OztJQUtBLE1BQUEsbUJBQUE7SUFDQSxLQUFBO0lBQ0EsYUFBQTtJQUNBLFlBQUE7SUFDQSxjQUFBO0lBQ0EsU0FBQTtLQUNBLGtEQUFBLFVBQUEsVUFBQSxjQUFBLFVBQUE7TUFDQSxPQUFBLFNBQUEsS0FBQSxhQUFBOzs7O0lBSUEsTUFBQSx3QkFBQTtJQUNBLEtBQUE7SUFDQSxhQUFBO0lBQ0EsWUFBQTtJQUNBLGNBQUE7O0lBRUEsTUFBQSxPQUFBO0lBQ0EsS0FBQTtJQUNBLGFBQUE7SUFDQSxZQUFBO0lBQ0EsY0FBQTs7Ozs7QUM5Q0EsQ0FBQSxZQUFBO0NBQ0E7O0NBRUEsUUFBQSxPQUFBLFVBQUE7OztBQ0hBLENBQUEsWUFBQTtDQUNBOztDQUVBLFFBQUEsT0FBQTtHQUNBLFdBQUEsK0JBQUEsVUFBQSxVQUFBOztHQUVBLElBQUEsS0FBQTs7R0FFQSxHQUFBLFVBQUE7OztHQUdBLFNBQUE7S0FDQSxLQUFBLFVBQUEsVUFBQTtLQUNBLEdBQUEsV0FBQTs7Ozs7OztBQ2JBLENBQUEsWUFBQTtDQUNBOztDQUVBLFFBQUEsT0FBQTtHQUNBLFFBQUEsUUFBQSxZQUFBOztHQUVBLFNBQUEsS0FBQSxNQUFBO0lBQ0EsRUFBQSxNQUFBLE1BQUE7S0FDQSxZQUFBO0tBQ0EsV0FBQTtLQUNBLE9BQUE7T0FDQSxRQUFBOzs7R0FHQSxLQUFBLFlBQUE7SUFDQSxVQUFBLFNBQUEsV0FBQTtLQUNBLE9BQUEsS0FBQSxhQUFBLE1BQUEsS0FBQTtLQUNBOzs7O0dBSUEsT0FBQTs7O0FDckJBLENBQUEsWUFBQTtDQUNBOztDQUVBLFFBQUEsT0FBQTtHQUNBLE9BQUEsWUFBQSxZQUFBO0dBQ0EsT0FBQSxVQUFBLFdBQUEsUUFBQTtJQUNBLFNBQUEsVUFBQTtJQUNBLElBQUEsSUFBQSxPQUFBO0lBQ0EsT0FBQSxFQUFBLE9BQUE7Ozs7QUNSQSxDQUFBLFlBQUE7Q0FDQTs7Q0FFQSxRQUFBLE9BQUE7R0FDQSxXQUFBLG1EQUFBLFVBQUEsU0FBQSxVQUFBLE9BQUE7R0FDQSxJQUFBLEtBQUE7R0FDQTtHQUNBLEdBQUEsVUFBQSxNQUFBO0dBQ0EsR0FBQSxVQUFBO0dBQ0EsR0FBQSxVQUFBLFNBQUE7OztBQ1RBLENBQUEsWUFBQTtDQUNBOztDQUVBLFFBQUEsT0FBQTtHQUNBLFdBQUEsOENBQUEsVUFBQSxnQkFBQSxPQUFBO0dBQ0EsSUFBQSxLQUFBOztHQUVBLEdBQUEsVUFBQSxNQUFBO0dBQ0EsR0FBQSxVQUFBOztHQUVBLEdBQUEsUUFBQSxTQUFBLFFBQUE7SUFDQSxlQUFBLE1BQUEsR0FBQTs7O0dBR0EsR0FBQSxVQUFBLFNBQUEsVUFBQTtJQUNBLGVBQUE7Ozs7QUNmQSxDQUFBLFlBQUE7O0NBRUE7O0NBRUEsUUFBQSxPQUFBO0dBQ0EsV0FBQSw2Q0FBQSxVQUFBLFNBQUEsVUFBQTtHQUNBLElBQUEsS0FBQTs7R0FFQSxHQUFBLFVBQUE7R0FDQSxHQUFBLE1BQUEsU0FBQTs7O0FDVEEsQ0FBQSxZQUFBOztDQUVBOztDQUVBLFFBQUEsT0FBQTtHQUNBLFdBQUEsbUVBQUEsVUFBQSxVQUFBLFVBQUEsUUFBQSxRQUFBO0dBQ0EsSUFBQSxLQUFBOztHQUVBLEdBQUEsV0FBQTtHQUNBLEdBQUEsU0FBQSxTQUFBO0dBQ0EsR0FBQSxhQUFBLFNBQUEsYUFBQTtJQUNBLElBQUEsa0JBQUEsT0FBQSxNQUFBO0tBQ0EsYUFBQTtLQUNBLFlBQUE7S0FDQSxjQUFBO0tBQ0EsTUFBQTtPQUNBLE9BQUEsS0FBQSxVQUFBLEtBQUE7S0FDQSxTQUFBLEtBQUE7Ozs7Ozs7QUNqQkEsQ0FBQSxZQUFBO0NBQ0E7OztDQUdBLFFBQUEsT0FBQTtHQUNBLFFBQUEseUNBQUEsVUFBQSxPQUFBLFFBQUEsT0FBQTs7R0FFQSxJQUFBLEtBQUE7O0dBRUEsR0FBQSxXQUFBOzs7R0FHQSxHQUFBLE9BQUEsU0FBQSxLQUFBLFdBQUE7SUFDQSxPQUFBLEVBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQSxLQUFBOzs7O0dBSUEsR0FBQSxNQUFBLFNBQUEsT0FBQTtJQUNBLE9BQUEsTUFBQSxJQUFBO0tBQ0EsS0FBQSxVQUFBLEtBQUE7S0FDQSxHQUFBLFNBQUEsT0FBQTtLQUNBLElBQUEsS0FBQSxRQUFBLFVBQUEsU0FBQTtNQUNBLFFBQUEsT0FBQSxNQUFBLEtBQUEsUUFBQTtNQUNBLEdBQUEsU0FBQSxLQUFBOztLQUVBLE9BQUEsR0FBQTs7OztHQUlBLEdBQUEsT0FBQSxTQUFBLEtBQUEsU0FBQTs7SUFFQSxPQUFBLE1BQUEsS0FBQSxjQUFBO0tBQ0EsS0FBQSxVQUFBLEtBQUE7S0FDQTtLQUNBLElBQUEsS0FBQSxPQUFBLE1BQUEsS0FBQSxJQUFBLEtBQUE7S0FDQSxHQUFBLFNBQUEsS0FBQSxJQUFBO0tBQ0E7Ozs7Ozs7Ozs7Ozs7O0dBY0EsR0FBQSxNQUFBLFNBQUEsSUFBQSxTQUFBO0lBQ0EsSUFBQSxPQUFBLENBQUEsT0FBQSxRQUFBO0lBQ0EsT0FBQSxNQUFBLElBQUEsZUFBQSxRQUFBLEtBQUE7S0FDQSxLQUFBLFVBQUEsS0FBQTtLQUNBLE9BQUEsR0FBQSxtQkFBQSxDQUFBLFdBQUEsUUFBQTtPQUNBLFVBQUEsS0FBQTs7Ozs7O0dBTUEsR0FBQSxTQUFBLFNBQUEsUUFBQSxXQUFBO0lBQ0EsRUFBQSxPQUFBLEdBQUEsVUFBQSxDQUFBLEtBQUEsVUFBQTs7O0dBR0EsR0FBQSxNQUFBLFNBQUEsS0FBQSxXQUFBO0lBQ0EsT0FBQSxNQUFBLE9BQUEsZUFBQTtLQUNBLEtBQUEsVUFBQSxLQUFBO0tBQ0EsR0FBQSxPQUFBO0tBQ0EsT0FBQSxHQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUNyRUEsQ0FBQSxZQUFBOztDQUVBOztDQUVBLFFBQUEsT0FBQTtHQUNBLFFBQUEsMkJBQUEsVUFBQSxPQUFBLE1BQUE7R0FDQSxJQUFBLEtBQUE7R0FDQSxHQUFBLFFBQUE7O0dBRUEsR0FBQSxPQUFBLFNBQUEsS0FBQSxRQUFBO0lBQ0EsT0FBQSxFQUFBLEtBQUEsR0FBQSxPQUFBLENBQUEsS0FBQTs7O0dBR0EsR0FBQSxNQUFBLFNBQUEsTUFBQTtJQUNBLE9BQUEsTUFBQSxJQUFBO0tBQ0EsS0FBQSxVQUFBLEtBQUE7S0FDQSxHQUFBLE1BQUEsT0FBQTs7S0FFQSxJQUFBLEtBQUEsUUFBQSxVQUFBLE1BQUE7TUFDQSxHQUFBLE1BQUEsS0FBQSxJQUFBLEtBQUE7OztLQUdBLE9BQUEsR0FBQTs7Ozs7OztBQ3RCQSxDQUFBLFlBQUE7Q0FDQTs7Q0FFQSxRQUFBLE9BQUE7OztHQUdBLFVBQUEsOEJBQUEsVUFBQSxVQUFBOzs7R0FHQSxTQUFBLFlBQUEsUUFBQTtJQUNBLE9BQUEsU0FBQSxTQUFBOzs7O0dBR0EsT0FBQTtJQUNBLFVBQUE7SUFDQSxhQUFBO0lBQ0EsWUFBQTtJQUNBLE9BQUE7S0FDQSxVQUFBO0tBQ0EsUUFBQTs7OztLQUlBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0YW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJywgJ2FwcC51aScsICd1aS5ib290c3RyYXAnXSlcblxuXHQuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cdFx0Ly9EZWZhdWx0IHJvdXRlXG5cdFx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3Byb2plY3RzJyk7XG5cblx0XHQvL0RlZmluZSBvdXIgc3RhdGVzIFxuXHRcdCRzdGF0ZVByb3ZpZGVyXG5cdFx0XHQuc3RhdGUoJ3Byb2plY3RzJywge1xuXHRcdFx0XHR1cmw6ICcvcHJvamVjdHMnLFxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL3Byb2plY3RzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnUHJvamVjdHNDb250cm9sbGVyJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncHJvamVjdHNDb250cm9sbGVyJyxcblx0XHRcdFx0cmVzb2x2ZToge1xuXHRcdFx0XHRcdHVzZXJzOiBmdW5jdGlvbiAoVXNlcnMpIHtcblx0XHRcdFx0XHRcdHJldHVybiBVc2Vycy5nZXQoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByb2plY3RzOiBmdW5jdGlvbiAoUHJvamVjdHMsIHVzZXJzKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvamVjdHMuZ2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXG5cdFx0XHQuc3RhdGUoJ3Byb2plY3RzLmRldGFpbCcsIHtcblx0XHRcdFx0dXJsOiAnLzpwcm9qZWN0SWQnLFxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL3Byb2plY3RzL2RldGFpbC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1Byb2plY3RDb250cm9sbGVyJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAncHJvamVjdENvbnRyb2xsZXInLFxuXHRcdFx0XHRyZXNvbHZlOiB7XG5cdFx0XHRcdFx0cHJvamVjdDogZnVuY3Rpb24gKFByb2plY3RzLCAkc3RhdGVQYXJhbXMsIHByb2plY3RzKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvamVjdHMuZmluZCgkc3RhdGVQYXJhbXMucHJvamVjdElkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuc3RhdGUoJ3Byb2plY3RzLmRldGFpbC5lZGl0Jywge1xuXHRcdFx0XHR1cmw6ICcvZWRpdCcsXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAncGFydGlhbHMvcHJvamVjdHMvZWRpdC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0VkaXRDb250cm9sbGVyJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnZWRpdENvbnRyb2xsZXInXG5cdFx0XHR9KVxuXHRcdFx0LnN0YXRlKCduZXcnLCB7XG5cdFx0XHRcdHVybDogJy9uZXcnLFxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL3Byb2plY3RzL2FkZC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkZENvbnRyb2xsZXInLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhZGRDb250cm9sbGVyJ1xuXHRcdFx0fSk7XG5cdH0pO1xuXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyLm1vZHVsZSgnYXBwLnVpJywgW10pO1xuXHRcbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuXHRcdC5jb250cm9sbGVyKCdCb2R5Q29udHJvbGxlcicsIGZ1bmN0aW9uIChQcm9qZWN0cykge1xuXHRcdFx0XG5cdFx0XHR2YXIgdm0gPSB0aGlzO1xuXG5cdFx0XHR2bS53ZWxjb21lID0gJ0hpIFRoZXJlJztcblxuXHRcdFx0Ly9nZXQgcHJvamVjdHMgZnJvbSBzZXJ2ZXJcblx0XHRcdFByb2plY3RzLmdldCgpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChwcm9qZWN0cykge1xuXHRcdFx0XHRcdHZtLnByb2plY3RzID0gcHJvamVjdHM7XG5cdFx0XHRcdH0pO1xuXHRcdH0pO1xufSgpKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhci5tb2R1bGUoJ2FwcCcpXG5cdFx0LmZhY3RvcnkoJ1VzZXInLCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdGZ1bmN0aW9uIFVzZXIoZGF0YSkge1xuXHRcdFx0XHRfLm1lcmdlKHRoaXMsIHtcblx0XHRcdFx0XHRmaXJzdF9uYW1lOiAnJyxcblx0XHRcdFx0XHRsYXN0X25hbWU6ICcnLFxuXHRcdFx0XHRcdGVtYWlsOiAnJ1xuXHRcdFx0XHR9LCBkYXRhIHx8IHt9KTtcblx0XHRcdH1cblxuXHRcdFx0VXNlci5wcm90b3R5cGUgPSB7XG5cdFx0XHRcdGZ1bGxOYW1lOiBmdW5jdGlvbiBmdWxsTmFtZSgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5maXJzdF9uYW1lICsgJyAnICsgdGhpcy5sYXN0X25hbWU7XG5cdFx0XHRcdFx0ZGVidWdnZXI7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdHJldHVybiBVc2VyO1xuXHRcdH0pO1xufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhci5tb2R1bGUoJ2FwcCcpXG5cdFx0LmZpbHRlcignbmljZURhdGUnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKHRpbWVTdGFtcCwgZm9ybWF0KSB7XG5cdFx0XHRcdGZvcm1hdCA9IGZvcm1hdCB8fCAnTU1NTSBEbywgWVlZWSc7XG5cdFx0XHRcdHZhciBtID0gbW9tZW50KHRpbWVTdGFtcCk7XG5cdFx0XHRcdHJldHVybiBtLmZvcm1hdChmb3JtYXQpO1xuXHRcdFx0fTtcblx0XHR9KTtcbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuXHRcdC5jb250cm9sbGVyKCdFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uIChwcm9qZWN0LCBQcm9qZWN0cywgVXNlcnMpIHtcblx0XHRcdHZhciB2bSA9IHRoaXM7XG5cdFx0XHRkZWJ1Z2dlcjtcblx0XHRcdHZtLnVzZXJzICAgPSBVc2Vycy51c2Vycztcblx0XHRcdHZtLnByb2plY3QgPSBwcm9qZWN0O1xuXHRcdFx0dm0udXBkYXRlICA9IFByb2plY3RzLnB1dDtcblx0XHR9KTtcbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuXHRcdC5jb250cm9sbGVyKCdOZXdQcm9qZWN0Q3RybCcsIGZ1bmN0aW9uICgkbW9kYWxJbnN0YW5jZSwgVXNlcnMpIHtcblx0XHRcdHZhciB2bSA9IHRoaXM7XG5cblx0XHRcdHZtLnVzZXJzICAgPSBVc2Vycy51c2Vycztcblx0XHRcdHZtLnByb2plY3QgPSB7fTtcblxuXHRcdFx0dm0uY2xvc2UgPSBmdW5jdGlvbiBjbG9zZSgpIHtcblx0XHRcdFx0JG1vZGFsSW5zdGFuY2UuY2xvc2Uodm0ucHJvamVjdCk7XG5cdFx0XHR9O1xuXG5cdFx0XHR2bS5kaXNtaXNzID0gZnVuY3Rpb24gZGlzbWlzcygpIHtcblx0XHRcdFx0JG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuXHRcdFx0fTtcblx0XHR9KTtcbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyLm1vZHVsZSgnYXBwJylcblx0XHQuY29udHJvbGxlcignUHJvamVjdENvbnRyb2xsZXInLCBmdW5jdGlvbiAocHJvamVjdCwgUHJvamVjdHMpIHtcblx0XHRcdHZhciB2bSA9IHRoaXM7XG5cblx0XHRcdHZtLnByb2plY3QgPSBwcm9qZWN0O1xuXHRcdFx0dm0uZGVsID0gUHJvamVjdHMuZGVsO1xuXHRcdH0pO1xufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHRcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuXHRcdC5jb250cm9sbGVyKCdQcm9qZWN0c0NvbnRyb2xsZXInLCBmdW5jdGlvbiAocHJvamVjdHMsIFByb2plY3RzLCAkbW9kYWwsICRzdGF0ZSkge1xuXHRcdFx0dmFyIHZtID0gdGhpcztcblxuXHRcdFx0dm0ucHJvamVjdHMgPSBwcm9qZWN0cztcblx0XHRcdHZtLnJlbW92ZSA9IFByb2plY3RzLmRlbDtcblx0XHRcdHZtLmFkZFByb2plY3QgPSBmdW5jdGlvbiBhZGRQcm9qZWN0KCkge1xuXHRcdFx0XHR2YXIgbW9kYWxJbnN0YXRhbmNlID0gJG1vZGFsLm9wZW4gKHtcblx0XHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL3Byb2plY3RzL25ldy5odG1sJyxcblx0XHRcdFx0XHRjb250cm9sbGVyOiAnTmV3UHJvamVjdEN0cmwnLFxuXHRcdFx0XHRcdGNvbnRyb2xsZXJBczogJ25ld1Byb2plY3QnLFxuXHRcdFx0XHRcdHNpemU6ICdtZCdcblx0XHRcdFx0fSkucmVzdWx0LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0XHRcdFByb2plY3RzLnBvc3QocmVzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0fSk7XG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuXHRcdC5zZXJ2aWNlKCdQcm9qZWN0cycsIGZ1bmN0aW9uICgkaHR0cCwgJHN0YXRlLCBVc2Vycykge1xuXHRcdFx0XG5cdFx0XHR2YXIgdm0gPSB0aGlzO1xuXG5cdFx0XHR2bS5wcm9qZWN0cyA9IFtdO1xuXG5cdFx0XHQvL3VzZSBsb2Rhc2ggdG8gZmluZCBhIHByYXJ0aWN1bGFyIHByb2plY3QgaWRcblx0XHRcdHZtLmZpbmQgPSBmdW5jdGlvbiBmaW5kKHByb2plY3RJZCkge1xuXHRcdFx0XHRyZXR1cm4gXy5maW5kKHZtLnByb2plY3RzLCB7X2lkOiBwcm9qZWN0SWR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8vZ2V0IG91ciBwcm9qZWN0cyBmcm9tIG91ciBzZXJ2ZXJcblx0XHRcdHZtLmdldCA9IGZ1bmN0aW9uIGdldCAoKSB7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5nZXQoJy9wcm9qZWN0cycpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcblx0XHRcdFx0XHR2bS5wcm9qZWN0cy5zcGxpY2UoMCk7XG5cdFx0XHRcdFx0cmVzLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAocHJvamVjdCkge1xuXHRcdFx0XHRcdFx0cHJvamVjdC51c2VyID0gVXNlcnMuZmluZChwcm9qZWN0LnVzZXIpO1xuXHRcdFx0XHRcdFx0dm0ucHJvamVjdHMucHVzaChwcm9qZWN0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRyZXR1cm4gdm0ucHJvamVjdHM7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblxuXHRcdFx0dm0ucG9zdCA9IGZ1bmN0aW9uIHBvc3QocHJvamVjdCkge1xuXG5cdFx0XHRcdHJldHVybiAkaHR0cC5wb3N0KCcvcHJvamVjdHMvJywgcHJvamVjdClcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0XHRcdGRlYnVnZ2VyO1xuXHRcdFx0XHRcdHJlcy5kYXRhLnVzZXIgPSBVc2Vycy5maW5kKHJlcy5kYXRhLnVzZXIpO1xuXHRcdFx0XHRcdHZtLnByb2plY3RzLnB1c2gocmVzLmRhdGEpO1xuXHRcdFx0XHRcdGRlYnVnZ2VyO1xuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8vIHZtLnBvc3QgPSBmdW5jdGlvbiBwb3N0KHByb2plY3QpIHtcblxuXHRcdFx0Ly8gXHRyZXR1cm4gJGh0dHAucG9zdCgnL3Byb2plY3RzLycpXG5cdFx0XHQvLyBcdC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcblx0XHRcdC8vIFx0XHR2bS5wcm9qZWN0cy5wdXNoKHtwcm9qZWN0fSk7XG5cdFx0XHQvLyBcdFx0JHN0YXRlLmdvKCdwcm9qZWN0cycpO1xuXHRcdFx0Ly8gXHRcdGRlYnVnZ2VyO1xuXHRcdFx0Ly8gXHR9KTtcblx0XHRcdC8vIH07XG5cblx0XHRcdHZtLnB1dCA9IGZ1bmN0aW9uIHB1dChwcm9qZWN0KSB7XG5cdFx0XHRcdHZhciBkYXRhID0ge3RpdGxlOiBwcm9qZWN0LnRpdGxlfTtcblx0XHRcdFx0cmV0dXJuICRodHRwLnB1dCgnL3Byb2plY3RzLycgKyBwcm9qZWN0Ll9pZCwgZGF0YSlcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0XHRcdCRzdGF0ZS5nbygncHJvamVjdHMuZGV0YWlsJywge3Byb2plY3RJZDogcHJvamVjdC5faWR9KTtcblx0XHRcdFx0fSwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdC8vVE9ETzogaGFuZGxlIHdoZW4gd2UgY2FuJ3QgdXBkYXRlIGEgcHJvamVjdC5cblx0XHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdH07XG5cblx0XHRcdHZtLnJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSAocHJvamVjdElkKSB7XG5cdFx0XHRcdF8ucmVtb3ZlKHZtLnByb2plY3RzLCB7X2lkOiBwcm9qZWN0SWQuX2lkfSk7XG5cdFx0XHR9O1xuXG5cdFx0XHR2bS5kZWwgPSBmdW5jdGlvbiBkZWwgKHByb2plY3RJZCkge1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAuZGVsZXRlKCcvcHJvamVjdHMvJyArIHByb2plY3RJZClcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0XHRcdHZtLnJlbW92ZShwcm9qZWN0SWQpO1xuXHRcdFx0XHRcdCRzdGF0ZS5nbygncHJvamVjdHMnKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdH07XG5cdFx0fSk7XG59KCkpO1xuXG5cblxuXG5cblxuXG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuXHRcdC5zZXJ2aWNlKCdVc2VycycsIGZ1bmN0aW9uICgkaHR0cCwgVXNlcikge1xuXHRcdFx0dmFyIHZtID0gdGhpcztcblx0XHRcdHZtLnVzZXJzID0gW107XG5cblx0XHRcdHZtLmZpbmQgPSBmdW5jdGlvbiBmaW5kKHVzZXJJZCkge1xuXHRcdFx0XHRyZXR1cm4gXy5maW5kKHZtLnVzZXJzLCB7X2lkOiB1c2VySWR9KTtcblx0XHRcdH07XG5cblx0XHRcdHZtLmdldCA9IGZ1bmN0aW9uIGdldCgpIHtcblx0XHRcdFx0cmV0dXJuICRodHRwLmdldCgnL3VzZXJzJylcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHRcdFx0XHRcdHZtLnVzZXJzLnNwbGljZSgwKTtcblxuXHRcdFx0XHRcdHJlcy5kYXRhLmZvckVhY2goZnVuY3Rpb24gKHVzZXIpIHtcblx0XHRcdFx0XHRcdHZtLnVzZXJzLnB1c2gobmV3IFVzZXIodXNlcikpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cmV0dXJuIHZtLnVzZXJzO1xuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHR9KTtcblxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhci5tb2R1bGUoJ2FwcC51aScpXG5cdFx0Ly9hbHdheXMgY2FtZWwgY2FzZSB0aGUgZGlyZWN0aXZlIGluIHRoZSAuZGlyZWN0aXZlXG5cdFx0XG5cdFx0LmRpcmVjdGl2ZSgncHJvamVjdHNUYWJsZScsIGZ1bmN0aW9uIChQcm9qZWN0cykge1xuXHRcdFx0Ly9DUkVBVCBUSEUgRERPIChEaXJlY3RpdmUgRGVmaW5pdGlvbiBPYmplY3QpXG5cblx0XHRcdGZ1bmN0aW9uIGNvbnRyb2xsZXIgKCRzY29wZSkge1xuXHRcdFx0XHQkc2NvcGUucmVtb3ZlID0gUHJvamVjdHMuZGVsO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2RpcmVjdGl2ZXMvcHJvamVjdC10YWJsZS5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogY29udHJvbGxlcixcblx0XHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0XHRwcm9qZWN0czogJz0nLFxuXHRcdFx0XHRcdHJlbW92ZTogJz0nXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSk7XG59KCkpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
