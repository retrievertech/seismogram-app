class SeismoQueryNubbins {
  constructor() {
    return {
      templateUrl: "src/seismo-query-nubbins/SeismoQueryNubbins.html",
      scope: {
        queryParams: "=",
        seismoStatus: "="
      },
      link: (scope, element, attrs) => {

      }
    };
  }
}

export { SeismoQueryNubbins };
