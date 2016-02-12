{
  init: function(elevators, floors) {
    var floorCount = floors.length;

    function elevatorCanGoUp( elevator, floorNum = null ) {
      if (!floorNum) {
        floorNum = elevator.currentFloor();
      }

      return (floorCount - 1) > floorNum;
    }

    function elevatorCanGoDown( elevator, floorNum = null ) {
      if (!floorNum) {
        floorNum = elevator.currentFloor();
      }

      return 0 < floorNum;
    }

    function resetIndicators(elevator) {
      if (elevator.goingUpIndicator() && !elevatorCanGoUp(elevator)) {
        elevator.goingUpIndicator(false);
        elevator.goingDownIndicator(true);
      }

      if (elevator.goingDownIndicator() && !elevatorCanGoDown(elevator)) {
        elevator.goingUpIndicator(true);
        elevator.goingDownIndicator(false);
      }
    }

    floors.forEach(function(floor) {
      floor.on("up_button_pressed", function() {

      });

      floor.on("down_button_pressed", function() {

      });
    });

    elevators.forEach(function(elevator){
      elevator.on("idle", function() {
        resetIndicators(elevator);

        if (elevator.goingUpIndicator()) {
          elevator.goToFloor(elevator.currentFloor() + 1);
        } else if (elevator.goingDownIndicator()) {
          elevator.goToFloor(elevator.currentFloor() - 1);
        }
      });

      elevator.on('stopped_at_floor', function(floorNum) {
        resetIndicators(elevator);
      });

      elevator.on("passing_floor", function(floorNum, direction) {

      });

      elevator.on("floor_button_pressed", function(floorNum) {
        elevator.goToFloor(floorNum);
      });
    });
  },

  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here

  }
}
