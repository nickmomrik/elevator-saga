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

    floors.forEach(function(floor) {
      floor.on("up_button_pressed", function() {

      });

      floor.on("down_button_pressed", function() {

      });
    });

    elevators.forEach(function(elevator){
      elevator.on("idle", function() {
        if (elevator.goingUpIndicator() && elevatorCanGoUp(elevator)) {
          elevator.goingDownIndicator(false);
          elevator.goToFloor(elevator.currentFloor() + 1);
        } else if (elevator.goingDownIndicator() && elevatorCanGoDown(elevator)) {
          elevator.goingUpIndicator(false);
          elevator.goToFloor(elevator.currentFloor() - 1);
        }
      });

      elevator.on('stopped_at_floor', function(floorNum) {
        if (elevator.goingUpIndicator() && !elevatorCanGoUp(elevator, floorNum)) {
          elevator.goingUpIndicator(false);
          elevator.goingDownIndicator(true);
        } else if (elevator.goingDownIndicator() && !elevatorCanGoDown(elevator, floorNum)) {
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);
        }
      });

      elevator.on("passing_floor", function(floorNum, direction) {

      });

      elevator.on("floor_button_pressed", function(floorNum) {

      });
    });
  },

  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here

  }
}
