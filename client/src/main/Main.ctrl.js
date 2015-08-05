import { Auth } from "../Auth.js";

export class Main {
  constructor($scope, $http, $location, ServerUrls, ScreenMessage) {
    $scope.username = "";
    $scope.password = "";

    $scope.logIn = () => {
      Auth.store({
        username: $scope.username,
        password: $scope.password
      });

      $http({url: ServerUrls.loginUrl}).then(() => {
        $location.path("/browse");
      }).catch(() => {
        ScreenMessage.ephemeral("Invalid credentials.", "error", 5000);
      });
    };
  }
}
