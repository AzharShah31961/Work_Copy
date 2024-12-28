const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    },
    
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{11}$/,
    },
    documenttype: {
        type: String,
        required: true,
        enum: ["passport", "cnic"],
    },
    documentno: {
        type: String,
        required: true,
    },
});

// Pre-save hook to validate documentno based on documenttype
guestSchema.pre("save", function (next) {
    if (this.documenttype === "passport") {
        if (this.documentno.length < 6 || this.documentno.length > 10) {
            return next(
                new Error("Document number must be between 6 to 10 characters for a passport.")
            );
        }
    } else if (this.documenttype === "cnic") {
        if (this.documentno.length !== 13) {
            return next(
                new Error("Document number must be exactly 13 characters for a CNIC.")
            );
        }
    }
    next();
});

module.exports = mongoose.model("Guest", guestSchema);

