import { Auth } from "../Auth.js";

export class Main {
  constructor($scope, $http, $location, $timeout, ServerUrls, ScreenMessage) {
    $scope.Auth = Auth;
    $scope.$location = $location;

    $scope.username = "";
    $scope.password = "";
    $scope.loggedIn = false;

    var checkLogin = () => {
      return $http({url: ServerUrls.loginUrl}).then(() => {
        $scope.loggedIn = true;
      });
    };

    $scope.logIn = () => {
      Auth.store({
        username: $scope.username,
        password: $scope.password
      });

      checkLogin().catch(() => {
        ScreenMessage.ephemeral("Invalid credentials.", "error", 5000);
      });
    };

    $scope.logOut = () => {
      Auth.remove().then(() => {
        $scope.loggedIn = false;
        $timeout(() => {});
      });
    };

    if (Auth.hasData()) {
      checkLogin();
    }
  }
}
