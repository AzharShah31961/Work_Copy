const Foodorder = require("../models/FoodOrder");
const Joi = require("joi");
const axios = require("axios");

// Joi Validation
const validateFoodorder = (data) => {
    const schema = Joi.object({
        foodid: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        bill: Joi.number().optional(), // Bill will be calculated automatically
        status: Joi.string().valid("recieved", "gettingready", "read", "delivered").required(),
        paymentstatus: Joi.string().valid("paid", "unpaid").required(),
        type: Joi.string().valid("takeaway", "dinein", "roomserve").required(),
        ordertime: Joi.date().optional(), // Will be auto-assigned
        room: Joi.string().optional(), // Required only for "roomserve" type
        orderby: Joi.string().required(),
    });
    return schema.validate(data);
};

// Create a Food Order
const createFoodorder = async (req, res) => {
    try {
        // Validate the input
        const { error } = validateFoodorder(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { foodid, quantity, status, paymentstatus, type, ordertime, room, orderby } = req.body;

        // Check if the food item exists
        const foodResponse = await axios.get(`http://localhost:5000/api/food/${foodid}`);
        const food = foodResponse.data;
        if (!food) return res.status(404).json({ message: "Food item not found!" });

        // Check if the quantity is sufficient
        if (food.quantity < quantity) {
            return res.status(400).json({
                message: `Can't place order of ${quantity} pcs because only ${food.quantity} pcs remaining.`,
            });
        }

        // Create the order (only if all validations pass)
        const newFoodorder = new Foodorder({ foodid, quantity, status, paymentstatus, type, ordertime, room, orderby });
        await newFoodorder.save();

        // Deduct the quantity after order creation
        const updatedQuantity = food.quantity - quantity;
        await axios.put(`http://localhost:5000/api/food/update/${foodid}`, { quantity: updatedQuantity });

        res.status(201).json({ message: "Order placed successfully!" });
    } catch (err) {
        if (err.response) {
            return res.status(err.response.status).json({ message: err.response.data.message });
        }
        res.status(500).json({ message: err.message });
    }
};


// Read All Orders
const readallFoodorder = async (req, res) => {
    try {
        const foodorders = await Foodorder.find();
        res.status(200).json(foodorders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Read a Single Order
const readFoodorder = async (req, res) => {
    try {
        const foodorder = await Foodorder.findById(req.params.id);
        if (!foodorder) return res.status(404).json({ message: "Order not found!" });
        res.status(200).json(foodorder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update an Order
const updateFoodorder = async (req, res) => {
    try {
        // Allowed fields for partial update
        const allowedFields = [
            'foodid',
            'quantity',
            'bill',
            'status',
            'paymentstatus',
            'type',
            'ordertime',
            'room',
            'orderby',
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
                .json({ message: `Invalid fields: ${invalidFields.join(', ')}` });
        }

        // Create a Joi schema for validating only the provided fields
        const schema = Joi.object({
            foodid: Joi.string(),
            quantity: Joi.number().min(1),
            bill: Joi.number(),
            status: Joi.string().valid('recieved', 'gettingready', 'ready', 'delivered'),
            paymentstatus: Joi.string().valid('paid', 'unpaid'),
            type: Joi.string().valid('takeaway', 'dinein', 'roomserve'),
            ordertime: Joi.date(),
            room: Joi.string(), // Optional field for "roomserve"
            orderby: Joi.string(),
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Perform the partial update
        const updatedFoodorder = await Foodorder.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // `runValidators` ensures the fields are validated
        );

        if (!updatedFoodorder)
            return res.status(404).json({ message: 'Order not found!' });

        res.status(200).json({
            message: 'Order updated successfully!',
            order: updatedFoodorder,
        });
    } catch (err) {
        console.error('Error updating Foodorder:', err);
        res.status(500).json({ message: err.message });
    }
};


// Delete an Order
const deleteFoodorder = async (req, res) => {
    try {
        const foodorder = await Foodorder.findByIdAndDelete(req.params.id);
        if (!foodorder) return res.status(404).json({ message: "Order not found!" });
        res.status(200).json({ message: "Order deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createFoodorder,
    readallFoodorder,
    readFoodorder,
    updateFoodorder,
    deleteFoodorder,
};
