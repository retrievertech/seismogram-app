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
      name: "Failed"
    }, {
      code: 3,
      name: "Complete"
    }, {
      code: 4,
      name: "Edited"
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
}

export { SeismoStatus };
