import path from 'path';
import { analyzeAllBundles, readBundleFile } from './bundleAnalyzer.js';
import { transformFHIRResource, profileToBundleType } from './bundleTransformer.js';
import * as fs from 'fs/promises';
import { extractAttachments } from './bundleDataExtractor.js';

type folderPaths = 'testJson' | 'bundleExample';

async function main() {
    const folder: folderPaths = 'bundleExample';
    const bundleDir = path.join(process.cwd(), folder);
    
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
            console.log(`\nTransformed ${simplified.bundleType}`);
            console.dir(simplified, { depth: null });

            // const extracted = extractAttachments(bundle);
            // const lightenedBundle = extracted.bundle;
            // const attachments = extracted.attachments.map(a => ({ refId: a.refId, contentType: a.contentType, title: a.title }));
            // console.log("-------------- Extracted Attachments ------------------");
            // console.dir({ lightenedBundle, attachments }, { depth: null });
            // console.log("--------------------------------------------------------");
        }
        console.log('--------------------------------');
    }
}

main().catch(console.error);