{
		init: function( elevators, floors ) {
		var floorCount = floors.length,
				waitingQueue = [];

		function elevatorCanGoUp( elevator, floorNum = null ) {
			if ( !floorNum ) {
				floorNum = elevator.currentFloor();
			}

			return ( floorCount - 1 ) > floorNum;
		}

		function elevatorCanGoDown( elevator, floorNum = null ) {
			if ( !floorNum ) {
				floorNum = elevator.currentFloor();
			}

			return 0 < floorNum;
		}

		function resetIndicators( elevator ) {
			// Nowhere to go, so can go anywhere
			if ( 0 == elevator.destinationQueue.length && 0 == elevator.getPressedFloors().length ) {
				elevator.goingUpIndicator( true );
				elevator.goingDownIndicator( true );
			}

			// Can't go up from the top
			if ( elevator.goingUpIndicator() && !elevatorCanGoUp( elevator ) ) {
				elevator.goingUpIndicator( false );
				elevator.goingDownIndicator( true );
			}

			// Can't go down from the bottom
			if ( elevator.goingDownIndicator() && !elevatorCanGoDown( elevator ) ) {
				elevator.goingUpIndicator( true );
				elevator.goingDownIndicator( false );
			}
		}

		function resetDestinationQueue( elevator ) {
			// Remove duplicates, keeping first instance of floor
			var newQueue = elevator.destinationQueue.reverse().filter( function ( e, i, arr ) {
				return arr.indexOf( e, i+1 ) === -1;
			} ).reverse();

			if ( newQueue.length != elevator.destinationQueue ) {
				elevator.destinationQueue = newQueue;
				elevator.checkDestinationQueue();
			}
		}

		function resetWaitingQueue( floorNum ) {
			var i = waitingQueue.indexOf( floorNum );
			if ( -1 != i ) {
				waitingQueue.splice( i, 1 );
			}
		}

		floors.forEach( function( floor ) {
			floor.on( "up_button_pressed", function() {
				//console.log('up', floor.floorNum());

				if ( -1 == waitingQueue.indexOf( floor.floorNum() ) ) {
					waitingQueue.push( floor.floorNum() );
				}
			} );

			floor.on( "down_button_pressed", function() {
				//console.log('', floor.floorNum());

				if ( -1 == waitingQueue.indexOf( floor.floorNum() ) ) {
					waitingQueue.push( floor.floorNum() );
				}
			} );
		} );

		elevators.forEach( function( elevator ){
			elevator.on( "idle", function() {
				//console.log('idle');

				resetIndicators( elevator );

				if ( 0 == elevator.destinationQueue.length && 0 == elevator.loadFactor() && waitingQueue.length ) {
					elevator.goToFloor( waitingQueue.shift() );
				}

				if ( elevator.goingUpIndicator() ) {
					elevator.goToFloor( elevator.currentFloor() + 1 );
				} else if ( elevator.goingDownIndicator() ) {
					elevator.goToFloor( elevator.currentFloor() - 1 );
				}
			} );

			elevator.on( 'stopped_at_floor', function( floorNum ) {
				//console.log('stopped', floorNum);

				resetIndicators( elevator );
				resetDestinationQueue( elevator );
				resetWaitingQueue( floorNum );
			} );

			elevator.on( "passing_floor", function( floorNum, direction ) {
				//console.log('passing', floorNum, direction);

				if ( -1 != elevator.getPressedFloors().indexOf( floorNum ) ) {
					elevator.goToFloor( floorNum, true );
				} else {
					if ( elevator.loadFactor() < 1 && floors[floorNum].buttonStates[direction] ) {
						elevator.goToFloor( floorNum, true );
					}
				}
			} );

			elevator.on( "floor_button_pressed", function( floorNum ) {
				//console.log('pressed', floorNum);

				elevator.goToFloor( floorNum );
			} );
		} );
	},

	update: function( dt, elevators, floors ) {
		// We normally don't need to do anything here
	}
}
