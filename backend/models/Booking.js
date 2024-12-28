const mongoose = require("mongoose");
const axios = require("axios");

const bookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: async function (value) {
        // Room validation
      },
      message: "Invalid or unavailable Room ID.",
    },
  },
  bookfor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: async function (value) {
        try {
          const response = await axios.get(`http://localhost:5000/api/guest/${value}`);
          const guest = response.data;
          return !!guest; // Guest exists
        } catch (error) {
          return false; // Guest not found
        }
      },
      message: "Invalid Guest ID.",
    },
  },
  bookedby: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: async function (value) {
        try {
          const staffResponse = await axios.get(`http://localhost:5000/api/staff/${value}`);
          const staff = staffResponse.data;

          if (!staff) return false;

          const roleResponse = await axios.get(`http://localhost:5000/api/role/${staff.role}`);
          const role = roleResponse.data;

          return role && role.name === "receptionist";
        } catch (error) {
          return false;
        }
      },
      message: "Invalid Staff ID or Staff is not a Receptionist.",
    },
  },
  bookingtime: {
    type: Date,
    default: () => new Date(),
  },
  expectedcheckin: {
    type: Date,
    required: true,
  },
  checkin: {
    type: Date,
    default: null, // Default to null
  },
  expectedcheckout: {
    type: Date,
    required: true,
  },
  checkout: {
    type: Date,
    default: null, // Default to null
  },
  staytime: {
    type: String, // Store as a human-readable duration
  },
  bill: {
    type: Number,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
