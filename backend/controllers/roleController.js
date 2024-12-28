const Role = require("../models/Role");
const Staff = require("../models/Staff");
const Joi = require("joi");

const validateRole = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        status: Joi.string().valid("active", "inactive").required(),
        limit: Joi.number().required(),
    });
    return schema.validate(data);
};

// Create Role
createRole = async (req, res) => {
    try {
        const { error } = validateRole(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
    
        const { name, status, limit } = req.body;
    
        // Check if a Role already exists based on name, phone, or cnic
        const existingRole = await Role.findOne({
            $or: [{ name }]
        });
    
        if (existingRole) {
            return res.status(400).json({ message: "Role already exists!" });
        }
    
        // Create new Role if no existing Role matches
        const newRole = new Role({ name, status, limit });
        await newRole.save();
    
        res.status(201).json({ message: "Role created successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


readallRole = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

readRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ message: "Role not found!" });
        res.status(200).json(role);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateRole = async (req, res) => {
    try {
        // Allowed fields for partial update
        const allowedFields = ["name", "status", "limit"];

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

        // Create a Joi schema for validating only the provided fields
        const schema = Joi.object({
            name: Joi.string().min(3),
            status: Joi.string().valid("active", "inactive"),
            limit: Joi.number().min(1), // Ensure limit is a positive number
        });

        // Validate the fields present in the request body
        const { error } = schema.validate(fieldsToUpdate);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Check if limit is being reduced
        if (fieldsToUpdate.limit !== undefined) {
            const role = await Role.findById(req.params.id);
            if (!role) return res.status(404).json({ message: "Role not found!" });

            // Count the number of staff members assigned to this role
            const staffCount = await Staff.countDocuments({ role: req.params.id });

            if (fieldsToUpdate.limit < staffCount) {
                return res.status(400).json({
                    message: `Cannot reduce the limit below the number of assigned staff members (${staffCount}).`,
                });
            }
        }

        // Perform the partial update
        const updatedRole = await Role.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true } // Ensures Mongoose validations are applied
        );

        if (!updatedRole) return res.status(404).json({ message: "Role not found!" });

        res.status(200).json({
            message: "Role updated successfully!",
            role: updatedRole,
        });
    } catch (err) {
        console.error("Error updating Role:", err);
        res.status(500).json({ message: err.message });
    }
};



deleteRole = async (req, res) => {
    try {
        // Check if the role is being used in the Staff collection
        const isRoleInUse = await Staff.findOne({ role: req.params.id });

        if (isRoleInUse) {
            return res.status(400).json({ message: "Role is assigned to staff and cannot be deleted!" });
        }

        // Proceed to delete the role if it's not in use
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).json({ message: "Role not found!" });
        
        res.status(200).json({ message: "Role deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createRole,
    readallRole,
    readRole,
    updateRole,
    deleteRole
}
