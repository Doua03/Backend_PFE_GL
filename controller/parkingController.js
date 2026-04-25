const Parking = require("../model/parking.model");
const supervisorModel = require("../model/supervisor");
const adminModel = require("../model/admin");
const SupervisorService = require("../services/supervisor.services");

exports.uploadImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }
  const imageUrl = req.file.path;
  res.status(200).json({ imageUrl });
};

exports.addParkingData = async (req, res) => {
  try {
    const { parkingId, floors, selectedPlacesCount } = req.body;

    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ error: "Parking not found" });
    }

    floors.forEach((floor) => {
      const floorIndex = floor.floorIndex;
      const rows = floor.rows;
      const columns = floor.columns;
      const parkingData = floor.parkingData;
      const places = floor.places.map((place) => ({
        floorIndex,
        row: place.row,
        column: place.column,
        name: place.name,
        status: place.status,
        code: place.code,
        battery: place.battery,
      }));

      parking.floors.push({ floorIndex, rows, columns, parkingData, places });
    });

    parking.selectedPlacesCount = selectedPlacesCount;
    await parking.save();
    res.status(201).json({ message: "Parking data added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addParking = async (req, res) => {
  try {
    const {
      userId,
      name,
      longitude,
      latitude,
      admin,
      pricing,
      floors,
      description,
      imageUrl,
    } = req.body;

    const newParking = await SupervisorService.addParking(
      userId,
      name,
      longitude,
      latitude,
      admin,
      pricing,
      floors,
      description,
      imageUrl,
    );

    res.status(201).json(newParking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getParkings = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const supervisor = await supervisorModel.findById(userId);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const parkings = await Parking.find({ supervisor: userId });

    res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteParking = async (req, res) => {
  try {
    const parkingId = req.params.id;
    const deletedParking = await Parking.findByIdAndDelete(parkingId);
    if (!deletedParking) {
      return res.status(404).json({ error: "Parking not found" });
    }
    res.status(200).json({ message: "Parking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getParkingById = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res.status(404).json({ msg: "Parking not found" });
    }
    res.json(parking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateParking = async (req, res) => {
  const {
    name,
    longitude,
    latitude,
    admin,
    pricing,
    floors,
    description,
    selectedPlacesCount,
  } = req.body;
  try {
    let parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res.status(404).json({ msg: "Parking not found" });
    }

    parking.name = name;
    parking.longitude = longitude;
    parking.latitude = latitude;
    parking.admin = admin;
    parking.pricing = pricing;
    parking.floors = floors;
    parking.description = description;
    parking.selectedPlacesCount = selectedPlacesCount;

    if (req.file) {
      parking.imageUrl = req.file.path;
    }

    await parking.save();

    res.json({ message: "Parking updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
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
  const distance = R * c;
  return distance;
}

exports.getParkingsNearby = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const parkings = await Parking.find(
      {},
      "id name longitude latitude distance pricing imageUrl selectedPlacesCount",
    );

    const parkingsWithDistance = parkings.map((parking) => {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(parking.latitude),
        parseFloat(parking.longitude),
      );
      return { ...parking._doc, distance };
    });

    parkingsWithDistance.sort((a, b) => a.distance - b.distance);

    const nearestParkings = parkingsWithDistance.slice(0, 5);

    res.status(200).json(nearestParkings);
  } catch (error) {
    console.error("Error in /parking/getParkinsNearby:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.getParkingPlaces = async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ error: "Parking not found" });
    }

    const places = parking.floors.flatMap((floor) => floor.places);
    res.status(200).json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Assuming your data structure in the backend has parking places with a name field
exports.getParkingFloors = async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ error: "Parking not found" });
    }

    res.status(200).json({ floors: parking.floors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getParkingByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Parking name is required" });
    }

    // Perform a case-insensitive search for parking by name
    const parkings = await Parking.find({
      name: { $regex: new RegExp(name, "i") },
    });
    res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * EXEMPLE D'UTILISATION - Builder Pattern (Monteur):
 * const { ParkingQueryBuilder } = require('../patterns/builder/ParkingQueryBuilder');
 *
 * const query = new ParkingQueryBuilder()
 *   .byLocation(48.8566, 2.3522, 5000)
 *   .byAvailability(true)
 *   .byPrice(5, 20)
 *   .byType("garage")
 *   .build();
 *
 * const parkings = await Parking.find(query);
 */
exports.searchParkings = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Parking name is required" });
    }

    // Effectuer une recherche insensible à la casse des parkings par nom
    const parkings = await Parking.find({
      name: { $regex: new RegExp(name, "i") },
    });
    res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getParkingCount = async (req, res) => {
  try {
    const parkingCount = await Parking.countDocuments();
    res.status(200).json({ parkingCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getParkingsBySupervisorId = async (req, res) => {
  try {
    const { supervisorId } = req.params;
    if (!supervisorId) {
      return res.status(400).json({ message: "Supervisor ID is required" });
    }

    const supervisor = await supervisorModel.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const parkings = await Parking.find({ supervisor: supervisorId });
    res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getParkingsByAdminEmail = async (req, res) => {
  try {
    const { adminEmail } = req.query;
    if (!adminEmail) {
      return res.status(400).json({ error: "Admin email is required" });
    }

    // Find the user by email
    const adminUser = await adminModel.findOne({ email: adminEmail });
    if (!adminUser) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Find parkings associated with the admin
    const parkings = await Parking.findOne({ admin: adminUser.email });

    // Check if parkings exist and have a 'name' property
    if (!parkings || !parkings.name) {
      return res.status(404).json({ error: "Parking not found" });
    }

    const parkingName = parkings.name;
    console.log(parkingName);

    res.status(200).json(parkingName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getParkingsByAdminEmail = async (req, res) => {
  try {
    const { adminEmail } = req.query;
    if (!adminEmail) {
      return res.status(400).json({ error: "Admin email is required" });
    }

    // Find the user by email
    const adminUser = await adminModel.findOne({ email: adminEmail });
    if (!adminUser) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Find parkings associated with the admin
    const parkings = await Parking.find({ admin: adminUser.email });

    res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
