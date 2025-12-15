// Here, we will write multiple functions for multiple APIs
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// We have added the avaialabilty functionality in doctor controller because we need this functionality in both admin and doctor portal 

const changeAvailability = async (req,res) => {
    try {
        const {docId} = req.body;
        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true, message: "Availability changed"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

const doctorList = async (req,res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password','-email'])
        // Here in doctors variable we will get all doctors with their properties password and email excluded
        res.json({success: true, doctors});
    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// API for doctor login

const loginDoctor = async(req,res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({email})

        if (!doctor) {
            return res.json({success: false, message: "Invalid Credentials"})
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if(isMatch) {
            const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)
            // We have to create the token, we have to provide the date of the doctor while creating its token that's why we have added the id in it, and this is the point of entry for other modules where the data of specific doctor is being seen on the basis of token, because each doctor has its own id and the data remains distinguish
            res.json({success: true, token})
        } else {
            return res.json({success: false, message: "Invalid Credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}



export {changeAvailability,doctorList, loginDoctor};