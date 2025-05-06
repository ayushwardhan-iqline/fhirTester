import path from 'path';
import { analyzeAllBundles, readBundleFile } from './bundleAnalyzer.js';
import {
    transformDiagnosticReportBundle,
    transformPrescriptionBundle,
    transformDischargeSummaryBundle,
    transformImmunizationRecordBundle,
    transformOPConsultNoteBundle,
    transformWellnessRecordBundle
} from './bundleTransformer.js';
import * as fs from 'fs/promises';

async function main() {
    const bundleDir = path.join(process.cwd(), 'bundleExample');
    
    // First analyze all bundles
    await analyzeAllBundles(bundleDir);
    
    // Then transform specific bundles
    const files = await fs.readdir(bundleDir);
    
    for (const file of files) {
        if (file.endsWith('.json')) {
            const filePath = path.join(bundleDir, file);
            const bundle = await readBundleFile(filePath);
            
            // Transform based on bundle type
            if (file.includes('DiagnosticReport')) {
                const simplified = transformDiagnosticReportBundle(bundle);
                console.log('\nTransformed Diagnostic Report:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('Prescription')) {
                const simplified = transformPrescriptionBundle(bundle);
                console.log('\nTransformed Prescription:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('DischargeSummary')) {
                const simplified = transformDischargeSummaryBundle(bundle);
                console.log('\nTransformed Discharge Summary:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('ImmunizationRecord')) {
                const simplified = transformImmunizationRecordBundle(bundle);
                console.log('\nTransformed Immunization Record:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('OPConsultNote')) {
                const simplified = transformOPConsultNoteBundle(bundle);
                console.log('\nTransformed OP Consult Note:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('WellnessRecord')) {
                const simplified = transformWellnessRecordBundle(bundle);
                console.log('\nTransformed Wellness Record:', JSON.stringify(simplified, null, 2));
            }
        }
        console.log('--------------------------------');
    }
}

main().catch(console.error);