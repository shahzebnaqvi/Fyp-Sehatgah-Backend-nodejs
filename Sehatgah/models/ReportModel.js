const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var ReportSchema = new mongoose.Schema({
    REPORTS: [
        {
            patient : String,
            email : String,
            disease: String,
        }
    ],
    DoctorName : String,
    patient_Id: String,

    Doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },


},
    {
        timestamps: true,
    });

//Export the model
module.exports = mongoose.model('Report', ReportSchema);