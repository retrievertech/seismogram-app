class SeismoStatus {
  constructor() {
    this.statuses = [{
      code: 0,
      name: "Not Started"
    }, {
      code: 1,
      name: "Processing"
    }, {
      code: 2,
      name: "Edited"
    }, {
      code: 3,
      name: "Complete"
    }, {
      code: 4,
      name: "Failed"
    }];
  }

  getStatus(name) {
    var status = this.statuses.find(function(status) {
      return status.name === name;
    });

    return status;
  }
}

export { SeismoStatus };
