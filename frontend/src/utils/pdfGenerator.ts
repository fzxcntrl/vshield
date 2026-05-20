import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Candidate, VerificationLog } from '../types/candidate';

export const generatePDFReport = (candidate: Candidate, userName: string = 'Admin', returnBlob: boolean = false) => {
  const doc = new jsPDF();
  
  const textDark = '#111827';
  const textGray = '#4b5563';

  // Background Watermark "CONFIDENTIAL"
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(60);
  doc.text('CONFIDENTIAL', 30, 150, { angle: 45 });

  // Header Bar (Navy Blue)
  doc.setFillColor(30, 58, 138); // bg-blue-900 / primary
  doc.rect(0, 0, 210, 30, 'F');
  
  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('VShield', 15, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('BACKGROUND VERIFICATION REPORT', 115, 19);

  // Content starts
  let y = 50;

  // Personal Details
  doc.setTextColor(textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Candidate Details', 15, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  
  const details = [
    { label: 'Full Name:', value: candidate.fullName },
    { label: 'Email:', value: candidate.email },
    { label: 'Phone:', value: candidate.phone },
    { label: 'Date of Birth:', value: format(new Date(candidate.dob), 'dd MMM yyyy') },
    { label: 'Address:', value: candidate.address },
  ];

  details.forEach(item => {
    doc.setTextColor(textGray);
    doc.text(item.label, 15, y);
    doc.setTextColor(textDark);
    doc.text(item.value, 50, y);
    y += 8;
  });

  y += 10;

  // Verification Details
  doc.setTextColor(textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Verification Checks', 15, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  // Check verification logs
  const hasAadhaarLog = candidate.verificationLogs?.find((log: VerificationLog) => log.verificationType === 'AADHAAR');
  const hasPanLog = candidate.verificationLogs?.find((log: VerificationLog) => log.verificationType === 'PAN');
  
  const aadhaarStatus = hasAadhaarLog?.verificationStatus === 'verified' ? 'VERIFIED' : 'FAILED';
  const panStatus = hasPanLog?.verificationStatus === 'verified' ? 'VERIFIED' : 'FAILED';

  const checks = [
    { 
      label: 'Aadhaar Verification:', 
      status: aadhaarStatus,
      details: hasAadhaarLog ? `Verified on ${format(new Date(hasAadhaarLog.verifiedAt), 'dd MMM yyyy')}` : 'Not verified'
    },
    { 
      label: 'PAN Verification:', 
      status: panStatus,
      details: hasPanLog ? `Verified on ${format(new Date(hasPanLog.verifiedAt), 'dd MMM yyyy')}` : 'Not verified'
    },
  ];

  checks.forEach(check => {
    doc.setTextColor(textGray);
    doc.text(check.label, 15, y);
    
    if (check.status === 'VERIFIED') {
      doc.setTextColor(22, 163, 74); // green-600
      doc.setFont('helvetica', 'bold');
      doc.text('✓ VERIFIED', 65, y);
    } else {
      doc.setTextColor(220, 38, 38); // red-600
      doc.setFont('helvetica', 'bold');
      doc.text('✗ FAILED', 65, y);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textGray);
    doc.text(check.details, 65, y + 4);
    doc.setFontSize(12);
    y += 12;
  });

  y += 15;

  // Overall Status
  doc.setTextColor(textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Overall Status:', 15, y);
  
  if (candidate.status === 'VERIFIED') {
    doc.setTextColor(22, 163, 74);
    doc.text('✓ VERIFIED', 55, y);
  } else if (candidate.status === 'PARTIAL') {
    doc.setTextColor(234, 88, 12);
    doc.text('⚠ PARTIAL', 55, y);
  } else {
    doc.setTextColor(220, 38, 38);
    doc.text('✗ FAILED', 55, y);
  }
  
  y += 25;

  // Footer info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray);
  
  doc.line(15, y - 5, 195, y - 5); // Divider line
  
  doc.text(`Generated On: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 15, y + 2);
  doc.text(`Verified By: ${userName}`, 15, y + 8);
  doc.text(`Report ID: ${candidate.id.substring(0, 8).toUpperCase()}`, 15, y + 14);

  // Return blob for preview or download
  if (returnBlob) {
    return doc.output('blob');
  } else {
    const filename = `BGV_Report_${candidate.fullName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(filename);
  }
};
