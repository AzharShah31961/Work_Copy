const Floor = require("../models/Floor");
const Joi = require("joi");

const validateFloor = (data) => {
    const schema = Joi.object({
        number: Joi.number().min(1).required(),
        available: Joi.string().valid("yes", "no").required(),
        limit: Joi.number().required(),
    });
    return schema.validate(data);
};

// Create Floor
const createFloor = async (req, res) => {
    try {
        const { error } = validateFloor(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { number, available, limit } = req.body;

        // Check for the highest floor number
        const lastFloor = await Floor.findOne().sort({ number: -1 }); // Get the floor with the highest number

        if (lastFloor) {
            // Ensure the new floor number is exactly lastFloor.number + 1
            if (number !== lastFloor.number + 1) {
                return res.status(400).json({
                    message: `Floor numbers must be sequential! The next floor number should be ${lastFloor.number + 1}.`,
                });
            }
        } else {
            // If no floors exist, only allow floor number 1
            if (number !== 1) {
                return res.status(400).json({
                    message: "First floor must start with number 1.",
                });
            }
        }

        // Create new Floor if validation passes
        const newFloor = new Floor({ number, available, limit });
        await newFloor.save();

        res.status(201).json({ message: "Floor created successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


readallFloor = async (req, res) => {
    try {
        const floors = await Floor.find();
        res.status(200).json(floors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readFloor = async (req, res) => {
    try {
        const floor = await Floor.findById(req.params.id);
        if (!floor) return res.status(404).json({ message: "Floor not found!" });
        res.status(200).json(floor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateFloor = async (req, res) => {
    try {
        // Allowed fields for update
        const allowedFields = ["available", "limit"];

        // Extract and validate fields from req.body
        const fieldsToUpdate = req.body;

        // Check if no valid fields are provided
        const providedFields = Object.keys(fieldsToUpdate).filter(field => allowedFields.includes(field));
        if (providedFields.length === 0) {
            return res.status(400).json({ message: "No valid fields to update. Only 'available' and 'limit' can be updated." });
        }

        // Validate fields using Joi
        const schema = Joi.object({
            available: Joi.string().valid("yes", "no"),
            limit: Joi.number(),
        }).fork(providedFields, schema => schema.required());

        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Update the floor with only the provided fields
        const updatedFloor = await Floor.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // Ensure validation during the update
        );

        if (!updatedFloor) return res.status(404).json({ message: "Floor not found!" });

        res.status(200).json({ message: "Floor updated successfully!", floor: updatedFloor });
    } catch (err) {
        console.error("Error updating Floor:", err);
        res.status(500).json({ message: err.message });
    }
};



deleteFloor = async (req, res) => {
    try {
        const floor = await Floor.findByIdAndDelete(req.params.id);
        if (!floor) return res.status(404).json({ message: "Floor not found!" });
        res.status(200).json({ message: "Floor deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createFloor,
    readallFloor,
    readFloor,
    updateFloor,
    deleteFloor
}
