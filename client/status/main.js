var rootRef = new Firebase("seismogram.firebaseio.com");

rootRef.child("queue/tasks").on("value", renderTasks);
rootRef.child("machines_online").on("value", renderMachines);

function renderRecentTasks(snap) {
  var tasks = snap.val();
  var recentDiv = $("#recent");
  var modifiedTasks = _.filter(tasks, function(task) { return task["_state_changed"]; });
  var recentTasks = _.sortBy(modifiedTasks, "_state_changed");
  recentTasks.reverse();
  var numTasksToShow = 10;

  recentDiv.empty();
  recentDiv.append($("<div>Recent changes:</div>"));
  for (var i = 0; i < numTasksToShow; i++) {
    recentDiv.append($("<div>"+JSON.stringify(recentTasks[i], 2)+"</div>"));
  }
}

function renderTaskStatuses(snap) {
  var countsDiv = $("#counts"); // counts of tasks by status
  var tasks = {};

  // count tasks
  snap.forEach(function(taskSnap) {
    var task = taskSnap.val(),
        state = task._state ? task._state : "not_started";
    tasks[state] = tasks[state] || [];
    tasks[state].push(task);
  });

  // render status counts
  countsDiv.empty();
  _.each(tasks, function(taskList, state) {
    var newDiv = $("<div>");
    newDiv.append($("<div>"+state+": "+taskList.length+"</div>"));

    // add error links
    if (state === "error") {
      _.each(taskList, function(task) {
        newDiv.append(errorLink(task.filename));
      });
    }

    if (state === "complete") {
      // count statuses
      var tasksByStatus = _.groupBy(taskList, "status");
      var statuses = ["notStarted", "processing", "failed", "successful", "edited", "problematic"];
      _.each(tasksByStatus, function(completedTaskList, statusId) {
        var statusName = statuses[statusId];
        newDiv.append($("<div style='margin-left: 10px'>"+statusName+": "+completedTaskList.length+"</div>"));
      });
    }

    countsDiv.append(newDiv);
  });

  function errorLink(filename) {
    return $("<div style='margin-left: 10px'><a target='_blank' href='http://seismo.redfish.com/#/view/"+filename+"'>"+filename+"</a></div>");
  }

}

function renderTasks(snap) {
  renderRecentTasks(snap);
  renderTaskStatuses(snap);
}

function renderMachines(snap) {
  $("#machines").text("machines online: "+snap.numChildren());
}
