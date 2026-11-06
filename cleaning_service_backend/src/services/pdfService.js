// src/services/pdfService.js
const PDFDocument = require('pdfkit');

/**
 * Generate a professional Job Completion Report PDF with checklist answers and proof photos
 */
exports.generateJobReportPDF = (customer, answers) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                margin: 50,
                size: 'A4'
            });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Top Header Bar
            doc.rect(0, 0, doc.page.width, 80).fill('#1e3a8a'); // Deep Navy Blue
            doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('JANIFLOW INSPECTION REPORT', 50, 26, { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Quality Assurance & Service Verification • Powered by JaniFlow', { align: 'center' });

            doc.y = 100;

            // Customer Details Card
            doc.roundedRect(50, doc.y, 495, 85, 6).fillAndStroke('#f8fafc', '#cbd5e1');
            const cardTop = doc.y + 12;

            doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('Job & Customer Details', 65, cardTop);
            doc.moveDown(0.4);

            const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155').text('Customer Name: ', 65, doc.y, { continued: true });
            doc.font('Helvetica').text(customer.name || 'N/A');

            doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155').text('Service Address: ', 65, doc.y + 2, { continued: true });
            doc.font('Helvetica').text(customer.address || 'N/A');

            doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155').text('Completion Time: ', 65, doc.y + 2, { continued: true });
            doc.font('Helvetica').text(dateStr);

            doc.y = 205;

            // Checklist Section Title
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e3a8a').text('Service Checklist & Verification');
            doc.moveDown(0.2);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').lineWidth(1.5).stroke();
            doc.moveDown(0.6);

            // Loop through answers
            answers.forEach((ans, index) => {
                // Ensure there is room for question title and status
                if (doc.y > doc.page.height - 120) {
                    doc.addPage();
                }

                const isCompleted = ans.answer === true || ans.answer === 'true' || ans.answer === 1;
                const status = isCompleted ? 'COMPLETED' : 'NOT COMPLETED';
                const statusColor = isCompleted ? '#166534' : '#991b1b'; // Dark Green or Dark Red
                const statusBg = isCompleted ? '#dcfce7' : '#fee2e2';

                // Question Box
                const itemStartY = doc.y;
                doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text(`${index + 1}. ${ans.questionText || 'Inspection Item'}`);
                doc.moveDown(0.2);

                // Status Badge
                doc.roundedRect(65, doc.y, 110, 18, 4).fill(statusBg);
                doc.fontSize(9).font('Helvetica-Bold').fillColor(statusColor).text(`[ ${status} ]`, 70, doc.y + 4, { width: 100, align: 'center' });
                doc.moveDown(1.2);

                // Render Photo if attached
                const imageBuffer = ans.photoBuffer || (ans.photoBase64 ? Buffer.from(ans.photoBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64') : null);

                if (imageBuffer) {
                    // Check if we need a new page for image
                    if (doc.y > doc.page.height - 170) {
                        doc.addPage();
                    }

                    doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text('  Photo Proof:', 65, doc.y);
                    doc.moveDown(0.2);

                    try {
                        const imgY = doc.y;
                        doc.image(imageBuffer, 65, imgY, {
                            fit: [200, 130],
                            align: 'left'
                        });
                        doc.y = imgY + 138;
                    } catch (imgErr) {
                        console.error('PDF image rendering error:', imgErr.message);
                        doc.fontSize(8).fillColor('#94a3b8').text('  [Image could not be rendered]', 65, doc.y);
                        doc.moveDown(0.5);
                    }
                }

                doc.moveDown(0.4);
                doc.moveTo(65, doc.y).lineTo(545, doc.y).strokeColor('#f1f5f9').lineWidth(1).stroke();
                doc.moveDown(0.6);
            });

            // Summary / Footer
            if (doc.y > doc.page.height - 80) {
                doc.addPage();
            }

            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e1').lineWidth(1).stroke();
            doc.moveDown(0.8);
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e3a8a').text('Thank you for choosing JaniFlow Cleaning Services!', { align: 'center' });
            doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('This document is electronically generated and digitally verified by JaniFlow System.', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};