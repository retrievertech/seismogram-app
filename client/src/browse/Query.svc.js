export class Query {
  constructor($http, $q, ServerUrls, QueryData, FileStatus) {
    this.$http = $http;
    this.$q = $q;
    this.ServerUrls = ServerUrls;
    this.QueryData = QueryData;
    this.FileStatus = FileStatus;

    // This is the model for the query form.
    // To be initialized later when initModel() is called
    this.model = {};

    this.initialQueryStatuses = [3,4];

    window.Query = this;
  }

  initModel() {
    this.model.dateFrom = "",
    this.model.dateTo = "",
    this.model.numBins = this.QueryData.filesQueryData.numBins;
    this.model.stationNames = "";
    this.model.fileNames = "";
    this.model.status = {};

    this.FileStatus.statuses.forEach((status) => {
      var value = window._.contains(this.initialQueryStatuses, status.code);
      this.model.status[status.code] = value;
    });
  }

  initialQuery() {
    return this.$q.all({
      seismograms: this.$http({
        url: this.ServerUrls.filesUrl,
        params: {
          status: this.initialQueryStatuses.join(",")
        }
      }),
      stations: this.$http({
        url: this.ServerUrls.stationsUrl
      })
    });
  }

  queryFiles(paramModel) {
    var params = this.createQuery(paramModel);
    return this.$http({
      method: "GET",
      url: this.ServerUrls.filesUrl,
      params: params
    });
  }

  createQuery() {
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

    var queryParamModel = this.model;

    var stationNames = queryParamModel.stationNames
      .split(",").map((stationName) => stationName.trim());

    var stationIds = this.QueryData.stationQueryData
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
      stationIds: stationIds.join(","),
      status: status.join(","),
      fileNames: queryParamModel.fileNames,
      bins: queryParamModel.numBins
    };

    var dateFrom = new Date(queryParamModel.dateFrom);
    var dateTo = new Date(queryParamModel.dateTo);

    if (dateFrom.toDateString() !== "Invalid Date") {
      query.dateFrom = dateFrom;
    }

    if (dateTo.toDateString() !== "Invalid Date") {
      query.dateTo = dateTo;
    }

    return query;
  }
}
