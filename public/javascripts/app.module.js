(function () {
	'use strict';
	angular.module('app', ['ui.router', 'app.ui', 'ui.bootstrap'])

	.config(function ($stateProvider, $urlRouterProvider) {
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
					users: function (Users) {
						return Users.get();
					},
					projects: function (Projects, users) {
						return Projects.get();
					}
				}
			})

			.state('projects.detail', {
				url: '/:projectId',
				templateUrl: 'partials/projects/detail.html',
				controller: 'ProjectController',
				controllerAs: 'projectController',
				resolve: {
					project: function (Projects, $stateParams, projects) {
						return Projects.find($stateParams.projectId);
					}
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
	});

}());