/**
 * Subject (Observable)
 */
class ParkingSubject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  async notify(parking) {
    console.log(`Notifying ${this.observers.length} observers for parking: ${parking.name}`);
    for (const observer of this.observers) {
      await observer.update(parking);
    }
  }
}

/**
 * Observer Interface (Conceptual)
 * { update(parking) }
 */

class CounterObserver {
  async update(parking) {
    console.log('CounterObserver: Updating occupied and reserved places count.');
    let occupiedCount = 0;
    let reservedCount = 0;

    if (parking.floors && parking.floors.length > 0) {
      for (const floor of parking.floors) {
        if (floor.places && floor.places.length > 0) {
          for (const place of floor.places) {
            if (place.status === false) {
              occupiedCount++;
            } else {
              reservedCount++;
            }
          }
        }
      }
    }

    parking.occupiedPlacesCount = occupiedCount;
    parking.reservedPlacesCount = reservedCount;
    
    // Use findByIdAndUpdate to avoid triggering 'save' hooks recursively if possible,
    // or just call save() if we know the hook won't re-trigger infinitely.
    // Given the current logic, we'll stick to the existing save() behavior but be mindful.
    await parking.save();
  }
}

class TicketObserver {
  async update(parking) {
    console.log(`TicketObserver: Notified of changes in parking ${parking.name}. Checking for ticket updates...`);
    // Logic for tickets could go here (e.g., updating ticket status based on place availability)
  }
}

// Create the subject instance
const parkingSubject = new ParkingSubject();

// Register default observers
parkingSubject.subscribe(new CounterObserver());
parkingSubject.subscribe(new TicketObserver());

module.exports = parkingSubject;
