"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/aadhaar/verify', (req, res) => {
    const { aadhaarNumber } = req.body;
    if (aadhaarNumber && /^\d{12}$/.test(aadhaarNumber)) {
        return res.json({
            status: "verified",
            nameMatch: true,
            dobMatch: true,
            message: "Aadhaar verified successfully"
        });
    }
    return res.json({
        status: "failed",
        message: "Aadhaar verification failed"
    });
});
router.post('/pan/verify', (req, res) => {
    const { panNumber } = req.body;
    if (panNumber && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
        return res.json({
            status: "verified",
            panStatus: "active",
            message: "PAN verified successfully"
        });
    }
    return res.json({
        status: "failed",
        message: "PAN verification failed"
    });
});
exports.default = router;
