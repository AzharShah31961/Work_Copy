const mongoose = require("mongoose");
const axios = require("axios");

const roomSchema = new mongoose.Schema({
    type: {
        type: mongoose.Schema.Types.ObjectId, // Storing roomtype as an ObjectId for consistency
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    // Fetch the list of valid roomtypes from the API
                    const response = await axios.get("http://localhost:5000/api/roomtype/");
                    const validRoomtypes = response.data.map(roomtype => roomtype._id); // Extract roomtype IDs
                    return validRoomtypes.includes(value.toString()); // Ensure the roomtype ID exists
                } catch (err) {
                    console.error("Error fetching Room Type:", err);
                    return false; // Validation fails if the API fails
                }
            },
            message: (props) => `${props.value} is not a valid Room Type ID.`,
        },
    },
    available: {
        type: String,
        enum: ["yes", "no"],
        required: true,
    },
    status: {
        type: String,
        enum: ["occupied", "cleaning", "available"],
        required: true,
    },
    floor: {
        type: mongoose.Schema.Types.ObjectId, // Storing floor as an ObjectId for consistency
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    // Fetch the list of valid floors from the API
                    const response = await axios.get("http://localhost:5000/api/floor/");
                    const validFloors = response.data.map(floor => floor._id); // Extract floor IDs
                    return validFloors.includes(value.toString()); // Ensure the floor ID exists
                } catch (err) {
                    console.error("Error fetching Floor:", err);
                    return false; // Validation fails if the API fails
                }
            },
            message: (props) => `${props.value} is not a valid Floor ID.`,
        },
    },
    roomno: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Room", roomSchema);
