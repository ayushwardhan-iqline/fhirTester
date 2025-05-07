import path from 'path';
import { analyzeAllBundles, readBundleFile } from './bundleAnalyzer.js';
import { transformFHIRResource, profileToBundleType } from './bundleTransformer.js';
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
            console.log(`\nTransformed ${simplified.bundleType}:`, JSON.stringify(simplified, null, 2));
        }
        console.log('--------------------------------');
    }
}

main().catch(console.error);