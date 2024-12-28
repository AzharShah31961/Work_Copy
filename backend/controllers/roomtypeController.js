const Roomtype = require("../models/Roomtype");
const Joi = require("joi");

const validateRoomtype = (data) => {
    const schema = Joi.object({
        type: Joi.string().required(),
        halfdayprice: Joi.number().required(),
        fulldayprice: Joi.number().required(),
    });
    return schema.validate(data);
};

// Create Roomtype
createRoomtype = async (req, res) => {
    try {
        const { error } = validateRoomtype(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
    
        const { type, halfdayprice, fulldayprice } = req.body;
    
        // Check if a Roomtype already exists based on object
        const existingRoomtype = await Roomtype.findOne({
            $or: [{ type }]
        });
    
        if (existingRoomtype) {
            return res.status(400).json({ message: "Room type already exists!" });
        }
    
        // Create new Roomtype if no existing Roomtype matches
        const newRoomtype = new Roomtype({ type, halfdayprice, fulldayprice });
        await newRoomtype.save();
    
        res.status(201).json({ message: "Room type created successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


readallRoomtype = async (req, res) => {
    try {
        const roomtypes = await Roomtype.find();
        res.status(200).json(roomtypes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readRoomtype = async (req, res) => {
    try {
        const roomtype = await Roomtype.findById(req.params.id);
        if (!roomtype) return res.status(404).json({ message: "Room type not found!" });
        res.status(200).json(roomtype);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

updateRoomtype = async (req, res) => {
    try {
        // Allowed fields for partial update
        const allowedFields = ["type", "halfdayprice", "fulldayprice"];

        // Extract fields from the request body
        const fieldsToUpdate = req.body;

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
            halfdayprice: Joi.number(),
            fulldayprice: Joi.number(),
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Perform the partial update
        const updatedRoomtype = await Roomtype.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // Ensures Mongoose validations are applied
        );

        if (!updatedRoomtype) return res.status(404).json({ message: "Room type not found!" });

        res.status(200).json({
            message: "Room type updated successfully!",
            roomtype: updatedRoomtype,
        });
    } catch (err) {
        console.error("Error updating Roomtype:", err);
        res.status(500).json({ message: err.message });
    }
};


deleteRoomtype = async (req, res) => {
    try {
        const roomtype = await Roomtype.findByIdAndDelete(req.params.id);
        if (!roomtype) return res.status(404).json({ message: "Room type not found!" });
        res.status(200).json({ message: "Room type deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createRoomtype,
    readallRoomtype,
    readRoomtype,
    updateRoomtype,
    deleteRoomtype
}
