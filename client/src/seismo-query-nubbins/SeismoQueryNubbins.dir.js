class SeismoQueryNubbins {
  constructor() {
    return {
      templateUrl: "src/seismo-query-nubbins/SeismoQueryNubbins.html",
      scope: {
        queryParams: "="
      },
      link: (scope, element, attrs) => {
        scope.queryParams = {
          stationNames: "",
          notStarted: true,
          inProgress: true,
          needsAttention: true,
          complete: true,
          editedByMe: false
        };
      }
    };
  }
}

export { SeismoQueryNubbins };
