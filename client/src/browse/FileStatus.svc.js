export class FileStatus {
  constructor() {
    this.statuses = [
      {
        code: 0,
        name: "No Data"
      },
      // It's pretty pointless to be able to show
      // seismos that are currently being processed
      // (it's such a temporary state), so we hide
      // it from the query filter UI.
      //
      // {
      //  code: 1,
      //  name: "Processing"
      //},
      {
       code: 2,
       name: "Failed"
      },
      {
        code: 3,
        name: "Processed"
      },
      {
        code: 4,
        name: "Edited"
      }
      // Uncomment the "problematic" code below
      // if you want to be able to search for
      // seismograms that were processed without error
      // but have been flagged for issues (e.g. too many segments).
      //
      ,
      {
        code: 5,
        name: "Problematic"
      }
    ];
  }

  getStatus(name) {
    var status = this.statuses.find(function(status) {
      return status.name.toLowerCase() === name.toLowerCase();
    });

    return status;
  }

  is(code, name) {
    var status = this.getStatus(name);
    return status.code === code;
  }

  hasData(code) {
    return code === 3 || code === 4;
  }

  hasLog(code) {
    return code !== 0;
  }
}
