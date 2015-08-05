import { Auth } from "../Auth.js";

export class Main {
  constructor($scope, $http, $location, $timeout, ServerUrls, ScreenMessage) {
    $scope.Auth = Auth;
    $scope.$location = $location;

    $scope.username = "";
    $scope.password = "";

    $scope.logIn = () => {
      Auth.store({
        username: $scope.username,
        password: $scope.password
      });

      $scope.checkLogin().then(() => {
        if (!$scope.loggedIn) {
          ScreenMessage.ephemeral("Invalid credentials.", "error", 5000);
        }
      });
    };

    $scope.logOut = () => {
      Auth.remove().then(() => $scope.checkLogin());
    };
  }
}
