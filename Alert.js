const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
    message: String,
    level: String,
    time: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Alert", alertSchema);