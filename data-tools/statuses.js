
function generateRandomStatuses(files) {
  var statuses = [];
  files.forEach(function(file) {
    statuses.push({
      fileName: file.name,
      // between 0 and 3
      status: Math.floor(Math.random() * 4),
      edited: Math.floor(Math.random() * 2) === 1 ? true : false
    });
  });
  return statuses;
}

module.exports = {
  generateRandomStatuses: generateRandomStatuses
};
