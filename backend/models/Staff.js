const axios = require("axios");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Import bcrypt if not already imported

const staffSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\S+@\S+\.\S+$/,
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{11}$/,
    },
    cnic: {
        type: String,
        required: true,
        match: /^[0-9]{13}$/,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId, // Storing role as an ObjectId for consistency
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    // Fetch the list of valid roles from the API
                    const response = await axios.get("http://localhost:5000/api/role/");
                    const validRoles = response.data.map(role => role._id); // Extract role IDs
                    return validRoles.includes(value.toString()); // Ensure the role ID exists
                } catch (err) {
                    console.error("Error fetching roles:", err);
                    return false; // Validation fails if the API fails
                }
            },
            message: (props) => `${props.value} is not a valid role ID.`,
        },
    },
});

// Pre-save hook to hash password
staffSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model("Staff", staffSchema);
