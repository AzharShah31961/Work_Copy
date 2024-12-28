require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Joi = require("joi");
const cors = require("cors");
const session = require("express-session");

// Importing Models
const { Admin } = require("./models/Admin");
const { Staff } = require("./models/Staff");
const { Guest } = require("./models/Guest");
const { Role } = require("./models/Role");
const { Roomtype } = require("./models/Roomtype");
const { Laundry } = require("./models/Laundry");
const { Floor } = require("./models/Floor");
const { Room } = require("./models/Room");
const { Food } = require("./models/Food");
const { Booking } = require("./models/Booking");
const { FoodOrder } = require("./models/FoodOrder");
const { LaundryOrder } = require("./models/Laundry");
const { Feedback } = require("./models/Feedback");

// Importing Controllers
const adminController = require("./controllers/adminController");
const staffController = require("./controllers/staffController");
const guestController = require("./controllers/guestController");
const roleController = require("./controllers/roleController");
const laundryController = require("./controllers/laundryController");
const roomtypeController = require("./controllers/roomtypeController");
const floorController = require("./controllers/floorController");
const roomController = require("./controllers/roomController");
const foodController = require("./controllers/foodController");
const bookingController = require("./controllers/bookingController");
const foodorderController = require("./controllers/foodorderController");
const laundryorderController = require("./controllers/laundryorderController");
const feedbackController = require("./controllers/feedbackController");

const app = express();

app.use(
  session({
    secret: process.env.SESSIONCODE, // Use a more secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Set to `true` in production with HTTPS
  })
);

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "http://localhost:3000", // Allow this origin
  credentials: true // Allow cookies and credentials
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// **********************************************************ADMIN CRUD WITH LOGIN AND LOGOUT**********************************************************

// **1. CREATE - Add Admin**
app.post("/api/admin/create", adminController.createAdmin);

// **2. READ - Get All Admins**
app.get("/api/admin/", adminController.readallAdmin);

// **3. READ - Get Admin by ID**
app.get("/api/admin/:id", adminController.readAdmin);

// **4. UPDATE - Update Admin by ID**
app.put("/api/admin/update/:id", adminController.updateAdmin);

// **5. DELETE - Delete Admin by ID**
app.delete("/api/admin/delete/:id", adminController.deleteAdmin);

// **6. LOGIN - Admin Login**
app.post("/api/admin/login", adminController.loginAdmin);

// **7. LOGIN - Admin Logout**
app.post("/api/admin/logout", adminController.logoutAdmin);

// **********************************************************STAFF CRUD AND LOGIN**********************************************************

// **1. CREATE - Add Staff**
app.post("/api/staff/create", staffController.createStaff);

// **2. READ - Get All Staffs**
app.get("/api/staff/", staffController.readallStaff);

// **3. READ - Get Staff by ID**
app.get("/api/staff/:id", staffController.readStaff);

// **4. UPDATE - Update Staff by ID**
app.put("/api/staff/update/:id", staffController.updateStaff);

// **5. DELETE - Delete Staff by ID**
app.delete("/api/staff/delete/:id", staffController.deleteStaff);

// **6. LOGIN - Admin Login**
app.post("/api/staff/login", staffController.loginStaff);

// **********************************************************GUEST CRUD**********************************************************

// **1. CREATE - Add Guest**
app.post("/api/guest/create", guestController.createGuest);

// **2. READ - Get All Guests**
app.get("/api/guest/", guestController.readallGuest);

// **3. READ - Get Guest by ID**
app.get("/api/guest/:id", guestController.readGuest);

// **4. UPDATE - Update Guest by ID**
app.put("/api/guest/update/:id", guestController.updateGuest);

// **5. DELETE - Delete Guest by ID**
app.delete("/api/guest/delete/:id", guestController.deleteGuest);

// **********************************************************ROLE CRUD**********************************************************

// **1. CREATE - Add Role**
app.post("/api/role/create", roleController.createRole);

// **2. READ - Get All Roles**
app.get("/api/role/", roleController.readallRole);

// **3. READ - Get Role by ID**
app.get("/api/role/:id", roleController.readRole);

// **4. UPDATE - Update Role by ID**
app.put("/api/role/update/:id", roleController.updateRole);

// **5. DELETE - Delete Role by ID**
app.delete("/api/role/delete/:id", roleController.deleteRole);

// **********************************************************LAUNDRY CRUD**********************************************************

// **1. CREATE - Add laundry**
app.post("/api/laundry/create", laundryController.createLaundry);

// **2. READ - Get All Laundrys**
app.get("/api/laundry/", laundryController.readallLaundry);

// **3. READ - Get Laundry by ID**
app.get("/api/laundry/:id", laundryController.readLaundry);

// **4. UPDATE - Update Laundry by ID**
app.put("/api/laundry/update/:id", laundryController.updateLaundry);

// **5. DELETE - Delete Laundry by ID**
app.delete("/api/laundry/delete/:id", laundryController.deleteLaundry);

// **********************************************************ROOM TYPE CRUD**********************************************************

