const Laundry = require("../models/Laundry");
const Joi = require("joi");

const validateLaundry = (data) => {
    const schema = Joi.object({
        object: Joi.string().min(3).required(),
        category: Joi.string().valid("Clothing Items", "Bed & Bath Linen","Special Items", "Additional Services").required(),
        pricing: Joi.number().required(),
    });
    return schema.validate(data);
};

// Create Laundry
createLaundry = async (req, res) => {
    try {
        const { error } = validateLaundry(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
    
        const { object, category, pricing } = req.body;
    
        // Check if a Laundry already exists based on object
        const existingLaundry = await Laundry.findOne({
            $or: [{ object }]
        });
    
        if (existingLaundry) {
            return res.status(400).json({ message: "Laundry Item already exists!" });
        }
    
        // Create new Laundry if no existing Laundry matches
        const newLaundry = new Laundry({ object, category, pricing });
        await newLaundry.save();
    
        res.status(201).json({ message: "Laundry Item created successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


readallLaundry = async (req, res) => {
    try {
        const laundrys = await Laundry.find();
        res.status(200).json(laundrys);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readLaundry = async (req, res) => {
    try {
        const laundry = await Laundry.findById(req.params.id);
        if (!laundry) return res.status(404).json({ message: "Laundry Item not found!" });
        res.status(200).json(laundry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateLaundry = async (req, res) => {
    try {
        // Allowed fields for partial update
        const allowedFields = ['object', 'category', 'pricing'];

        // Extract fields from the request body
        const fieldsToUpdate = req.body;

        // Validate if the provided fields are allowed
        const invalidFields = Object.keys(fieldsToUpdate).filter(
            (field) => !allowedFields.includes(field)
        );
        if (invalidFields.length > 0) {
            return res
                .status(400)
                .json({ message: `Invalid fields: ${invalidFields.join(', ')}` });
        }

        // Create a Joi schema for validating only the provided fields
        const schema = Joi.object({
            object: Joi.string().min(3),
            category: Joi.string().valid("Clothing Items", "Bed & Bath Linen", "Special Items", "Additional Services"),
            pricing: Joi.number(),
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Perform the partial update
        const updatedLaundry = await Laundry.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // Ensures Mongoose validations are applied
        );

        if (!updatedLaundry) return res.status(404).json({ message: "Laundry Item not found!" });

        res.status(200).json({
            message: "Laundry Item updated successfully!",
            laundry: updatedLaundry,
        });
    } catch (err) {
        console.error("Error updating Laundry Item:", err);
        res.status(500).json({ message: err.message });
    }
};


deleteLaundry = async (req, res) => {
    try {
        const laundry = await Laundry.findByIdAndDelete(req.params.id);
        if (!laundry) return res.status(404).json({ message: "Laundry Item not found!" });
        res.status(200).json({ message: "Laundry Item deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createLaundry,
    readallLaundry,
    readLaundry,
    updateLaundry,
    deleteLaundry
}
