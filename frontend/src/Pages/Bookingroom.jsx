import React, { useState, useEffect } from "react";
import axios from "axios";

const Bookingroom = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedGuest, setSelectedGuest] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [expectedCheckin, setExpectedCheckin] = useState("");
  const [expectedCheckout, setExpectedCheckout] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState("");

  // Fetch rooms, guests, staff, and bookings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomData = await axios.get("http://localhost:5000/api/room");
        const guestData = await axios.get("http://localhost:5000/api/guest");
        const staffData = await axios.get("http://localhost:5000/api/staff");
        const bookingData = await axios.get("http://localhost:5000/api/booking");

        setRooms(roomData.data);
        setGuests(guestData.data);
        setStaff(staffData.data);
        setBookings(bookingData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle form submit for create or update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      room: selectedRoom,
      bookfor: selectedGuest,
      bookedby: selectedStaff,
      expectedcheckin: expectedCheckin,
      expectedcheckout: expectedCheckout,
    };

    try {
      if (isUpdate) {
        // Update booking
        const response = await axios.put(`http://localhost:5000/api/booking/${currentBookingId}`, bookingData);
        alert("Booking updated successfully!");
      } else {
        // Create new booking
        const response = await axios.post("http://localhost:5000/api/booking", bookingData);
        alert("Booking created successfully!");
      }

      // Close modal and refresh the bookings list
      setIsModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error("Error creating or updating booking:", error);
    }
  };

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      const bookingData = await axios.get("http://localhost:5000/api/booking");
      setBookings(bookingData.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // Open modal for adding a new booking
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsUpdate(false);
    setSelectedRoom("");
    setSelectedGuest("");
    setSelectedStaff("");
    setExpectedCheckin("");
    setExpectedCheckout("");
  };

  // Open modal for updating an existing booking
  const openUpdateModal = (booking) => {
    setIsModalOpen(true);
    setIsUpdate(true);
    setCurrentBookingId(booking._id);
    setSelectedRoom(booking.room);
    setSelectedGuest(booking.bookfor);
    setSelectedStaff(booking.bookedby);
    setExpectedCheckin(booking.expectedcheckin);
    setExpectedCheckout(booking.expectedcheckout);
  };

  return (
    <div className="container mt-5">
      {/* Add Booking Button */}
      <button className="btn btn-primary mb-3" onClick={openAddModal}>Add Booking</button>

      {/* Booking Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Room</th>
            <th>Guest</th>
            <th>Booked By</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const room = rooms.find(r => r._id === booking.room);
            const guest = guests.find(g => g._id === booking.bookfor);
            const staffMember = staff.find(s => s._id === booking.bookedby);

            return (
              <tr key={booking._id}>
                <td>{room ? room.name : "N/A"}</td>
                <td>{guest ? guest.name : "N/A"}</td>
                <td>{staffMember ? staffMember.name : "N/A"}</td>
                <td>{booking.expectedcheckin}</td>
                <td>{booking.expectedcheckout}</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => openUpdateModal(booking)}>Update</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal for Create/Update Booking */}
      {isModalOpen && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="bookingModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="bookingModalLabel">{isUpdate ? "Update Booking" : "Create Booking"}</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsModalOpen(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Room:</label>
                    <select
                      className="form-control"
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                      <option value="">Select Room</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.name} - {room.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Guest:</label>
                    <select
                      className="form-control"
                      value={selectedGuest}
                      onChange={(e) => setSelectedGuest(e.target.value)}
                    >
                      <option value="">Select Guest</option>
                      {guests.map((guest) => (
                        <option key={guest._id} value={guest._id}>
                          {guest.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Booked By (Staff):</label>
                    <select
                      className="form-control"
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                      <option value="">Select Staff</option>
                      {staff.map((staffMember) => (
                        <option key={staffMember._id} value={staffMember._id}>
                          {staffMember.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Expected Check-in:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={expectedCheckin}
                      onChange={(e) => setExpectedCheckin(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Expected Check-out:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={expectedCheckout}
                      onChange={(e) => setExpectedCheckout(e.target.value)}
                    />
                  </div>

                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">{isUpdate ? "Update Booking" : "Create Booking"}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookingroom;
