const Laundryorder = require("../models/Laundryorder");
const Joi = require("joi");
const axios = require("axios")

const validateLaundryorder = (data, isUpdate = false) => {
    // Define schema with optional fields for updates
    const schema = Joi.object({
        laundryid: isUpdate ? Joi.string().optional() : Joi.string().required(),
        quantity: isUpdate ? Joi.number().optional() : Joi.number().required(),
        bill: isUpdate ? Joi.number().optional() : Joi.number().required(),
        status: isUpdate
            ? Joi.string().valid("pending", "gettingwashed", "drying", "ready").optional()
            : Joi.string().valid("pending", "gettingwashed", "drying", "ready").required(),
        paymentstatus: isUpdate
            ? Joi.string().valid("paid", "unpaid").optional()
            : Joi.string().valid("paid", "unpaid").required(),
        bookingid: isUpdate ? Joi.string().optional() : Joi.string().required(),
        ordertime: isUpdate ? Joi.date().optional() : Joi.date().required(),
        orderby: isUpdate ? Joi.string().optional() : Joi.string().required(),
    });
    return schema.validate(data);
};

const createLaundryorder = async (req, res) => {
    try {
        const { error } = validateLaundryorder(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { laundryid, quantity, status, paymentstatus, bookingid, orderby } = req.body;

        // Validate booking ID
        const bookingResponse = await axios.get(`http://localhost:5000/api/booking/${bookingid}`);
        if (!bookingResponse.data) {
            return res.status(404).json({ message: "Booking not found or invalid!" });
        }

        // Create the order
        const newLaundryorder = new Laundryorder({ laundryid, quantity, status, paymentstatus, room: bookingid, orderby });
        await newLaundryorder.save();

        res.status(201).json({ message: "Order placed successfully!" });
    } catch (err) {
        if (err.response) {
            return res.status(err.response.status).json({ message: err.response.data.message });
        }
        res.status(500).json({ message: err.message });
    }
};


readallLaundryorder = async (req, res) => {
    try {
        const laundryorders = await Laundryorder.find();
        res.status(200).json(laundryorders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readLaundryorder = async (req, res) => {
    try {
        const laundryorder = await Laundryorder.findById(req.params.id);
        if (!laundryorder) return res.status(404).json({ message: "Order not found!" });
        res.status(200).json(laundryorder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateLaundryorder = async (req, res) => {
    try {
        // Allowed fields for partial update
        const allowedFields = [
            "laundryid",
            "quantity",
            "bill",
            "status",
            "paymentstatus",
            "room",
            "ordertime",
            "orderby",
        ];

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
            laundryid: Joi.string(),
            quantity: Joi.number(),
            bill: Joi.number(),
            status: Joi.string().valid("pending", "gettingwashed", "drying", "ready"),
            paymentstatus: Joi.string().valid("paid", "unpaid"),
            room: Joi.string(),
            ordertime: Joi.date(),
            orderby: Joi.string(),
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Perform the partial update
        const updatedLaundryorder = await Laundryorder.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // Ensures Mongoose validations are applied
        );

        if (!updatedLaundryorder)
            return res.status(404).json({ message: "Order not found!" });

        res.status(200).json({
            message: "Order updated successfully!",
            laundryorder: updatedLaundryorder,
        });
    } catch (err) {
        console.error("Error updating Laundry Order:", err);
        res.status(500).json({ message: err.message });
    }
};


deleteLaundryorder = async (req, res) => {
    try {
        const laundryorder = await Laundryorder.findByIdAndDelete(req.params.id);
        if (!laundryorder) return res.status(404).json({ message: "Order not found!" });
        res.status(200).json({ message: "Order deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createLaundryorder,
    readallLaundryorder,
    readLaundryorder,
    updateLaundryorder,
    deleteLaundryorder
}
