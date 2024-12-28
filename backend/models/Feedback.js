const mongoose = require("mongoose");
const axios = require("axios");

const feedbackSchema = new mongoose.Schema({
    guest: {
        type: mongoose.Schema.Types.ObjectId, // Storing guest as an ObjectId for consistency
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    // Fetch the list of valid guests from the API
                    const response = await axios.get("http://localhost:5000/api/guest/");
                    const validguests = response.data.map(guest => guest._id); // Extract guest IDs
                    return validGuests.includes(value.toString()); // Ensure the guest ID exists
                } catch (err) {
                    console.error("Error fetching Guest:", err);
                    return false; // Validation fails if the API fails
                }
            },
            message: (props) => `${props.value} is not a valid Guest ID.`,
        },
    },
    message: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
