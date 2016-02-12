{
  init: function(elevators, floors) {
    floors.forEach(function(floor) {
      floor.on("up_button_pressed", function() {

      });

      floor.on("down_button_pressed", function() {

      });
    });

    elevators.forEach(function(elevator){
      elevator.on("idle", function() {

      });

      elevator.on('stopped_at_floor', function(floorNum) {

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
