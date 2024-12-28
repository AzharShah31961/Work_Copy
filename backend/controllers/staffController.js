const Staff = require("../models/Staff");
const Joi = require("joi");
const axios = require("axios");
const bcrypt = require("bcrypt");

const validateStaff = (data) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(new RegExp("^[0-9]{11}$")).required(),
        cnic: Joi.string().pattern(new RegExp("^[0-9]{13}$")).required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().required(),
    });
    return schema.validate(data);
};

// Login Staff
const loginStaff = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate email and password
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
      }
  
      // Check if staff exists
      const staff = await Staff.findOne({ email });
      if (!staff) {
        return res.status(404).json({ message: "Invalid email or password!" });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, staff.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password!" });
      }
  
      // Save staff ID in session
      req.session.staffId = staff._id;
  
      res.status(200).json({
        message: "Login successful!",
        staffId: staff._id,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

// Create Staff
createStaff = async (req, res) => {
    try {
        const { error } = validateStaff(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
    
        const { username, email, phone, cnic, password, role } = req.body;

        // Check if the role's limit is reached
        const roleStaffCount = await Staff.countDocuments({ role });
        const roleData = await axios.get(`http://localhost:5000/api/role/${role}`);
        
        if (!roleData.data) {
            return res.status(400).json({ message: "Invalid role ID!" });
        }
        
        if (roleStaffCount >= roleData.data.limit) {
            return res.status(400).json({ message: "Limit Reached!! Can't Add More Staff for this role" });
        }

        // Check if a Staff already exists based on email, phone, or cnic
        const existingStaff = await Staff.findOne({
            $or: [{ email }, { phone }, { cnic }]
        });
    
        if (existingStaff) {
            return res.status(400).json({ message: "Staff already exists!" });
        }
    
        // Create new Staff if no existing Staff matches
        const newStaff = new Staff({ username, email, phone, cnic, password, role });
        await newStaff.save();
    
        res.status(201).json({ message: "Staff created successfully!" });
    } catch (err) {
        console.error("Error in createStaff:", err);
        res.status(500).json({ message: err.message });
    }
};



readallStaff = async (req, res) => {
    try {
        const staffs = await Staff.find();
        res.status(200).json(staffs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) return res.status(404).json({ message: "Staff not found!" });
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

updateStaff = async (req, res) => {
    try {
        // Allowed fields for partial update
        const allowedFields = ["username", "email", "phone", "cnic", "password", "role"];

        // Extract fields from the request body
        const fieldsToUpdate = req.body;

        // Validate if the provided fields are allowed
        const invalidFields = Object.keys(fieldsToUpdate).filter(
            (field) => !allowedFields.includes(field)
        );
        if (invalidFields.length > 0) {
            return res
                .status(400)
                .json({ message: `Invalid fields: ${invalidFields.join(", ")}` });
        }

        // Ensure email is always stored in lowercase
        if (fieldsToUpdate.email) {
            fieldsToUpdate.email = fieldsToUpdate.email.toLowerCase();
        }

        // Create a Joi schema for validating only the provided fields
        const schema = Joi.object({
            username: Joi.string(),
            email: Joi.string().email(),
            phone: Joi.string().pattern(new RegExp("^[0-9]{11}$")),
            cnic: Joi.string().pattern(new RegExp("^[0-9]{13}$")),
            password: Joi.string().min(8),
            role: Joi.string(),
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // If password is present, hash it before saving
        if (fieldsToUpdate.password) {
            const salt = await bcrypt.genSalt(10);
            fieldsToUpdate.password = await bcrypt.hash(fieldsToUpdate.password, salt);
        }

        // Fetch current staff data
        const currentStaff = await Staff.findById(req.params.id);
        if (!currentStaff) {
            return res.status(404).json({ message: "Staff not found!" });
        }

        // Check for unique email, phone, and CNIC
        const uniqueFields = ["email", "phone", "cnic"];
        for (const field of uniqueFields) {
            if (fieldsToUpdate[field] && fieldsToUpdate[field] !== currentStaff[field]) {
                const existingRecord = await Staff.findOne({ [field]: fieldsToUpdate[field] });
                if (existingRecord) {
                    return res.status(400).json({ message: `${field} already exists!` });
                }
            }
        }

        // Role limit check if role is being updated
        if (fieldsToUpdate.role && fieldsToUpdate.role !== currentStaff.role) {
            const roleDataResponse = await axios.get(`http://localhost:5000/api/role/${fieldsToUpdate.role}`);
            if (!roleDataResponse.data) {
                return res.status(400).json({ message: "Invalid role ID!" });
            }

            const roleData = roleDataResponse.data;

            const roleStaffCount = await Staff.countDocuments({
                role: fieldsToUpdate.role,
                _id: { $ne: req.params.id }, // Exclude current staff
            });

            if (roleStaffCount >= roleData.limit) {
                return res.status(400).json({
                    message: `Limit Reached! Cannot assign more staff to the "${roleData.name}" role.`,
                });
            }
        }

        // Perform the partial update
        const updatedStaff = await Staff.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // Ensures Mongoose validations are applied
        );

        if (!updatedStaff) {
            return res.status(404).json({ message: "Staff not found!" });
        }

        res.status(200).json({
            message: "Staff updated successfully!",
            staff: updatedStaff,
        });
    } catch (err) {
        console.error("Error updating Staff:", err);
        res.status(500).json({ message: "An error occurred while updating staff." });
    }
};



deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) return res.status(404).json({ message: "Staff not found!" });
        res.status(200).json({ message: "Staff deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createStaff,
    readallStaff,
    readStaff,
    updateStaff,
    deleteStaff,
    loginStaff
}
