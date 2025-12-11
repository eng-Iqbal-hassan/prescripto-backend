import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: String, 
        required: true
    },
    docId: {
        type: String, 
        required: true
    },
    slotDate: {
        type: String, 
        required: true
    },
    slotTime: {
        type: String, 
        required: true
    },
    userDate: {
        type: Date,
        default: Date.now(), 
        required: true
    },
    docDate: {
        type: Date, 
        default: Date.now(),
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    cancelled: {
        type: Boolean,
        default: false,
    },
    payment: {
        type: Boolean,
        default: false,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    }
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

export default appointmentModel;

// In frontend whenever we have to book the appointment , the data like docId, slotDate and slotTime will be sent from frontend, userId will come through middleware and rest of the data will be generated from backend.