(function () {
	'use strict';


	angular.module('app')
		.service('Projects', function ($http, $state, Users) {
			
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
		});
}());








