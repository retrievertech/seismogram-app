seismogram-app
==============

Beginning of a browser app for searching/browsing seismograms. Eventually editing.

data-tools
----------
Tools to sanitize/import the station and file data. The data is in the repo in `data-tools/data`. You can run:
```sh
npm install
node jsonize.js
```

This will produce `files.json` and `stations.json`. Then you can import data into mongo:
```sh
sh mongo-import.sh
```

This assumes you started mongo:
```sh
mongod --dbpath <some directory>
```

server
------
A node server atop mongo.
```sh
cd server
npm install
node app # starts on port 3000
```

client
------
An angular frontend.
```sh
bower install
```
Serve the client directory using a web server and load it in the browser, assuming the above steps are done.

EC2
---
On our EC2 instance, the mongodb config file is located at `/etc/mongod.conf`.

TODO
----

* Editor:
  * Ability to cancel editing
  * Segment erasure tool
    * Draw a rectangle.
    * A popup shows up "Delete segments in region?"
    * Adjust the rectangle. Click "Yes". Segment data is deleted.
    * Other option: Draw a circle in addition to a rectangle.
  * Hook up saving function.
  * Hook up "Discard Changes".
  * Allow adjusting the opacity of the image layer to better focus on the data.
  * Implement data downloading, probably just a ZIP of JSONs for now.
  * Implement Segment Assignment
    * Auto assignment is not run by default, we give the user a chance to edit mean lines.
    * Click "Auto Assignment" to run our assignment algorithm.
      * Yet unclear where and how this will be implemented (could be Python on EC2, or JS on the client)
    * Edit assignments:
      * Click a mean line to select mean line to assign to.
      * Click segments to assign them to that mean line.
      * Should be able to click segment again to undo the assignment.
    * Color mean lines meaningfully.
    * Assigned segments take on the color of the mean line.
    * Unassigned segments should have a default color.
* Browser:
  * Improve the query interface. Date/time pickers, or at least friendlier way to input dates, and station name autocomplete.
  * Improve styling of "seimogram cards".
    * Add View buttons/links. Add Edit links where they apply.
  * Implement pin popups that show data at that station wrt the current query.
    * Needs a new server route.
    * Should ideally be able to load more results inside the pin.
    * Items in the pin should have view/edit links.
    * A thumbnail preview could be useful when mousing over or clicking an item.
  * Implement paging through results.
    * A "load more results" at the bottom of the List page that grabs the next 20.
    * This can be done super efficiently with a new route that bypasses station counts, it just grabs files.
