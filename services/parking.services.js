const Parking = require('../model/parking.model');
const supervisorModel = require('../model/supervisor');
const adminModel = require('../model/admin');

class ParkingService {
    static async addParkingData(parkingId, floors, selectedPlacesCount) {
        try {
            const parking = await Parking.findById(parkingId);
            if (!parking) {
                throw new Error('Parking not found');
            }

            floors.forEach(floor => {
                const floorIndex = floor.floorIndex;
                const rows = floor.rows;
                const columns = floor.columns;
                const parkingData = floor.parkingData;
                const places = floor.places.map(place => ({
                    floorIndex,
                    row: place.row,
                    column: place.column,
                    name: place.name,
                    status: place.status,
                    code: place.code,
                    battery: place.battery
                }));

                parking.floors.push({ floorIndex, rows, columns, parkingData, places });
            });

            parking.selectedPlacesCount = selectedPlacesCount;
            return await parking.save();
        } catch (error) {
            throw error;
        }
    }

    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static async getParkingsNearby(lat, lng) {
        try {
            const parkings = await Parking.find({}, 'id name longitude latitude distance pricing imageUrl selectedPlacesCount');

            const parkingsWithDistance = parkings.map(parking => {
                const distance = this.calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    parseFloat(parking.latitude),
                    parseFloat(parking.longitude)
                );
                return { ...parking._doc, distance };
            });

            parkingsWithDistance.sort((a, b) => a.distance - b.distance);
            return parkingsWithDistance.slice(0, 5);
        } catch (error) {
            throw error;
        }
    }

    static async getParkingById(id) {
        try {
            return await Parking.findById(id);
        } catch (error) {
            throw error;
        }
    }

    static async getParkingPlaces(parkingId) {
        try {
            const parking = await Parking.findById(parkingId);
            if (!parking) {
                throw new Error('Parking not found');
            }
            return parking.floors.flatMap(floor => floor.places);
        } catch (error) {
            throw error;
        }
    }

    static async getParkingFloors(parkingId) {
        try {
            const parking = await Parking.findById(parkingId);
            if (!parking) {
                throw new Error('Parking not found');
            }
            return parking.floors;
        } catch (error) {
            throw error;
        }
    }

    static async getParkingByName(name) {
        try {
            return await Parking.find({ name: { $regex: new RegExp(name, 'i') } });
        } catch (error) {
            throw error;
        }
    }

    static async getParkingCount() {
        try {
            return await Parking.countDocuments();
        } catch (error) {
            throw error;
        }
    }

    static async getParkingsBySupervisorId(supervisorId) {
        try {
            return await Parking.find({ supervisor: supervisorId });
        } catch (error) {
            throw error;
        }
    }

    static async deleteParking(id) {
        try {
            const deletedParking = await Parking.findByIdAndDelete(id);
            return !!deletedParking;
        } catch (error) {
            throw error;
        }
    }

    static async updateParking(id, updateData, file) {
        try {
            let parking = await Parking.findById(id);
            if (!parking) return null;

            const { name, longitude, latitude, admin, pricing, floors, description, selectedPlacesCount } = updateData;

            parking.name = name;
            parking.longitude = longitude;
            parking.latitude = latitude;
            parking.admin = admin;
            parking.pricing = pricing;
            parking.floors = floors;
            parking.description = description;
            parking.selectedPlacesCount = selectedPlacesCount;

            if (file) {
                parking.imageUrl = file.path;
            }

            return await parking.save();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ParkingService;
