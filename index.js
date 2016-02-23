{
		init: function( elevators, floors ) {
		var floorCount = floors.length,
			waitingQueue = [],
			debugEnabled = false;

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

		function setIndicators( elevator, direction = 'both' ) {
			if ( 'up' == direction ) {
				elevator.goingUpIndicator( true );
				elevator.goingDownIndicator( false );
			} else if ( 'down' == direction ) {
				elevator.goingUpIndicator( false );
				elevator.goingDownIndicator( true );
			} else {
				elevator.goingUpIndicator( true );
				elevator.goingDownIndicator( true );
			}
		}

		function resetIndicators( elevator ) {
			if ( !elevatorCanGoUp( elevator ) ) {
				// Can't go up from the top
				setIndicators( elevator, 'down' );
			} else if ( !elevatorCanGoDown( elevator ) ) {
				// Can't go down from the bottom
				setIndicators( elevator, 'up' );
			} else if ( 0 == elevator.destinationQueue.length && 0 == elevator.getPressedFloors().length ) {
				// Nowhere to go, so can go anywhere
				setIndicators( elevator );
			} else {
				var nextFloor = elevator.destinationQueue[0];
				if ( nextFloor > elevator.currentFloor() ) {
					setIndicators( elevator, 'up' );
				} else if ( nextFloor < elevator.currentFloor() ) {
					setIndicators( elevator, 'down' );
				} else {
					setIndicators( elevator );
				}
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

		function addToWaitingQueue( floorNum ) {
			if ( -1 == waitingQueue.indexOf( floorNum ) ) {
				waitingQueue.push( floorNum );
			}
		}

		function oppositeDirection( direction ) {
			return ( 'up' == direction ) ? 'down' : 'up';
		}

		function debug( message ) {
			if ( debugEnabled ) {
				console.log( message );
			}
		}

		floors.forEach( function( floor ) {
			floor.on( "up_button_pressed", function() {
				debug( 'f' + floor.floorNum() + ' pressed up' );

				addToWaitingQueue( floor.floorNum() );
			} );

			floor.on( "down_button_pressed", function() {
				debug( 'f' + floor.floorNum() + ' pressed down' );

				addToWaitingQueue( floor.floorNum() );
			} );
		} );

		elevators.forEach( function( elevator, elevatorNum ){
			elevator.on( "idle", function() {
				debug( 'e' + elevatorNum + ' idle with dest:' + elevator.destinationQueue.toString() + ' waiting: ' + waitingQueue.toString() + ' load: ' + elevator.loadFactor() + ' indicators: up - ' + elevator.goingUpIndicator() + ' down - ' + elevator.goingDownIndicator() );

				resetIndicators( elevator );

				if ( elevator.loadFactor() > 0 ) {
					// Wait for someone to press a floor button
					return;
				}

				var nextFloor;

				if ( 0 == elevator.destinationQueue.length && waitingQueue.length ) {
					nextFloor = waitingQueue.shift();
					debug( 'e' + elevatorNum + ' idle: going to waitingQueue f' + nextFloor );
					elevator.goToFloor( nextFloor );

					return;
				}

				nextFloor = elevator.currentFloor();
				if ( elevator.goingUpIndicator() ) {
					nextFloor++;
				} else {
					nextFloor--;
				}
				debug( 'e' + elevatorNum + ' idle: going to next f' + nextFloor );
				elevator.goToFloor( nextFloor );
			} );

			elevator.on( 'stopped_at_floor', function( floorNum ) {
				debug( 'e' + elevatorNum + ' stopped at f' + floorNum );

				resetIndicators( elevator );
				resetDestinationQueue( elevator );
				resetWaitingQueue( floorNum );
			} );

			elevator.on( "passing_floor", function( floorNum, direction ) {
				debug( 'e' + elevatorNum + ' passing f' + floorNum + ' ' + direction );

				if ( -1 != elevator.getPressedFloors().indexOf( floorNum ) && 0 < elevator.loadFactor() ) {
					debug( 'e' + elevatorNum + ' passing: going to pressed f' + floorNum );
					elevator.goToFloor( floorNum, true );
				} else {
					if ( elevator.loadFactor() < 1 && floors[floorNum].buttonStates[direction] ) {
						// If going down and nobody pressed 0, but 0 is waiting, don't stop
						if ( elevator.goingDownIndicator() && -1 == elevator.getPressedFloors().indexOf( 0 ) && floors[0].buttonStates['up'] ) {
							return;
						}

						debug( 'e' + elevatorNum + ' passing: going to waiting f' + floorNum + ' ' + direction );
						elevator.goToFloor( floorNum, true );

						// Remove from waiting queue unless someone is waiting to go in the opposite direction
						if ( !floors[floorNum].buttonStates[ oppositeDirection( direction ) ] ) {
							resetWaitingQueue( floorNum );
						}
					}
				}
			} );

			elevator.on( "floor_button_pressed", function( floorNum ) {
				debug( 'e' + elevatorNum + ' pressed f' + floorNum );

				elevator.goToFloor( floorNum );
			} );
		} );
	},

	update: function( dt, elevators, floors ) {
		// We normally don't need to do anything here
	}
}
