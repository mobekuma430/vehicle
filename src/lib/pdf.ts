import jsPDF from 'jspdf';
import { VehicleRequest, User, Vehicle, FuelRequest } from '../types';
import { toEthiopian } from './utils';

const LOGO_URL = 'https://i.postimg.cc/MZDDxD1z/ESAA_IMAGE.jpg';

export const generateApprovalPDF = async (request: VehicleRequest, requester: User, vehicle: Vehicle | undefined, driver: User | undefined, vehicleManagerName: string, directorateApproverName: string) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const img = new Image();
  img.src = LOGO_URL;
  img.crossOrigin = 'Anonymous';
  await new Promise((r) => { img.onload = r; img.onerror = r; });

  const sections = [
    { x: 0, y: 0 }, { x: pageWidth / 2, y: 0 },
    { x: 0, y: pageHeight / 2 }, { x: pageWidth / 2, y: pageHeight / 2 }
  ];

  sections.forEach((section) => {
    const startX = section.x + 5;
    const startY = section.y + 5;
    const width = pageWidth / 2 - 10;
    const height = pageHeight / 2 - 10;

    doc.rect(section.x, section.y, pageWidth / 2, pageHeight / 2);

    if (img.complete && img.naturalWidth > 0) {
      doc.addImage(img, 'JPEG', startX + width / 2 - 10, startY + 2, 20, 15);
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ESAA VEHICLE MANAGEMENT SYSTEM', startX + width / 2, startY + 22, { align: 'center' });
    doc.setFontSize(8);
    doc.text(request.status === 'APPROVED' ? 'APPROVAL FORM' : 'REJECTION FORM', startX + width / 2, startY + 27, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, startX, startY + 35);
    doc.text(`Directorate: ${requester.department}`, startX + width - 35, startY + 35);

    doc.setFont('helvetica', 'bold');
    doc.text('Requester Details', startX, startY + 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${requester.name}`, startX, startY + 50);
    doc.text(`Dept: ${request.department}`, startX, startY + 55);
    doc.text(`Region: ${request.region}`, startX, startY + 60);

    doc.setFont('helvetica', 'bold');
    doc.text('Request Details', startX, startY + 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`Purpose: ${request.purpose}`, startX, startY + 75);
    doc.text(`Destination: ${request.destination}`, startX, startY + 80);
    doc.text(`Period: ${toEthiopian(request.start_date)} to ${toEthiopian(request.end_date)} (EC)`, startX, startY + 85);

    if (request.status === 'APPROVED' && vehicle) {
      doc.setFont('helvetica', 'bold');
      doc.text('Assigned Vehicle', startX, startY + 95);
      doc.setFont('helvetica', 'normal');
      doc.text(`Plate: ${vehicle.plate_number}`, startX, startY + 100);
      doc.text(`Driver: ${driver?.name || 'N/A'}`, startX, startY + 105);
    } else if (request.status === 'REJECTED') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 0, 0);
      doc.text('REJECTION REASON', startX, startY + 95);
      doc.setFont('helvetica', 'normal');
      doc.text(request.rejection_reason || 'No specific reason provided.', startX, startY + 100, { maxWidth: width });
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(7);
    doc.text('____________________', startX, startY + height - 20);
    doc.text('Directorate: ' + directorateApproverName, startX, startY + height - 15);
    doc.text('____________________', startX + width - 35, startY + height - 20);
    doc.text('Vehicle Manager: ' + vehicleManagerName, startX + width - 35, startY + height - 15);

    doc.setFontSize(6);
    doc.text('System Generated Approval Document - ESAA VMS', startX + width / 2, startY + height - 5, { align: 'center' });
  });

  doc.save(`ESAA_VMS_Request_${request.id}.pdf`);
};

export const generateFuelApprovalPDF = async (request: FuelRequest, requester: User, vehicleManagerName: string, directorateApproverName: string) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const img = new Image();
  img.src = LOGO_URL;
  img.crossOrigin = 'Anonymous';
  await new Promise((r) => { img.onload = r; img.onerror = r; });

  const sections = [
    { x: 0, y: 0 }, { x: pageWidth / 2, y: 0 },
    { x: 0, y: pageHeight / 2 }, { x: pageWidth / 2, y: pageHeight / 2 }
  ];

  sections.forEach((section) => {
    const startX = section.x + 5;
    const startY = section.y + 5;
    const width = pageWidth / 2 - 10;
    const height = pageHeight / 2 - 10;

    doc.rect(section.x, section.y, pageWidth / 2, pageHeight / 2);

    if (img.complete && img.naturalWidth > 0) {
      doc.addImage(img, 'JPEG', startX + width / 2 - 10, startY + 2, 20, 15);
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ESAA Fuel', startX + width / 2, startY + 22, { align: 'center' });
    doc.setFontSize(8);
    doc.text(request.status === 'APPROVED' ? 'APPROVAL FORM' : 'REJECTION FORM', startX + width / 2, startY + 27, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, startX, startY + 35);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Requester Details', startX, startY + 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${requester.name}`, startX, startY + 50);

    doc.setFont('helvetica', 'bold');
    doc.text('Fuel Request Details', startX, startY + 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Amount: ${request.amount}`, startX, startY + 65);
    doc.text(`Mileage: ${request.current_mileage}`, startX, startY + 70);

    if (request.status === 'REJECTED') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 0, 0);
      doc.text('REJECTION REASON', startX, startY + 80);
      doc.setFont('helvetica', 'normal');
      doc.text(request.rejection_reason || 'No specific reason provided.', startX, startY + 85, { maxWidth: width });
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(7);
    doc.text('____________________', startX, startY + height - 20);
    doc.text('Directorate: ' + directorateApproverName, startX, startY + height - 15);
    doc.text('____________________', startX + width - 35, startY + height - 20);
    doc.text('Vehicle Manager: ' + vehicleManagerName, startX + width - 35, startY + height - 15);

    doc.setFontSize(6);
    doc.text('System Generated Approval Document - ESAA VMS', startX + width / 2, startY + height - 5, { align: 'center' });
  });

  doc.save(`ESAA_VMS_Fuel_Request_${request.id}.pdf`);
};
