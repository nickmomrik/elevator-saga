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
			if ( !elevatorCanGoUp( elevator ) ) {
				// Can't go up from the top
				elevator.goingUpIndicator( false );
				elevator.goingDownIndicator( true );
			} else if ( !elevatorCanGoDown( elevator ) ) {
				// Can't go down from the bottom
				elevator.goingUpIndicator( true );
				elevator.goingDownIndicator( false );
			} else if ( 0 == elevator.destinationQueue.length && 0 == elevator.getPressedFloors().length ) {
				// Nowhere to go, so can go anywhere
				elevator.goingUpIndicator( true );
				elevator.goingDownIndicator( true );
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

		floors.forEach( function( floor ) {
			floor.on( "up_button_pressed", function() {
				//console.log( 'up', floor.floorNum() );

				addToWaitingQueue( floor.floorNum() );
			} );

			floor.on( "down_button_pressed", function() {
				//console.log( 'down', floor.floorNum() );

				addToWaitingQueue( floor.floorNum() );
			} );
		} );

		elevators.forEach( function( elevator ){
			elevator.on( "idle", function() {
				//console.log( 'idle', elevator.destinationQueue, waitingQueue, elevator.loadFactor(), elevator.goingUpIndicator(), elevator.goingDownIndicator() );

				resetIndicators( elevator );

				if ( elevator.loadFactor() > 0 ) {
					// Wait for someone to press a floor button
					return;
				}

				if ( 0 == elevator.destinationQueue.length && waitingQueue.length ) {
					//console.log( 'idle - going to waitingQueue floor' );
					elevator.goToFloor( waitingQueue.shift() );

					return;
				}

				if ( elevator.goingUpIndicator() ) {
					//console.log( 'idle - going to next up floor' );
					elevator.goToFloor( elevator.currentFloor() + 1 );
				} else if ( elevator.goingDownIndicator() ) {
					//console.log( 'idle - going to next down floor' );
					elevator.goToFloor( elevator.currentFloor() - 1 );
				}
			} );

			elevator.on( 'stopped_at_floor', function( floorNum ) {
				//console.log( 'stopped', floorNum );

				resetIndicators( elevator );
				resetDestinationQueue( elevator );
				resetWaitingQueue( floorNum );
			} );

			elevator.on( "passing_floor", function( floorNum, direction ) {
				//console.log( 'passing', floorNum, direction );

				if ( -1 != elevator.getPressedFloors().indexOf( floorNum ) ) {
					//console.log( 'passing - going to pressed floor', floorNum );
					elevator.goToFloor( floorNum, true );
				} else {
					if ( elevator.loadFactor() < 1 && floors[floorNum].buttonStates[direction] ) {
						//console.log( 'passing - going to waiting floor', floorNum, direction );
						elevator.goToFloor( floorNum, true );

						// Remove from waiting queue unless someone is waiting to go in the opposite direction
						if ( !floors[floorNum].buttonStates[ oppositeDirection( direction ) ] ) {
							resetWaitingQueue( floorNum );
						}
					}
				}
			} );

			elevator.on( "floor_button_pressed", function( floorNum ) {
				//console.log( 'pressed', floorNum );

				elevator.goToFloor( floorNum );
			} );
		} );
	},

	update: function( dt, elevators, floors ) {
		// We normally don't need to do anything here
	}
}
