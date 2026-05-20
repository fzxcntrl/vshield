"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationReportPDF = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const generateVerificationReportPDF = async (candidate) => {
    const browser = await puppeteer_1.default.launch({ headless: true });
    const page = await browser.newPage();
    const aadhaarLog = candidate.verificationLogs.find((l) => l.verificationType === 'AADHAAR');
    const panLog = candidate.verificationLogs.find((l) => l.verificationType === 'PAN');
    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #2563eb; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { font-weight: bold; }
          .status { font-weight: bold; padding: 4px 8px; border-radius: 4px; }
          .status-verified { background-color: #dcfce7; color: #166534; }
          .status-failed { background-color: #fee2e2; color: #991b1b; }
          .status-pending { background-color: #fef9c3; color: #854d0e; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">BACKGROUND VERIFICATION REPORT</div>
        </div>
        
        <div class="section">
          <div class="section-title">Candidate Information</div>
          <div class="row"><span class="label">Name:</span> <span>${candidate.fullName}</span></div>
          <div class="row"><span class="label">Email:</span> <span>${candidate.email}</span></div>
          <div class="row"><span class="label">Phone:</span> <span>${candidate.phone}</span></div>
          <div class="row"><span class="label">DOB:</span> <span>${new Date(candidate.dob).toLocaleDateString()}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Verification Checks</div>
          <div class="row">
            <span class="label">Aadhaar Verification:</span>
            <span class="status status-${aadhaarLog?.verificationStatus === 'verified' ? 'verified' : 'failed'}">
              ${(aadhaarLog?.verificationStatus || 'PENDING').toUpperCase()}
            </span>
          </div>
          <div class="row">
            <span class="label">PAN Verification:</span>
            <span class="status status-${panLog?.verificationStatus === 'verified' ? 'verified' : 'failed'}">
              ${(panLog?.verificationStatus || 'PENDING').toUpperCase()}
            </span>
          </div>
        </div>

        <div class="section" style="margin-top: 40px; border-top: 2px solid #2563eb; padding-top: 20px;">
          <div class="row" style="font-size: 18px;">
            <span class="label">Overall Status:</span>
            <span class="status status-${candidate.status.toLowerCase()}">
              ${candidate.status.toUpperCase()}
            </span>
          </div>
          <div class="row" style="margin-top: 20px; font-size: 14px; color: #666;">
            <span class="label">Generated On:</span> 
            <span>${new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </body>
    </html>
  `;
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer;
};
exports.generateVerificationReportPDF = generateVerificationReportPDF;
