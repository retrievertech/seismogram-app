var rootRef = new Firebase("seismogram.firebaseio.com");
var countsDiv = $("#counts"); // counts of tasks by status
var recentDiv = $("#recent"); // recent tasks
var tasks = {};

rootRef.child("queue/tasks").on("value", function(snap) {
  // render recently changed tasks
  recentDiv.empty();
  var modifiedTasks = _.filter(snap.val(), function(task) { return task["_state_changed"]; });
  var recentTasks = _.sortBy(modifiedTasks, "_state_changed");
  var numTasksToShow = 10;
  // for (var i = 0; i < numTasksToShow; i++) {
  for (var i = recentTasks.length-1; i > recentTasks.length-1-numTasksToShow; i--) {
    recentDiv.append($("<div>"+JSON.stringify(recentTasks[i], 2)+"</div>"));
  }

  // clear tasks
  tasks = {};
  countsDiv.empty();

  // count tasks
  snap.forEach(function(taskSnap) {
    var task = taskSnap.val(),
        state = task._state ? task._state : "not_started";
    tasks[state] = tasks[state] || [];
    tasks[state].push(task);
  });

  // render status: count
  for (var key in tasks) {
    var newDiv = $("<div>");
    var taskList = tasks[key];
    newDiv.append($("<div>"+key+": "+taskList.length+"</div>"));

    // add error links
    if (key === "error") {
      _.each(taskList, function(task) {
        var errorLink = $("<div style='margin-left: 10px'><a target='_blank' href='http://seismo.redfish.com/#/view/"+task.filename+"'>"+task.filename+"</a></div>");
        newDiv.append(errorLink);
      });
    }

    countsDiv.append(newDiv);
  }
});

var machinesDiv = $("#machines");
rootRef.child("machines_online").on("value", function(snap) {
  machinesDiv.text("machines online: "+snap.numChildren());
});
