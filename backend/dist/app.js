"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const candidates_1 = __importDefault(require("./routes/candidates"));
const mockApi_1 = __importDefault(require("./routes/mockApi"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/candidates', candidates_1.default);
app.use('/mock-api', mockApi_1.default); // Using mock routes directly here
exports.default = app;
