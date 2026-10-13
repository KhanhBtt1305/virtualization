class BusLocation {
    constructor(locationId, driverId, routeId, scheduleId, latitude, longitude, speed, heading, accuracy, recordedAt) {
        this.locationId = locationId;
        this.driverId = driverId;
        this.routeId = routeId;
        this.scheduleId = scheduleId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.heading = heading;
        this.accuracy = accuracy;
        this.recordedAt = recordedAt;
    }

    // Method to update bus location data
    updateLocation(latitude, longitude, speed, heading, accuracy) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.heading = heading;
        this.accuracy = accuracy;
        this.recordedAt = new Date(); // Update the recorded time to now
    }

    // Method to get location details
    getLocationDetails() {
        return {
            locationId: this.locationId,
            driverId: this.driverId,
            routeId: this.routeId,
            scheduleId: this.scheduleId,
            latitude: this.latitude,
            longitude: this.longitude,
            speed: this.speed,
            heading: this.heading,
            accuracy: this.accuracy,
            recordedAt: this.recordedAt
        };
    }
}

export default BusLocation;