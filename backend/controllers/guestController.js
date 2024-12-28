const Guest = require("../models/Guest");
const Joi = require("joi");
const axios = require("axios");

const validateGuest = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(new RegExp("^[0-9]{11}$")).required(),
        documenttype: Joi.string().valid("passport", "cnic").required(),
        documentno: Joi.string()
            .when("documenttype", {
                is: "passport",
                then: Joi.string().min(6).max(10).required(),
            })
            .when("documenttype", {
                is: "cnic",
                then: Joi.string().length(13).required(),
            }),
    });
    return schema.validate(data);
};


// Create Guest
createGuest = async (req, res) => {
    try {
        const { error } = validateGuest(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
    
        const { name, email, phone, documenttype, documentno } = req.body;

        // Check if a Guest already exists based on email, phone, or cnic
        const existingGuest = await Guest.findOne({
            $or: [{ email }, { phone }, { documentno }]
        });
    
        if (existingGuest) {
            return res.status(400).json({ message: "Guest already exists!" });
        }
    
        // Create new Guest if no existing Guest matches
        const newGuest = new Guest({ name, email, phone, documenttype, documentno });
        await newGuest.save();
    
        res.status(201).json({ message: "Guest created successfully!" });
    } catch (err) {
        console.error("Error in createGuest:", err);
        res.status(500).json({ message: err.message });
    }
};



readallGuest = async (req, res) => {
    try {
        const guests = await Guest.find();
        res.status(200).json(guests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readGuest = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) return res.status(404).json({ message: "Guest not found!" });
        res.status(200).json(guest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateGuest = async (req, res) => {
    try {
        // Allowed fields for partial update
        const allowedFields = ['name', 'email', 'phone', 'documenttype', 'documentno'];

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
            name: Joi.string(),
            email: Joi.string().email(),
            phone: Joi.string().pattern(new RegExp("^[0-9]{11}$")),
            documenttype: Joi.string().valid("passport", "cnic"),
            documentno: Joi.string().when("documenttype", {
                is: "passport",
                then: Joi.string().min(6).max(10),
            }).when("documenttype", {
                is: "cnic",
                then: Joi.string().length(13),
            }),
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Perform the partial update
        const updatedGuest = await Guest.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // `runValidators` ensures fields are validated
        );

        if (!updatedGuest) return res.status(404).json({ message: "Guest not found!" });

        res.status(200).json({
            message: "Guest updated successfully!",
            guest: updatedGuest,
        });
    } catch (err) {
        console.error("Error updating Guest:", err);
        res.status(500).json({ message: err.message });
    }
};


deleteGuest = async (req, res) => {
    try {
        const guest = await Guest.findByIdAndDelete(req.params.id);
        if (!guest) return res.status(404).json({ message: "Guest not found!" });
        res.status(200).json({ message: "Guest deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createGuest,
    readallGuest,
    readGuest,
    updateGuest,
    deleteGuest
}
