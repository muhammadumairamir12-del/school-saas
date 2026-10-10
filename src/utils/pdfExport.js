import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to draw Header Banner on PDF
const addHeader = (doc, title) => {
  doc.setFillColor(30, 91, 140); // #1E5B8C Sky Education Blue
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SKY EDUCATION', 14, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('School Management System - Official Report', 14, 22);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 196, 18, { align: 'right' });
  
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 34);
};

// 1. Export Student Profile PDF
export const exportStudentProfilePDF = (student, feeHistory = [], attendanceHistory = []) => {
  const doc = new jsPDF();
  addHeader(doc, 'Student Profile');

  // Student Bio Section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 38, 3, 3, 'F');
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(student.name || 'N/A', 20, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Class/Section: ${student.classSection || 'N/A'}`, 20, 56);
  doc.text(`Guardian/Father: ${student.fatherName || 'N/A'}`, 20, 62);
  doc.text(`Contact: ${student.contact || 'N/A'}`, 20, 68);

  doc.text(`Admission Date: ${student.admissionDate || 'N/A'}`, 110, 56);
  doc.text(`Monthly Fee: RS. ${student.monthlyFee || 0}`, 110, 62);
  doc.text(`Status: ${student.status || 'Active'}`, 110, 68);

  // Fee History Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recent Fee Payments', 14, 84);

  const feeData = feeHistory.map(f => [
    f.receiptNo || f.id,
    f.month,
    `RS. ${f.amount}`,
    f.paymentDate,
    'Paid'
  ]);

  autoTable(doc, {
    startY: 88,
    head: [['Receipt #', 'Month', 'Amount', 'Payment Date', 'Status']],
    body: feeData.length ? feeData : [['-', 'No payment records found', '-', '-', '-']],
    headStyles: { fillColor: [212, 160, 23] }, // Amber/Gold accent
    theme: 'grid',
    styles: { fontSize: 9 }
  });

  // Attendance History Table
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 140;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance History', 14, finalY);

  const attData = attendanceHistory.map(a => [
    a.date,
    a.status,
    a.classSection || student.classSection
  ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Date', 'Attendance Status', 'Class']],
    body: attData.length ? attData : [['-', 'No attendance records found', '-']],
    headStyles: { fillColor: [59, 130, 246] }, // Blue accent
    theme: 'grid',
    styles: { fontSize: 9 }
  });

  doc.save(`Student_Record_${student.name.replace(/\s+/g, '_')}.pdf`);
};

// 2. Export Fee Collection Receipt PDF
export const exportFeeReceiptPDF = (feeRecord) => {
  const doc = new jsPDF('p', 'mm', [148, 210]); // A5 size receipt
  
  // Header Box
  doc.setFillColor(233, 30, 140); // Soft Pink #E91E8C
  doc.rect(0, 0, 148, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SKY EDUCATION', 10, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('FEE PAYMENT RECEIPT', 138, 12, { align: 'right' });

  // Receipt Meta
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Receipt No: ${feeRecord.receiptNo || feeRecord.id}`, 10, 32);
  doc.text(`Date: ${feeRecord.paymentDate || new Date().toISOString().split('T')[0]}`, 138, 32, { align: 'right' });

  // Student Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, 38, 128, 26, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student Name: ${feeRecord.studentName}`, 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(`Class/Section: ${feeRecord.classSection || 'N/A'}`, 14, 53);

  // Table
  autoTable(doc, {
    startY: 70,
    head: [['Description', 'For Month', 'Amount Paid']],
    body: [
      ['Monthly Tuition Fee', feeRecord.month, `RS. ${feeRecord.amount}`]
    ],
    headStyles: { fillColor: [233, 30, 140] },
    theme: 'grid'
  });

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 120;
  
  doc.setFontSize(9);
  doc.text('Authorized Signature: __________________', 138, finalY, { align: 'right' });
  doc.text('Thank you for your payment!', 10, finalY);

  doc.save(`Fee_Receipt_${feeRecord.receiptNo || feeRecord.id}.pdf`);
};

