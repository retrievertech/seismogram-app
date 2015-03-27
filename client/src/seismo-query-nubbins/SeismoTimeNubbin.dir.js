class SeismoTimeNubbin {
  constructor() {
    return {
      scope: {
        queryParams: "="
      },
      templateUrl: "src/seismo-query-nubbins/SeismoTimeNubbin.html",
      link: (scope, element, attrs) => {
        // start with date min and max
        // eventually this should be passed into the directive
        scope.queryParams = {
          dateFrom: new Date("1937-10-14T19:26:00Z"),
          dateTo: new Date("1978-09-16T21:20:00Z")
        };
      }
    };
  }
}

export { SeismoTimeNubbin };
