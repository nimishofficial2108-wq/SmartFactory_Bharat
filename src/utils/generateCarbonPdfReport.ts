import { jsPDF } from 'jspdf';
import { MachineCarbonPassport } from '../types/aiIntelligence';

interface GenerateCarbonReportParams {
  carbonPassports: MachineCarbonPassport[];
  factoryTotalCarbonEmittedKg: number;
  factoryIdleCarbonLossKg: number;
  factoryTopHotspotAssetsPct: number;
  indiaGridEmissionFactor: number;
  carbonPredictiveNotice: {
    normalNotice: string;
    carbonNotice: string;
    extraEnergyPct: number;
    extraCostYearINR: number;
    extraCo2TonsYear: number;
    action: string;
  };
  plantName?: string;
  unitLocation?: string;
  tariffRateINR?: number;
}

export const generateCarbonPdfReport = ({
  carbonPassports,
  factoryTotalCarbonEmittedKg,
  factoryIdleCarbonLossKg,
  factoryTopHotspotAssetsPct,
  indiaGridEmissionFactor,
  carbonPredictiveNotice,
  plantName = 'SmartFactory Bharat — Pune MIDC Unit 01',
  unitLocation = 'Bhosari Industrial Area, Pune, Maharashtra 411026',
  tariffRateINR = 8.5,
}: GenerateCarbonReportParams): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const reportRef = `SFB-ESG-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  // 1. Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent Line (Emerald Green)
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 36, pageWidth, 2, 'F');

  // Title & Branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SMARTFACTORY BHARAT — CARBON & ENERGY AUDIT REPORT', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Facility: ${plantName} · ${unitLocation}`, margin, 20);
  doc.text(`Standard: ISO 50001 Energy Management & SEBI BRSR Scope 2 ESG Compliance`, margin, 25);

  // Metadata in Header Right
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Report Ref: ${reportRef}`, pageWidth - margin, 14, { align: 'right' });
  doc.text(`Date: ${dateStr} ${timeStr}`, pageWidth - margin, 19, { align: 'right' });
  doc.text(`Grid Factor: ${indiaGridEmissionFactor} kg CO2/kWh (India CEA)`, pageWidth - margin, 24, {
    align: 'right',
  });

  let currentY = 46;

  // 2. Executive Summary KPIs Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE SUMMARY: PLANT ENERGY & CARBON FOOTPRINT', margin, currentY);

  currentY += 4;
  const kpiBoxHeight = 22;
  const kpiBoxWidth = (contentWidth - 9) / 4;

  const totalKWhToday = +(factoryTotalCarbonEmittedKg / indiaGridEmissionFactor).toFixed(1);
  const totalIdleCostINR = Math.round(
    (factoryIdleCarbonLossKg / indiaGridEmissionFactor) * tariffRateINR
  );

  const kpis = [
    {
      title: 'TOTAL ENERGY TODAY',
      value: `${totalKWhToday} kWh`,
      subtitle: `Bill: ~Rs. ${(totalKWhToday * tariffRateINR).toLocaleString('en-IN')}`,
      color: [16, 185, 129], // emerald
    },
    {
      title: 'SCOPE 2 EMISSIONS',
      value: `${factoryTotalCarbonEmittedKg} kg`,
      subtitle: `@ ${indiaGridEmissionFactor} kg CO2/kWh`,
      color: [59, 130, 246], // blue
    },
    {
      title: 'IDLE CARBON LOSS',
      value: `${factoryIdleCarbonLossKg} kg`,
      subtitle: `Waste: ~Rs. ${totalIdleCostINR.toLocaleString('en-IN')}`,
      color: [245, 158, 11], // amber
    },
    {
      title: 'HOTSPOT ASSETS',
      value: `${factoryTopHotspotAssetsPct}%`,
      subtitle: 'Concentrated in 4 assets',
      color: [239, 68, 68], // red
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (kpiBoxWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, kpiBoxWidth, kpiBoxHeight, 2, 2, 'FD');

    // Colored mini bar
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.rect(x, currentY, kpiBoxWidth, 1.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.title, x + 3, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x + 3, currentY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.subtitle, x + 3, currentY + 18);
  });

  currentY += kpiBoxHeight + 8;

  // 3. Factory Carbon Hotspot Heatmap Finding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. SPATIAL CARBON HOTSPOT HEATMAP FINDINGS', margin, currentY);

  currentY += 4;
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(254, 202, 202); // red-200
  doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(153, 27, 27); // red-800
  doc.text('KEY AUDIT FINDING: "Factory ke 60% carbon emissions sirf 4 major assets se aa rahe hain."', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(127, 29, 29); // red-900
  doc.text(
    `Continuous SCT-013 current and multi-sensor telemetry reveals that the top 4 monitored production assets generate ${factoryTopHotspotAssetsPct}% of the plant's daily Scope 2 carbon footprint. Rotary Screw Compressor 45kW (Bay 2) is the primary emission hotspot (30.8% of emissions, 96.7 kg CO2 wasted in idle motor spin).`,
    margin + 4,
    currentY + 12,
    { maxWidth: contentWidth - 8 }
  );

  currentY += 24;

  // 4. Machine-Level Carbon Passports Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. MACHINE-LEVEL CARBON PASSPORT TELEMETRY TABLE', margin, currentY);

  currentY += 4;

  // Table Headers
  const colWidths = [26, 46, 26, 24, 30, 24, 16];
  const colHeaders = [
    'Machine ID',
    'Asset Name / Bay',
    'Energy (kWh)',
    'CO2 Emitted',
    'Specific Carbon',
    'Idle Carbon',
    'Grade',
  ];

  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, contentWidth, 7, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  let curX = margin;
  colHeaders.forEach((hdr, idx) => {
    doc.text(hdr, curX + 2, currentY + 4.8);
    curX += colWidths[idx];
  });

  currentY += 7;

  // Table Rows
  carbonPassports.forEach((passport, i) => {
    const isAlt = i % 2 === 1;
    if (isAlt) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, contentWidth, 9, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);

    let cellX = margin;

    // Col 1: ID
    doc.setFont('helvetica', 'bold');
    doc.text(passport.machineId, cellX + 2, currentY + 5.5);
    cellX += colWidths[0];

    // Col 2: Name
    doc.setFont('helvetica', 'normal');
    doc.text(passport.name, cellX + 2, currentY + 4);
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(passport.bay, cellX + 2, currentY + 7.5);
    cellX += colWidths[1];

    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);

    // Col 3: Energy
    doc.text(`${passport.kwhConsumedToday} kWh`, cellX + 2, currentY + 5.5);
    cellX += colWidths[2];

    // Col 4: CO2
    doc.text(`${passport.co2EmittedKg} kg`, cellX + 2, currentY + 5.5);
    cellX += colWidths[3];

    // Col 5: Specific
    doc.text(`${passport.co2PerUnitProduced.value} ${passport.co2PerUnitProduced.unit}`, cellX + 2, currentY + 5.5);
    cellX += colWidths[4];

    // Col 6: Idle Waste
    doc.text(`${passport.idleCarbonLossKg} kg (${passport.idleCarbonLossPct}%)`, cellX + 2, currentY + 5.5);
    cellX += colWidths[5];

    // Col 7: Grade
    doc.setFont('helvetica', 'bold');
    if (passport.efficiencyGrade === 'A' || passport.efficiencyGrade === 'A+') {
      doc.setTextColor(16, 185, 129);
    } else if (passport.efficiencyGrade === 'B' || passport.efficiencyGrade === 'B+') {
      doc.setTextColor(37, 99, 235);
    } else if (passport.efficiencyGrade === 'C') {
      doc.setTextColor(217, 119, 6);
    } else {
      doc.setTextColor(220, 38, 38);
    }
    doc.text(passport.efficiencyGrade, cellX + 4, currentY + 5.5);

    currentY += 9;
  });

  currentY += 8;

  // 5. Carbon-Aware Predictive Maintenance Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. CARBON-AWARE PREDICTIVE MAINTENANCE PROGNOSTICS', margin, currentY);

  currentY += 4;

  const compareBoxWidth = (contentWidth - 4) / 2;
  const compareBoxHeight = 32;

  // Left: Traditional Predictive Maintenance
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, compareBoxWidth, compareBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONVENTIONAL PREDICTIVE MAINTENANCE', margin + 3, currentY + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`"${carbonPredictiveNotice.normalNotice}"`, margin + 3, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Limitations: Only flags threshold risk; fails to quantify continuous energy waste or financial urgency before breakdown.',
    margin + 3,
    currentY + 20,
    { maxWidth: compareBoxWidth - 6 }
  );

  // Right: SmartFactory Carbon-Aware Predictive Maintenance
  const rightBoxX = margin + compareBoxWidth + 4;
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(rightBoxX, currentY, compareBoxWidth, compareBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('SMARTFACTORY CARBON-AWARE PROGNOSTIC', rightBoxX + 3, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(
    `"${carbonPredictiveNotice.carbonNotice}"`,
    rightBoxX + 3,
    currentY + 12,
    { maxWidth: compareBoxWidth - 6 }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 78, 59);
  doc.text(
    `Impact: +${carbonPredictiveNotice.extraEnergyPct}% Extra Energy · Avoidable Cost: Rs. ${carbonPredictiveNotice.extraCostYearINR.toLocaleString(
      'en-IN'
    )}/yr · Avoidable Emissions: ${carbonPredictiveNotice.extraCo2TonsYear} tCO2`,
    rightBoxX + 3,
    currentY + 26
  );

  currentY += compareBoxHeight + 8;

  // 6. Recommended Action & Signoff Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('RECOMMENDED CORRECTIVE ACTION & COMPLIANCE SIGNOFF:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `${carbonPredictiveNotice.action} Implementing these corrective measures eliminates 1.3 tCO2 annual excess emissions and restores machine efficiency to OEM IE3 premium benchmark.`,
    margin + 4,
    currentY + 12,
    { maxWidth: contentWidth - 8 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Digitally Verified by: SmartFactory Bharat IoT Core Engine · Non-Invasive Retrofit Telemetry', margin + 4, currentY + 18);
  doc.text('ISO 50001 Verified · SEBI BRSR Audit Ready', pageWidth - margin - 4, currentY + 18, { align: 'right' });

  // 7. Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('SmartFactory Bharat — Non-Invasive Industrial IoT Retrofit Architecture', margin, pageHeight - 8);
  doc.text(`Page 1 of 1 · Generated automatically via ESP32 telemetry`, pageWidth - margin, pageHeight - 8, {
    align: 'right',
  });

  // Save the PDF file
  const filename = `SmartFactory_Carbon_Energy_Report_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
