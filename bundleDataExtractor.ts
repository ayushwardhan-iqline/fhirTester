import { R4 } from '@ahryman40k/ts-fhir-types';
import { Bundle } from './bundleAnalyzer.js';
import { v4 as uuidv4 } from 'uuid';

// Type for extracted attachment data
export interface ExtractedAttachment {
    refId: string;
    contentType: string;
    data: string;
    title?: string;
}

// Type for the return value of extractAttachments
export interface ExtractedBundleData {
    bundle: Bundle;  // The modified bundle with attachments replaced by refIds
    attachments: ExtractedAttachment[];  // Array of extracted attachments
}

/**
 * Extracts attachments from a FHIR bundle and replaces them with reference IDs.
 * Also removes text properties from resources to reduce bundle size.
 * Looks for attachments in:
 * 1. Bundle.signature.data
 * 2. DiagnosticReport.presentedForm
 * 3. DocumentReference.content[].attachment
 * 4. Binary resources
 * 
 * @param bundle The FHIR bundle to process
 * @returns Object containing the modified bundle and array of extracted attachments
 */
export function extractAttachments(bundle: Bundle): ExtractedBundleData {
    const extractedAttachments: ExtractedAttachment[] = [];

    // Handle bundle signature if present
    if (bundle.signature?.data) {
        const refId = uuidv4();
        extractedAttachments.push({
            refId,
            contentType: bundle.signature.sigFormat || 'application/octet-stream',
            data: bundle.signature.data,
            title: 'Bundle Signature'
        });

        // Replace signature data with refId
        delete bundle.signature.data;
        bundle.signature.extension = [{
            url: 'https://fhir-attachment-ref',
            valueString: refId
        }];
    }

    // Remove text property from the bundle if present
    if ('text' in bundle) {
        delete bundle.text;
    }

    // Process each entry in the bundle
    bundle.entry?.forEach(entry => {
        if (!entry.resource) return;

        // Remove text property from the resource
        if ('text' in entry.resource) {
            delete entry.resource.text;
        }

        switch (entry.resource.resourceType) {
            case 'DiagnosticReport': {
                const report = entry.resource as R4.IDiagnosticReport;
                if (report.presentedForm) {
                    report.presentedForm = report.presentedForm.map(form => {
                        if (!form.data) return form;
                        
                        const refId = uuidv4();
                        extractedAttachments.push({
                            refId,
                            contentType: form.contentType || 'application/octet-stream',
                            data: form.data,
                            title: form.title
                        });

                        // Replace data with refId
                        const modifiedForm = { ...form };
                        delete modifiedForm.data;
                        modifiedForm.extension = [{
                            url: 'https://fhir-attachment-ref',
                            valueString: refId
                        }];
                        return modifiedForm;
                    });
                }
                break;
            }

            case 'DocumentReference': {
                const docRef = entry.resource as R4.IDocumentReference;
                if (docRef.content) {
                    docRef.content = docRef.content.map(content => {
                        if (!content.attachment?.data) return content;

                        const refId = uuidv4();
                        extractedAttachments.push({
                            refId,
                            contentType: content.attachment.contentType || 'application/octet-stream',
                            data: content.attachment.data,
                            title: content.attachment.title
                        });

                        // Replace data with refId
                        const modifiedContent = { ...content };
                        delete modifiedContent.attachment.data;
                        modifiedContent.attachment.extension = [{
                            url: 'https://fhir-attachment-ref',
                            valueString: refId
                        }];
                        return modifiedContent;
                    });
                }
                break;
            }

            case 'Binary': {
                const binary = entry.resource as R4.IBinary;
                if (binary.data) {
                    const refId = uuidv4();
                    extractedAttachments.push({
                        refId,
                        contentType: binary.contentType || 'application/octet-stream',
                        data: binary.data,
                        title: 'Binary Document'
                    });

                    // Replace data with refId
                    delete binary.data;
                    binary.extension = [{
                        url: 'https://fhir-attachment-ref',
                        valueString: refId
                    }];
                }
                break;
            }
        }
    });

    return {
        bundle: bundle,
        attachments: extractedAttachments
    };
}
