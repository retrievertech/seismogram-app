class SeismoQuery {
  constructor($http, $q, SeismoServer, SeismoData) {
    this.$http = $http;
    this.$q = $q;
    this.SeismoServer = SeismoServer;
    this.SeismoData = SeismoData;
  }

  initialQuery() {
    return this.$q.all({
      seismograms: this.$http({
        url: this.SeismoServer.filesUrl,
        params: {
          status: "0,1,2,3,4"
        }
      }),
      stations: this.$http({
        url: this.SeismoServer.stationsUrl
      })
    });
  }

  queryFiles(paramModel) {
    var params = this.createQuery(paramModel);
    return this.$http({
      method: "GET",
      url: this.SeismoServer.filesUrl,
      params: params
    });
  }

  createQuery(queryParamModel) {
    // The server expects something that looks like:
    // {
    //   dateFrom: "",
    //   dateTo: "",
    //   stationIds: [],
    //   status: [0, 1, 2, 3], // 0: not started; 1: ongoing; 2: needs attention; 3: complete
    //   edited: null, // True if you want only seismograms you've edited
    //   page: 0, // each page returns 40 results
    //   bins: 2000 // number of bins in which to histogram the results
    // }

    var stationNames = queryParamModel.stationNames
      .split(",").map((stationName) => stationName.trim());

    var stationIds = this.SeismoData.stationQueryData
      .filter((station) => stationNames.find((stationName) =>
        station.location.toLowerCase().indexOf(stationName.toLowerCase()) !== -1 ||
        station.code.toLowerCase().indexOf(stationName.toLowerCase()) !== -1
      ))
      .map((station) => station.stationId);

    // If the text box is *not* empty (so the user did enter a query)
    // and this query matches no station ids or codes, we send the
    // server an impossible code, so it returns no results.

    // Obviously, there seems like a shorter way to express zero results
    // than to give the server a zero-result query.

    // I realize there is a bit of ambiguity here, essentially telling
    // the client to handle part of the query by itself.

    if (stationNames[0] !== "" && stationIds.length === 0)
      stationIds.push("xxxx");

    var statusModel = queryParamModel.status;
    var status = Object.keys(statusModel).filter((code) => statusModel[code] === true);

    var query = {
      dateFrom: new Date(queryParamModel.dateFrom),
      dateTo: new Date(queryParamModel.dateTo),
      stationIds: stationIds.join(","),
      status: status.join(","),
      fileNames: queryParamModel.fileNames,
      bins: queryParamModel.numBins
    };

    return query;
  }

}

export { SeismoQuery };
