// Here, we will write multiple functions for multiple APIs
import doctorModel from "../models/doctorModel.js";


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

export {changeAvailability};