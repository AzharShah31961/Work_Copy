const Booking = require("../models/Booking");
const axios = require("axios");
const Joi = require("joi");
const moment = require("moment");

const calculateBill = async (roomId, duration) => {
    const roomResponse = await axios.get(`http://localhost:5000/api/room/${roomId}`);
    const roomTypeId = roomResponse.data.type;

    const roomTypeResponse = await axios.get(`http://localhost:5000/api/roomtype/${roomTypeId}`);
    const { halfdayprice, fulldayprice } = roomTypeResponse.data;

    const [days, hours] = duration.split(" days ").map((val) => parseInt(val.replace(" hours", ""), 10));
    const fullDays = days;
    const halfDays = hours > 6 ? 1 : 0;

    return fullDays * fulldayprice + halfDays * halfdayprice;
};


const createBooking = async (req, res) => {
    try {
        const { room, bookfor, bookedby, expectedcheckin, expectedcheckout } = req.body;

        // Validate room
        const roomResponse = await axios.get(`http://localhost:5000/api/room/${room}`);
        if (!roomResponse.data || roomResponse.data.available !== 'yes') {
            return res.status(400).json({ message: "Room is not available for booking." });
        }

        // Validate guest
        const guestResponse = await axios.get(`http://localhost:5000/api/guest/${bookfor}`);
        if (!guestResponse.data) {
            return res.status(400).json({ message: "Invalid Guest ID." });
        }

        // Validate staff
        const staffResponse = await axios.get(`http://localhost:5000/api/staff/${bookedby}`);
        const staff = staffResponse.data;
        if (!staff) return res.status(400).json({ message: "Invalid Staff ID." });

        const roleResponse = await axios.get(`http://localhost:5000/api/role/${staff.role}`);
        if (!roleResponse.data || roleResponse.data.name !== "receptionist") {
            return res.status(400).json({ message: "Staff is not a receptionist." });
        }

        const bookingTime = new Date();
        const expectedCheckinParsed = new Date(expectedcheckin);
        const expectedCheckoutParsed = new Date(expectedcheckout);

        // Validate expectedcheckin
        if (
            expectedCheckinParsed < bookingTime ||
            expectedCheckinParsed > moment(bookingTime).add(20, "days").toDate()
        ) {
            return res.status(400).json({ message: "Expected check-in time is invalid." });
        }

        // Validate expectedcheckout
        if (expectedCheckoutParsed < expectedCheckinParsed) {
            return res.status(400).json({ message: "Expected check-out time must be after expected check-in time." });
        }

        // Calculate stay duration using expected dates
        const duration = moment.duration(moment(expectedCheckoutParsed).diff(moment(expectedCheckinParsed)));
        const stayDuration = `${Math.floor(duration.asDays())} days ${Math.round(duration.asHours() % 24)} hours`;

        // Calculate bill
        const bill = await calculateBill(room, stayDuration);

        const newBooking = new Booking({
            room,
            bookfor,
            bookedby,
            bookingtime: bookingTime,
            expectedcheckin: expectedCheckinParsed,
            expectedcheckout: expectedCheckoutParsed,
            staytime: stayDuration,
            bill,
        });

        await newBooking.save();

        // Update room status
        await axios.put(`http://localhost:5000/api/room/update/${room}`, {
            available: "no",
            status: "occupied",
        });

        res.status(201).json({ message: "Booking created successfully!", booking: newBooking });
    } catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).json({ message: err.message });
    }
};





// Other CRUD functions remain the same (readallBooking, readBooking, updateBooking, deleteBooking)
readallBooking = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found!" });
        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateBooking = async (req, res) => {
    try {
        const updates = req.body; // Declare updates and assign request body

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found!" });

        // Validate room (if being updated)
        if (updates.room) {
            const roomResponse = await axios.get(`http://localhost:5000/api/room/${updates.room}`);
            if (!roomResponse.data || roomResponse.data.available !== 'yes') {
                return res.status(400).json({ message: "Room is not available for booking." });
            }
        }

        // Validate guest (if being updated)
        if (updates.bookfor) {
            const guestResponse = await axios.get(`http://localhost:5000/api/guest/${updates.bookfor}`);
            if (!guestResponse.data) {
                return res.status(400).json({ message: "Invalid Guest ID." });
            }
        }

        // Validate staff (if being updated)
        if (updates.bookedby) {
            const staffResponse = await axios.get(`http://localhost:5000/api/staff/${updates.bookedby}`);
            const staff = staffResponse.data;
            if (!staff) return res.status(400).json({ message: "Invalid Staff ID." });

            const roleResponse = await axios.get(`http://localhost:5000/api/role/${staff.role}`);
            if (!roleResponse.data || roleResponse.data.name !== "receptionist") {
                return res.status(400).json({ message: "Staff is not a receptionist." });
            }
        }

        // Validate expectedcheckin
        if (updates.expectedcheckin) {
            const expectedCheckinParsed = new Date(updates.expectedcheckin);
            if (
                expectedCheckinParsed < booking.bookingtime ||
                expectedCheckinParsed > moment(booking.bookingtime).add(20, "days").toDate()
            ) {
                return res.status(400).json({ message: "Expected check-in time is invalid." });
            }
        }

        // Validate checkout
        if (updates.checkout) {
            const checkoutParsed = new Date(updates.checkout);
            if (checkoutParsed < new Date(booking.expectedcheckin)) {
                return res.status(400).json({ message: "Check-out time must be after expected check-in time." });
            }
        }

        // Update staytime and bill if dates are changed
        if (updates.expectedcheckin || updates.checkout) {
            const checkinDate = new Date(updates.expectedcheckin || booking.expectedcheckin);
            const checkoutDate = new Date(updates.checkout || booking.checkout);
            const duration = moment.duration(moment(checkoutDate).diff(moment(checkinDate)));
            const stayDuration = `${Math.floor(duration.asDays())} days ${Math.round(duration.asHours() % 24)} hours`;

            updates.staytime = stayDuration;
            updates.bill = await calculateBill(updates.room || booking.room, stayDuration);
        }

        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
        if (!updatedBooking) return res.status(404).json({ message: "Booking not found!" });

        res.status(200).json({ message: "Booking updated successfully!", booking: updatedBooking });
    } catch (err) {
        console.error("Error updating booking:", err);
        res.status(500).json({ message: err.message });
    }
};



deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found!" });
        res.status(200).json({ message: "Booking deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createBooking,
    readallBooking,
    readBooking,
    updateBooking,
    deleteBooking,
};
