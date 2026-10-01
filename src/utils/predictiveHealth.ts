import { Machine, PredictiveHealthResult } from '../types';

/**
 * Mock Predictive Algorithm:
 * Evaluates historical vibration trend points, current deviation from baseline,
 * acoustic noise anomalies, and thermal gradient to forecast time-to-failure (TTF).
 */
export function calculatePredictiveHealth(machine: Machine): PredictiveHealthResult {
  const { telemetry, trendData, type } = machine;
  const { vibrationRMS, currentA, temperatureC, acousticAnomalyScore } = telemetry;

  // 1. Analyze historical vibration velocity trend
  let vibSlope = 0;
  if (trendData && trendData.length >= 2) {
    const first = trendData[0].vibration;
    const last = trendData[trendData.length - 1].vibration;
    vibSlope = (last - first) / trendData.length;
  }

  // 2. Base health calculation
  // Normal vibration baseline is typically ~1.5 - 2.5 mm/s. Safe limit is 4.5 mm/s.
  const vibExceedanceRatio = Math.max(0, (vibrationRMS - 2.0) / 2.5); // 0 at <=2.0, 1.0 at 4.5
  const acousticPenalty = (acousticAnomalyScore / 100) * 20;
  const tempPenalty = temperatureC > 65 ? (temperatureC - 65) * 1.2 : 0;
  const slopePenalty = vibSlope > 0 ? vibSlope * 15 : 0;

  let rawScore = 100 - (vibExceedanceRatio * 40 + acousticPenalty + tempPenalty + slopePenalty);
  if (machine.status === 'warning') rawScore = Math.min(rawScore, 68);
  if (machine.status === 'fault') rawScore = Math.min(rawScore, 35);
  if (machine.status === 'normal' && rawScore < 82) rawScore = 88;

  const score = Math.max(10, Math.min(99, Math.round(rawScore)));

  // 3. Time to failure estimation based on score & vibration trend
  // If score is 90+, TTF is > 3000 operating hours (~180 days)
  // If score is 60-75, TTF is ~200-450 operating hours (~12-25 days)
  // If score is < 50, TTF is critical (< 72 hours)
  let timeToFailureHours: number;
  let riskLevel: PredictiveHealthResult['riskLevel'];

  if (score >= 88) {
    timeToFailureHours = 3800 + Math.round((score - 88) * 120);
    riskLevel = 'low';
  } else if (score >= 70) {
    timeToFailureHours = 750 + Math.round((score - 70) * 80);
    riskLevel = 'moderate';
  } else if (score >= 50) {
    timeToFailureHours = 240 + Math.round((score - 50) * 18);
    riskLevel = 'high';
  } else {
    timeToFailureHours = Math.max(24, Math.round(score * 4));
    riskLevel = 'critical';
  }

  // Assuming typical Indian SME 16 hours/day (2 shifts) operation
  const timeToFailureDays = Math.max(1, Math.round(timeToFailureHours / 16));

  // 4. Failure Mode Identification based on machine type and telemetry pattern
  let failureMode = 'Nominal operational wear on mechanical linkages';
  let hindiFailureMode = 'सामान्य टूट-फूट - सभी पुर्जे सुरक्षित दायरे में';
  let preventiveAction = 'Regular scheduled lubrication at next planned shift change.';
  let hindiPreventiveAction = 'अगले निर्धारित समय पर नियमित ग्रीसिंग व तेल बदलना पर्याप्त है।';
  let savingsIfServicedINR = 8000;

  if (type === 'compressor' || machine.id === 'm2') {
    failureMode = 'Rotary screw bearing fatigue & V-belt tension slack';
    hindiFailureMode = 'स्क्रू बेयरिंग में घिसाव और V-बेल्ट ढीला होना';
    preventiveAction = 'Retension compressor drive belts and grease motor drive-end (DE) bearing.';
    hindiPreventiveAction = 'ड्राइव बेल्ट को कसें और मोटर बेयरिंग में हाई-टेम्परेचर ग्रीस डालें।';
    savingsIfServicedINR = 38000;
  } else if (type === 'press') {
    failureMode = 'Hydraulic ram guide bush friction & valve chatter';
    hindiFailureMode = 'हाइड्रोलिक रैम गाइड बुश में घर्षण व वाल्व कम्पन';
    preventiveAction = 'Inspect hydraulic oil filter particle count and inspect platen gib clearance.';
    hindiPreventiveAction = 'हाइड्रोलिक तेल का फिल्टर बदलें और रैम गाइड की क्लीयरेंस जांचें।';
    savingsIfServicedINR = 54000;
  } else if (type === 'motor') {
    failureMode = 'Rotor dynamic imbalance & end-shield bearing race wear';
    hindiFailureMode = 'रोटर असंतुलन और मोटर बेयरिंग घिसना';
    preventiveAction = 'Check shaft alignment with dial gauge and inspect motor foot mounting bolts.';
    hindiPreventiveAction = 'शाफ्ट अलाइनमेंट जांचें और मोटर के बेस बोल्ट कसें।';
    savingsIfServicedINR = 22000;
  } else if (type === 'furnace') {
    failureMode = 'Induction coil water-cooling scale buildup';
    hindiFailureMode = 'इंडक्शन कॉइल में पानी के स्केलिंग के कारण गर्मी बढ़ना';
    preventiveAction = 'Flush cooling manifold descaling agent and check thyristor phase current.';
    hindiPreventiveAction = 'कूलिंग पाइप की डी-स्केलिंग करें और करंट संतुलन जांचें।';
    savingsIfServicedINR = 65000;
  }

  return {
    score,
    timeToFailureHours,
    timeToFailureDays,
    riskLevel,
    trendSlope: +(vibSlope).toFixed(2),
    failureMode,
    hindiFailureMode,
    preventiveAction,
    hindiPreventiveAction,
    savingsIfServicedINR,
    confidenceScore: 94,
  };
}
