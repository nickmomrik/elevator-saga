{
  init: function(elevators, floors) {
    floors.forEach(function(floor) {
      floor.on("up_button_pressed", function() {
        var best = null,
          bestDist = null,
          thisDist = null,
          queueLength,
          maxFloor;

        elevators.forEach(function(elevator) {
          // Full
          if (1 == elevator.loadFactor()) {
            return;
          }

          queueLength = elevator.destinationQueue.length;
          if (0 == queueLength) {
            thisDist = Math.abs(elevator.currentFloor()-floor.floorNum());
          } else if (elevator.goingUpIndicator()) {
            maxFloor = Math.max.apply(null, elevator.destinationQueue);
            if (elevator.currentFloor() > floor.floorNum()) {
              // it's on the way!
              if (maxFloor > floor.floorNum()) {
                thisDist = Math.abs(floor.floorNum() - elevator.currentFloor());
              } else {
                thisDist = 2 * queueLength + // count each stop extra
                  Math.abs(maxFloor - elevator.currentFloor()) + // get to last stop
                  Math.abs(floor.floorNum() - maxFloor); // get to button press
              }
            } else {
              thisDist = 2 * queueLength + // count each stop extra
                Math.abs(maxFloor - elevator.currentFloor()) + // get to last stop
                Math.abs(maxFloor - floor.floorNum()); // get to button press
            }
          } else {
            maxFloor = Math.min.apply(null, elevator.destinationQueue);
            // Going in opposite direction
            thisDist = 2 * queueLength + // count each stop extra
              Math.abs(elevator.currentFloor - maxFloor) + // get to last stop
              Math.abs(floor.floorNum() - maxFloor); // get to button press
          }

          if (!best || thisDist < bestDist) {
            bestDist = thisDist;
            best = elevator;
          }
        });

        if (best) {
          var i = best.destinationQueue.findIndex(function(element, index, array){
            return floor.floorNum() == element;
          });

          // Add to queue if it's not already in the list
          if (-1 != i) {
            best.goToFloor(floor.floorNum());
            best.destinationQueue.sort();
            if (best.goingDownIndicator()) {
              best.destinationQueue.reverse();
            }
            best.checkDestinationQueue();
          }
        } else {
          console.log('Could not add (up) ' + floor.floorNum());
        }
      });

      floor.on("down_button_pressed", function() {
        var best = null,
          bestDist = null,
          thisDist = null,
          queueLength,
          minFloor;

        elevators.forEach(function(elevator) {
          // Full
          if (1 == elevator.loadFactor()) {
            return;
          }

          queueLength = elevator.destinationQueue.length;
          if (0 == queueLength) {
            thisDist = Math.abs(elevator.currentFloor()-floor.floorNum());
          } else if (elevator.goingDownIndicator()) {
            minFloor = Math.min.apply(null, elevator.destinationQueue);
            if (floor.floorNum() > elevator.currentFloor()) {
              // it's on the way!
              if (floor.floorNum() > minFloor) {
                thisDist = Math.abs(elevator.currentFloor() - floor.floorNum());
              } else {
                thisDist = 2 * queueLength + // count each stop extra
                  Math.abs(elevator.currentFloor() - minFloor) + // get to last stop
                  Math.abs(minFloor - floor.floorNum()); // get to button press
              }
            } else {
              thisDist = 2 * queueLength + // count each stop extra
                Math.abs(elevator.currentFloor() - minFloor) + // get to last stop
                Math.abs(floor.floorNum() - minFloor); // get to button press
            }
          } else {
            minFloor = Math.max.apply(null, elevator.destinationQueue);
            // Going in opposite direction
            thisDist = 2 * queueLength + // count each stop extra
              Math.abs(minFloor - elevator.currentFloor) + // get to last stop
              Math.abs(minFloor - floor.floorNum()); // get to button press
          }

          if (!best || thisDist < bestDist) {
            bestDist = thisDist;
            best = elevator;
          }
        });

        if (best) {
          var i = best.destinationQueue.findIndex(function(element, index, array){
            return floor.floorNum() == element;
          });

          // Add to queue if it's not already in the list
          if (-1 != i) {
            best.goToFloor(floor.floorNum());
            best.destinationQueue.sort();
            if (best.goingDownIndicator()) {
              best.destinationQueue.reverse();
            }
            best.checkDestinationQueue();
          }
        } else {
          console.log('Could not add (down) ' + floor.floorNum());
        }
      })
    });

    elevators.forEach(function(elevator){
      elevator.on("idle", function() {
        var curFloor = elevator.currentFloor();

        elevator.goingUpIndicator(true);
        elevator.goingDownIndicator(true);

        if ((floors.length - 1) == curFloor) {
          elevator.goToFloor(0);
        } else {
          elevator.goToFloor(elevator.currentFloor() + 1);
        }
      });

      elevator.on('stopped_at_floor', function(floorNum) {
        var nextFloor = elevator.destinationQueue.shift();

        if (typeof nextFloor != 'undefined') {
          elevator.goingUpIndicator(false);
          elevator.goingDownIndicator(false);

          if (nextFloor > elevator.currentFloor()) {
            elevator.goingUpIndicator(true);
          } else {
            elevator.goingDownIndicator(true);
          }
        } else {
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(true);

          if (0 == elevator.currentFloor()) {
            elevator.goingDownIndicator(false);
          } else if (floors.length - 1 == elevator.currentFloor()) {
            elevator.goingUpIndicator(false);
          }
        }
      });

      elevator.on("passing_floor", function(floorNum, direction) {
        var i;

        if (0 == elevator.loadFactor()) {
          // Nobody on board and picking someone up
          i = elevator.destinationQueue.findIndex(function(element, index, array) {
            return floorNum == element;
          });
        } else {
          // Someone on board pressed the floor
          i = elevator.getPressedFloors().findIndex(function(element, index, array) {
            return floorNum == element;
          });
        }

        if (-1 != i) {
          elevator.goToFloor(floorNum, true);
        }
      });

      elevator.on("floor_button_pressed", function(floorNum) {
        var i = elevator.destinationQueue.findIndex(function(element, index, array){
          return floorNum == element;
        });

        if (-1 == i) {
          elevator.goToFloor(floorNum);
          elevator.destinationQueue.sort();
          if (elevator.goingDownIndicator()) {
            elevator.destinationQueue.reverse();
          }
          elevator.checkDestinationQueue();
        }
      });
    });
  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here

  }
}
