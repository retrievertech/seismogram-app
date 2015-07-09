class SeismoQueryNubbins {
  constructor() {
    return {
      templateUrl: "src/browse/seismo-query-nubbins/SeismoQueryNubbins.html",
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