// 3. Export Monthly Fee Report PDF
export const exportFeeReportPDF = (month, feeRecords = [], totalCollected = 0, totalPending = 0) => {
  const doc = new jsPDF();
  addHeader(doc, `Fee Report - ${month}`);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Summary for Month: ${month}`, 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Collected: RS. ${totalCollected.toLocaleString()}   |   Total Pending: RS. ${totalPending.toLocaleString()}`, 14, 48);

  const tableData = feeRecords.map(f => [
    f.receiptNo || f.id,
    f.studentName,
    f.classSection,
    f.month,
    `RS. ${f.amount}`,
    f.paymentDate
  ]);

  autoTable(doc, {
    startY: 54,
    head: [['Receipt #', 'Student Name', 'Class', 'Month', 'Amount', 'Date Paid']],
    body: tableData.length ? tableData : [['-', 'No transactions recorded for this month', '-', '-', '-', '-']],
    headStyles: { fillColor: [233, 30, 140] },
    theme: 'striped'
  });

  doc.save(`Fee_Report_${month}.pdf`);
};

// 4. Export Attendance Report PDF
export const exportAttendanceReportPDF = (classSection, month, records = []) => {
  const doc = new jsPDF();
  addHeader(doc, 'Attendance Report');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Class: ${classSection} | Period: ${month}`, 14, 42);

  const tableData = records.map(r => [
    r.studentName,
    r.presentDays,
    r.totalDays,
    `${r.percentage}%`
  ]);

  autoTable(doc, {
    startY: 48,
    head: [['Student Name', 'Present Days', 'Total Days Recorded', 'Attendance %']],
    body: tableData.length ? tableData : [['No records found', '-', '-', '-']],
    headStyles: { fillColor: [59, 130, 246] },
    theme: 'grid'
  });

  doc.save(`Attendance_Report_${classSection}_${month}.pdf`);
};

// 5. Export Expense Report PDF
export const exportExpenseReportPDF = (month, expenses = [], totalExpense = 0) => {
  const doc = new jsPDF();
  addHeader(doc, `Expense Summary - ${month}`);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Monthly Expenses: RS. ${totalExpense.toLocaleString()}`, 14, 42);

  const tableData = expenses.map(e => [
    e.date,
    e.category,
    e.description || '-',
    `RS. ${e.amount}`
  ]);

  autoTable(doc, {
    startY: 48,
    head: [['Date', 'Category', 'Description', 'Amount']],
    body: tableData.length ? tableData : [['No expense records found', '-', '-', '-']],
    headStyles: { fillColor: [16, 185, 129] }, // Teal/Green accent
    theme: 'striped'
  });

  doc.save(`Expense_Report_${month}.pdf`);
};

