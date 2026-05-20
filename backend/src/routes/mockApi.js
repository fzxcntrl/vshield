"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/aadhaar/verify', (req, res) => {
    const { aadhaarNumber } = req.body;
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        return res.status(400).json({ status: 'failed', message: 'Invalid Aadhaar format' });
    }
    // Mock logic: end with 0 means failed
    if (aadhaarNumber.endsWith('0')) {
        return res.json({ status: 'failed', nameMatch: false, dobMatch: false, message: 'Aadhaar verification failed' });
    }
    res.json({ status: 'verified', nameMatch: true, dobMatch: true, message: 'Aadhaar verified successfully' });
});
router.post('/pan/verify', (req, res) => {
    const { panNumber } = req.body;
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
        return res.status(400).json({ status: 'failed', message: 'Invalid PAN format' });
    }
    if (panNumber.endsWith('Z')) {
        return res.json({ status: 'failed', panStatus: 'inactive', message: 'PAN verification failed' });
    }
    res.json({ status: 'verified', panStatus: 'active', message: 'PAN verified successfully' });
});
exports.default = router;
//# sourceMappingURL=mockApi.js.map