import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    dateOfBirth: {  // <-- Replace age with dateOfBirth
        type: Date,
        required: true
    },
    gender: {   // <-- Male / Female
        type: String,
        enum: ["Male", "Female"], // restrict values
        required: true
    },
    gradeLevel: {   // Primary / Secondary
        type: String,
        required: true,
        default: "Primary"
    },
    gradeNumber: {  // 1-13
        type: Number,
        required: true,
        default: 1
    },
    gradeType: {   // A/B
        type: String,
        required: true,
        default: "A"
    },
    parent: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ""
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    }
});

const Student = mongoose.model("students", studentSchema);
export default Student;