// 6. Export Fee Voucher PDF (Challan)
export const exportFeeVoucherPDF = (student, dueDate, amount, month) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const drawVoucher = (yOffset, title) => {
    // Header
    doc.setFillColor(30, 91, 140);
    doc.rect(14, yOffset, 182, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SKY EDUCATION', 20, yOffset + 14);
    
    doc.setFontSize(12);
    doc.text(`FEE VOUCHER - ${title}`, 190, yOffset + 14, { align: 'right' });
    
    // Voucher Meta
    const voucherNo = 'VOU-' + Math.floor(100000 + Math.random() * 900000);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Voucher No: ${voucherNo}`, 14, yOffset + 30);
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 196, yOffset + 30, { align: 'right' });
    doc.text(`Due Date: ${dueDate}`, 196, yOffset + 36, { align: 'right' });

    // Student Info
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, yOffset + 42, 182, 26, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(`Student Name: ${student.name || 'N/A'}`, 18, yOffset + 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class/Section: ${student.classSection || 'N/A'}`, 18, yOffset + 58);
    doc.text(`Student ID: ${student.id || 'N/A'}`, 120, yOffset + 58);

    // Table
    autoTable(doc, {
      startY: yOffset + 74,
      margin: { left: 14, right: 14 },
      head: [['Description', 'Month', 'Amount']],
      body: [
        ['Monthly Tuition Fee', month, `RS. ${amount}`]
      ],
      headStyles: { fillColor: [30, 91, 140] },
      theme: 'grid'
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : yOffset + 100;
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Payable: RS. ${amount}`, 196, finalY + 10, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signature: __________________', 14, finalY + 25);
    doc.text('Bank Stamp / Cashier: __________________', 196, finalY + 25, { align: 'right' });
  };

  // Draw Top Copy (Bank/School)
  drawVoucher(10, 'SCHOOL COPY');
  
  // Draw separator
  doc.setLineDashPattern([3, 3], 0);
  doc.line(14, 148, 196, 148);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Tear Here', 105, 147, { align: 'center' });

  // Draw Bottom Copy (Student)
  drawVoucher(155, 'STUDENT COPY');

  doc.save(`Fee_Voucher_${student.name?.replace(/\s+/g, '_') || 'Student'}_${month}.pdf`);
};

// 7. Export Daily Fee Report PDF
export const exportDailyFeeReportPDF = (date, feeRecords = [], totalCollected = 0) => {
  const doc = new jsPDF();
  addHeader(doc, `Daily Collection - ${date}`);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Collection Date: ${date}`, 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Transactions: ${feeRecords.length}   |   Total Collected: RS. ${totalCollected.toLocaleString()}`, 14, 48);

  let runningTotal = 0;
  const tableData = feeRecords.map(f => {
    runningTotal += Number(f.amount || 0);
    return [
      f.receiptNo || f.id,
      f.studentName,
      f.classSection,
      f.month,
      `RS. ${f.amount}`,
      `RS. ${runningTotal}`
    ];
  });

  autoTable(doc, {
    startY: 54,
    head: [['Receipt #', 'Student Name', 'Class', 'Month', 'Amount', 'Running Total']],
    body: tableData.length ? tableData : [['-', 'No transactions recorded for this day', '-', '-', '-', '-']],
    headStyles: { fillColor: [30, 91, 140] },
    theme: 'striped'
  });

  doc.save(`Daily_Collection_${date}.pdf`);
};

// 8. Export Diary PDF
export const exportDiaryPDF = (classSectionOrEntries, dateRangeOrClass, entriesList = []) => {
  let classSection = 'All Classes';
  let dateRange = 'All Dates';
  let entries = [];

  if (Array.isArray(classSectionOrEntries)) {
    entries = classSectionOrEntries;
    classSection = typeof dateRangeOrClass === 'string' ? dateRangeOrClass : 'All Classes';
    dateRange = typeof entriesList === 'string' ? entriesList : 'All Dates';
  } else {
    classSection = classSectionOrEntries || 'All Classes';
    dateRange = dateRangeOrClass || 'All Dates';
    entries = Array.isArray(entriesList) ? entriesList : [];
  }

  const doc = new jsPDF();
  addHeader(doc, 'Class Diary Report');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Class: ${classSection}`, 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date Range: ${dateRange}`, 14, 48);

  const tableData = entries.map(e => [
    e.date,
    e.topicTaught || '-',
    e.homeworkAssigned || '-',
    e.notes || '-'
  ]);

  autoTable(doc, {
    startY: 54,
    head: [['Date', 'Topic Taught', 'Homework Assigned', 'Notes']],
    body: tableData.length ? tableData : [['No entries found', '-', '-', '-']],
    headStyles: { fillColor: [59, 130, 246] }, // Blue accent
    theme: 'grid',
    styles: { overflow: 'linebreak', cellWidth: 'wrap' },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 55 },
      3: { cellWidth: 50 }
    }
  });

  doc.save(`Diary_Report_${classSection.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};
