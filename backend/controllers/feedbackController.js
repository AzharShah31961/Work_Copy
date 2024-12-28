const Feedback = require("../models/Feedback");
const axios = require("axios");
const Joi = require("joi");

const validateFeedback = (data) => {
    const schema = Joi.object({
        guest: Joi.string().required(),
        message: Joi.string().required(),
    });
    return schema.validate(data);
};

createFeedback = async (req, res) => {
    try {
        const { error } = validateFeedback(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { guest, message } = req.body;

        // Check if Guest exists
        const typeData = await axios.get(`http://localhost:5000/api/guest/${type}`);
        if (!typeData.data) {
            return res.status(400).json({ message: "Invalid Guest ID!" });
        }

        // Create the new Feedback
        const newFeedback = new Feedback({ guest, message });
        await newFeedback.save();

        res.status(201).json({ message: "Feedback created successfully!", feedback: newFeedback });
    } catch (err) {
        console.error("Error in createFeedback:", err);
        res.status(500).json({ message: err.message });
    }
};

// Other CRUD functions remain the same (readallFeedback, readFeedback, updateFeedback, deleteFeedback)
readallFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found!" });
        res.status(200).json(feedback);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

updateFeedback = async (req, res) => {
    try {
        // Allowed fields for partial update
        const allowedFields = [ "guest", "message" ];

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
            guest: Joi.string().required(),
            message: Joi.string().required(),
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Additional logic for constraints
        if (fieldsToUpdate.available === "yes" &&
            (fieldsToUpdate.status === "occupied" || fieldsToUpdate.status === "cleaning")) {
            return res.status(400).json({
                message: "Feedback cannot be 'occupied' or 'cleaning' if it is 'available'.",
            });
        }

        // Perform the partial update
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // Ensures Mongoose validations are applied
        );

        if (!updatedFeedback) return res.status(404).json({ message: "Feedback not found!" });

        res.status(200).json({
            message: "Feedback updated successfully!",
            feedback: updatedFeedback,
        });
    } catch (err) {
        console.error("Error updating Feedback:", err);
        res.status(500).json({ message: err.message });
    }
};


deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found!" });
        res.status(200).json({ message: "Feedback deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    createFeedback,
    readallFeedback,
    readFeedback,
    updateFeedback,
    deleteFeedback,
};
