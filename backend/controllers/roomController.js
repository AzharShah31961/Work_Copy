const Room = require("../models/Room");
const axios = require("axios");
const Joi = require("joi");
const { updateRoomtype } = require("./roomtypeController");

const validateRoom = (data) => {
    const schema = Joi.object({
        type: Joi.string().required(),
        available: Joi.string().valid("yes", "no").required(),
        status: Joi.string().valid("occupied", "cleaning", "available").required(),
        floor: Joi.string().required(),
        roomno: Joi.number().required(),
    });
    return schema.validate(data);
};

createRoom = async (req, res) => {
    try {
        const { error } = validateRoom(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { type, available, status, floor } = req.body;

        // Check if RoomType exists
        const typeData = await axios.get(`http://localhost:5000/api/roomtype/${type}`);
        if (!typeData.data) {
            return res.status(400).json({ message: "Invalid Room Type ID!" });
        }

        // Check if Floor exists
        const floorData = await axios.get(`http://localhost:5000/api/floor/${floor}`);
        if (!floorData.data) {
            return res.status(400).json({ message: "Invalid Floor ID!" });
        }

        const floorNumber = floorData.data.number; // Extract floor number
        const floorLimit = floorData.data.limit;

        // Enforce room addition sequence
        const roomsOnFloor = await Room.find({ floor }).sort({ roomno: 1 });
        const lastRoomNo = roomsOnFloor.length > 0 ? roomsOnFloor[roomsOnFloor.length - 1].roomno : null;

        let newRoomNo;
        if (!lastRoomNo) {
            // First room on the floor
            newRoomNo = parseInt(`${floorNumber}01`);
        } else {
            newRoomNo = parseInt(lastRoomNo) + 1;

            // Prevent skipping sequence (No longer needed as user input is ignored)
        }

        // Enforce floor limit
        if (roomsOnFloor.length >= floorLimit) {
            return res.status(400).json({
                message: "Floor room limit reached. Cannot add more rooms.",
            });
        }

        // Validate available and status combination
        if (available === "yes" && (status === "occupied" || status === "cleaning")) {
            return res.status(400).json({
                message: "Room cannot be 'occupied' or 'cleaning' if it is 'available'.",
            });
        }

        // Create the new room
        const newRoom = new Room({
            type,
            available,
            status,
            floor,
            roomno: newRoomNo, // Auto-generated room number
        });
        await newRoom.save();

        res.status(201).json({ message: "Room created successfully!", room: newRoom });
    } catch (err) {
        console.error("Error in createRoom:", err);
        res.status(500).json({ message: err.message });
    }
};


// Other CRUD functions remain the same (readallRoom, readRoom, updateRoom, deleteRoom)
readallRoom = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Room not found!" });
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

updateRoom = async (req, res) => {
    try {
        // Allowed fields for partial update (roomno not included)
        const allowedFields = ["type", "available", "status", "floor"];

        // Extract fields from the request body
        const fieldsToUpdate = req.body;

        // Check if roomno is being updated
        if (fieldsToUpdate.roomno !== undefined) {
            return res.status(400).json({
                message: "Room number cannot be updated.",
            });
        }

        // Validate if the provided fields are allowed
        const invalidFields = Object.keys(fieldsToUpdate).filter(
            (field) => !allowedFields.includes(field)
        );
        if (invalidFields.length > 0) {
            return res
                .status(400)
                .json({ message: `Invalid fields: ${invalidFields.join(", ")}` });
        }

        // Create a Joi schema for validating only the provided fields
        const schema = Joi.object({
            type: Joi.string(),
            available: Joi.string().valid("yes", "no"),
            status: Joi.string().valid("occupied", "cleaning", "available"),
            floor: Joi.string(),
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Additional logic for constraints
        if (fieldsToUpdate.available === "yes" &&
            (fieldsToUpdate.status === "occupied" || fieldsToUpdate.status === "cleaning")) {
            return res.status(400).json({
                message: "Room cannot be 'occupied' or 'cleaning' if it is 'available'.",
            });
        }

        // Perform the partial update
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // Ensures Mongoose validations are applied
        );

        if (!updatedRoom) return res.status(404).json({ message: "Room not found!" });

        res.status(200).json({
            message: "Room updated successfully!",
            room: updatedRoom,
        });
    } catch (err) {
        console.error("Error updating Room:", err);
        res.status(500).json({ message: err.message });
    }
};



deleteRoom = async (req, res) => {
    try {
        // Find the room to be deleted
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Room not found!" });
        }

        // Fetch all rooms on the same floor
        const roomsOnFloor = await Room.find({ floor: room.floor }).sort({ roomno: 1 });

        // Find the room with the highest roomno on the floor
        const lastRoom = roomsOnFloor[roomsOnFloor.length - 1];

        // Ensure only the last room can be deleted
        if (lastRoom._id.toString() !== room._id.toString()) {
            return res.status(400).json({
                message: "Only the last room on the floor can be deleted.",
            });
        }

        // Delete the room
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Room deleted successfully!" });
    } catch (err) {
        console.error("Error deleting Room:", err);
        res.status(500).json({ message: err.message });
    }
};




module.exports = {
    createRoom,
    readallRoom,
    readRoom,
    updateRoom,
    deleteRoom,
    updateRoomtype,
};
