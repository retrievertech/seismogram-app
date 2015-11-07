//
//  Filters each part of the comma-separated input. Station codes
//  get replaced by the location of the station with that code.
//  Everything elses remains unchanged.
//

export class FormatStationLocation {
  constructor(QueryData) {
    return (input) => {
      var input = input || '';
      var splitInput = input.split(",");
      // The input to the map function could be a station
      // code, but it may also be some portion of the station's
      // location.
      var formatted = splitInput.map((codeOrLocation) => {
        var station = QueryData.getStationByCode(codeOrLocation);
        if (station) {
          return station.location;
        }
        return codeOrLocation;
      });
      return formatted.join(",");
    }
  }
}
