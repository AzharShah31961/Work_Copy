const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
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
    password: {
        type: String,
        required: true,
    },
});

// Pre-save hook to hash password
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
module.exports = mongoose.model("Admin", adminSchema);
