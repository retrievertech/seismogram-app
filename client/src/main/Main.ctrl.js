export class Main {
  constructor($scope, $http, Auth, ServerUrls) {
    $scope.username = "";
    $scope.password = "";
    $scope.logIn = () => {
      Auth.set($scope.username, $scope.password);
      $http({url: ServerUrls.loginUrl}).then(() => {
        window.location.href = "#/browse";
      });
    };
  }
}
