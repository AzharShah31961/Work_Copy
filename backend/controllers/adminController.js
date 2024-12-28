const Admin = require("../models/Admin");
const Joi = require("joi");
const bcrypt = require("bcrypt");

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin is already logged in
    if (req.session.adminId) {
      console.log("Admin is already logged in!");
      return res.status(400).json({ message: "Admin is already logged in!" });
    }

    // Validate email and password
    if (!email || !password) {
      console.log("Email and password are required!");
      return res.status(400).json({ message: "Email and password are required!" });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("Invalid email or password!");
      return res.status(404).json({ message: "Invalid email or password!" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log("Invalid email or password!");
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    // Save admin ID in session
    req.session.adminId = admin._id; // Save admin ID in the session
    await req.session.save(); // Ensure session is saved

    res.status(200).json({
      message: "Login successful!",
      adminId: admin._id,
    });
    console.log(req.session); // Log the session object
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


const logoutAdmin = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout." });
    }
    res.status(200).json({ message: "Logged out successfully." });
  });
};



const validateAdmin = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .pattern(new RegExp("^[a-zA-Z]+$")) // Only alphabets, no spaces
      .min(3)
      .required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(new RegExp("^[0-9]{11}$")) // Exactly 11 digits
      .required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(data);
};

// Create Admin
const createAdmin = async (req, res) => {
  try {
    const { error } = validateAdmin(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { username, email, phone, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Email is already in use!" });

    const admin = new Admin({ username, email, phone, password });
    await admin.save();
    res.status(201).json({ message: "Admin created successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

readallAdmin = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

readAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found!" });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Admin
const updateAdmin = async (req, res) => {
  try {
    const allowedFields = ["username", "email", "phone", "password"];
    const fieldsToUpdate = req.body;

    // Validate updated fields
    for (const key in fieldsToUpdate) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({ message: `Invalid field: ${key}` });
      }
      const validationData = { [key]: fieldsToUpdate[key] };
      const schema = Joi.object({
        username: Joi.string().pattern(new RegExp("^[a-zA-Z]+$")).min(3),
        email: Joi.string().email(),
        phone: Joi.string().pattern(new RegExp("^[0-9]{11}$")),
        password: Joi.string().min(6)
      }).fork([key], (schemaField) => schemaField.required());
      const { error } = schema.validate(validationData);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    // Check for unique email
    if (fieldsToUpdate.email) {
      const existingAdmin = await Admin.findOne({
        email: fieldsToUpdate.email
      });
      if (existingAdmin && existingAdmin._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Email is already in use!" });
      }
    }

    // Update the admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin)
      return res.status(404).json({ message: "Admin not found!" });

    res
      .status(200)
      .json({ message: "Admin updated successfully!", data: updatedAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found!" });
    res.status(200).json({ message: "Admin deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAdmin,
  readallAdmin,
  readAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  logoutAdmin
};
