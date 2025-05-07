import { R4 } from '@ahryman40k/ts-fhir-types';
import * as fs from 'fs/promises';
import path from 'path';

export type Bundle = R4.IBundle;
export type BundleEntry = R4.IBundle_Entry;

export interface BundleSummary {
    type: string;
    entryCount: number;
    resourceTypes: Set<string>;
    hasAttachments: boolean;
}

export async function readBundleFile(filePath: string): Promise<Bundle> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
}

export function analyzeBundle(bundle: Bundle): BundleSummary {
    const summary: BundleSummary = {
        type: bundle.type || 'unknown',
        entryCount: bundle.entry?.length || 0,
        resourceTypes: new Set(),
        hasAttachments: false
    };

    bundle.entry?.forEach(entry => {
        if (entry.resource) {
            summary.resourceTypes.add(entry.resource.resourceType);
            
            // Check for attachments (Binary resources or attachments in other resources)
            if (entry.resource.resourceType === 'Binary' || 
                (entry.resource as any).content?.some((c: any) => c.attachment) ||
                (entry.resource as any).presentedForm?.some((p: any) => p.data)
            ) {
                summary.hasAttachments = true;
            }
        }
    });

    return summary;
}

export async function processBundleFile(filePath: string): Promise<void> {
    try {
        const bundle = await readBundleFile(filePath);
        const summary = analyzeBundle(bundle);
        
        console.log(`\nAnalyzing bundle: ${path.basename(filePath)}`);
        console.log('Bundle Type:', summary.type);
        console.log('Number of entries:', summary.entryCount);
        console.log('Resource types present:', Array.from(summary.resourceTypes).join(', '));
        console.log('Contains attachments:', summary.hasAttachments);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

export async function analyzeAllBundles(bundleDir: string): Promise<void> {
    const files = await fs.readdir(bundleDir);
    
    for (const file of files) {
        if (file.endsWith('.json')) {
            await processBundleFile(path.join(bundleDir, file));
        }
    }
} 