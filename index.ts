import path from 'path';
import { analyzeAllBundles, readBundleFile } from './bundleAnalyzer.js';
import { transformFHIRResource } from './bundleTransformer.js';
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
            
            // Transform the bundle
            const simplified = transformFHIRResource(bundle);
            
            // Log with descriptive message based on bundle type
            if (file.includes('DiagnosticReport')) {
                console.log('\nTransformed Diagnostic Report:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('Prescription')) {
                console.log('\nTransformed Prescription:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('DischargeSummary')) {
                console.log('\nTransformed Discharge Summary:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('ImmunizationRecord')) {
                console.log('\nTransformed Immunization Record:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('OPConsultNote')) {
                console.log('\nTransformed OP Consult Note:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('WellnessRecord')) {
                console.log('\nTransformed Wellness Record:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('InvoiceRecord')) {
                console.log('\nTransformed Invoice Record:', JSON.stringify(simplified, null, 2));
            } else if (file.includes('HealthDocumentRecord')) {
                console.log('\nTransformed Health Document Record:', JSON.stringify(simplified, null, 2));
            }
        }
        console.log('--------------------------------');
    }
}

main().catch(console.error);