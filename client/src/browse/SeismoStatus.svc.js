class SeismoStatus {
  constructor() {
    this.statuses = [{
      code: 0,
      name: "No Data"
    },
    // {
    //  code: 1,
    //  name: "Processing"
    //},
    // {
    //  code: 2,
    //  name: "Failed"
    //},
    {
      code: 3,
      name: "Has Raw Data"
    }, {
      code: 4,
      name: "Has Edited Data"
    }];
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
}

export { SeismoStatus };