// **1. CREATE - Add Roomtype**
app.post("/api/roomtype/create", roomtypeController.createRoomtype);

// **2. READ - Get All Roomtypes**
app.get("/api/roomtype/", roomtypeController.readallRoomtype);

// **3. READ - Get Roomtype by ID**
app.get("/api/roomtype/:id", roomtypeController.readRoomtype);

// **4. UPDATE - Update Roomtype by ID**
app.put("/api/roomtype/update/:id", roomtypeController.updateRoomtype);

// **5. DELETE - Delete Roomtype by ID**
app.delete("/api/roomtype/delete/:id", roomtypeController.deleteRoomtype);

// **********************************************************FLOOR CRUD**********************************************************

// **1. CREATE - Add Floor**
app.post("/api/floor/create", floorController.createFloor);

// **2. READ - Get All Floors**
app.get("/api/floor/", floorController.readallFloor);

// **3. READ - Get Floor by ID**
app.get("/api/floor/:id", floorController.readFloor);

// **4. UPDATE - Update Floor by ID**
app.put("/api/floor/update/:id", floorController.updateFloor);

// **5. DELETE - Delete Floor by ID**
app.delete("/api/floor/delete/:id", floorController.deleteFloor);

// **********************************************************ROOM CRUD**********************************************************

// **1. CREATE - Add Room**
app.post("/api/room/create", roomController.createRoom);

// **2. READ - Get All Rooms**
app.get("/api/room/", roomController.readallRoom);

// **3. READ - Get Room by ID**
app.get("/api/room/:id", roomController.readRoom);

// **4. UPDATE - Update Room by ID**
app.put("/api/room/update/:id", roomController.updateRoom);

// **5. DELETE - Delete Room by ID**
app.delete("/api/room/delete/:id", roomController.deleteRoom);

// **********************************************************FOOD CRUD**********************************************************

// **1. CREATE - Add Food**
app.post("/api/food/create", foodController.createFood);

// **2. READ - Get All Foods**
app.get("/api/food/", foodController.readallFood);

// **3. READ - Get Food by ID**
app.get("/api/food/:id", foodController.readFood);

// **4. UPDATE - Update Food by ID**
app.put("/api/food/update/:id", foodController.updateFood);

// **5. DELETE - Delete Food by ID**
app.delete("/api/food/delete/:id", foodController.deleteFood);

// **********************************************************BOOKING CRUD**********************************************************

// **1. CREATE - Add Booking**
app.post("/api/booking/create", bookingController.createBooking);

// **2. READ - Get All Bookings**
app.get("/api/booking/", bookingController.readallBooking);

// **3. READ - Get Booking by ID**
app.get("/api/booking/:id", bookingController.readBooking);

// **4. UPDATE - Update Booking by ID**
app.put("/api/booking/update/:id", bookingController.updateBooking);

// **5. DELETE - Delete Booking by ID**
app.delete("/api/booking/delete/:id", bookingController.deleteBooking);

// **********************************************************FOOD ORDER CRUD**********************************************************

// **1. CREATE - Add Foodorder**
app.post("/api/foodorder/create", foodorderController.createFoodorder);

// **2. READ - Get All Foodorders**
app.get("/api/foodorder/", foodorderController.readallFoodorder);

// **3. READ - Get Foodorder by ID**
app.get("/api/foodorder/:id", foodorderController.readFoodorder);

// **4. UPDATE - Update Foodorder by ID**
app.put("/api/foodorder/update/:id", foodorderController.updateFoodorder);

// **5. DELETE - Delete Foodorder by ID**
app.delete("/api/foodorder/delete/:id", foodorderController.deleteFoodorder);

// **********************************************************Laundry Service CRUD**********************************************************

// **1. CREATE - Add Laundryorder**
app.post("/api/laundryorder/create", laundryorderController.createLaundryorder);

// **2. READ - Get All Laundryorders**
app.get("/api/laundryorder/", laundryorderController.readallLaundryorder);

// **3. READ - Get Laundryorder by ID**
app.get("/api/laundryorder/:id", laundryorderController.readLaundryorder);

// **4. UPDATE - Update Laundryorder by ID**
app.put(
  "/api/laundryorder/update/:id",
  laundryorderController.updateLaundryorder
);

// **5. DELETE - Delete Laundryorder by ID**
app.delete(
  "/api/laundryorder/delete/:id",
  laundryorderController.deleteLaundryorder
);

// **********************************************************FEEDBACK CRUD**********************************************************

// **1. CREATE - Add Feedback**
app.post("/api/feedback/create", feedbackController.createFeedback);

// **2. READ - Get All Feedbacks**
app.get("/api/feedback/", feedbackController.readallFeedback);

// **3. READ - Get Feedback by ID**
app.get("/api/feedback/:id", feedbackController.readFeedback);

// **4. UPDATE - Update Feedback by ID**
app.put("/api/feedback/update/:id", feedbackController.updateFeedback);

// **5. DELETE - Delete Feedback by ID**
app.delete("/api/feedback/delete/:id", feedbackController.deleteFeedback);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
