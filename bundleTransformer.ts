import { R4 } from '@ahryman40k/ts-fhir-types';
import { Bundle, BundleEntry } from './bundleAnalyzer.js';
import { processFhirResource, ProcessedFhirResource, ProcessedAttachment } from './fhirResourceProcessor.js';

// Helper to get the specific processed resource type from the union
export type SpecificProcessedResource<PType extends ProcessedFhirResource['processedType']> =
    Extract<ProcessedFhirResource, { processedType: PType }>;
export type ProcessedResourceMap = {
    [K in ProcessedFhirResource['processedType']]?: Array<Extract<ProcessedFhirResource, { processedType: K }>>;
};

type AttachmentRef = {
    bundleId: string;
    sessionId: string;
    num: number;
};

type BundleType =
    // Document Bundle Types (with Record suffix)
    | 'WellnessRecord'
    | 'PrescriptionRecord'
    | 'DischargeSummaryRecord'
    | 'ImmunizationRecord'
    | 'OPConsultRecord'
    | 'InvoiceRecord'
    | 'HealthDocumentRecord'
    | 'DiagnosticReportRecord'
    // Resource Types
    | 'Patient'
    | 'Practitioner'
    | 'Organization'
    | 'Encounter'
    | 'Observation'
    | 'DiagnosticReport'
    | 'DocumentReference'
    | 'MedicationRequest'
    | 'Immunization'
    | 'Invoice'
    | 'Condition'
    | 'Procedure'
    | 'AllergyIntolerance'
    | 'CarePlan'
    | 'Goal'
    | 'ServiceRequest'
    | 'Specimen'
    | 'Binary'
    | 'Composition'
    | 'Bundle'
    ;

// Map profile URLs to bundle types
export const profileToBundleType: Record<string, BundleType> = {
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/WellnessRecord': 'WellnessRecord',
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/PrescriptionRecord': 'PrescriptionRecord',
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord': 'OPConsultRecord',
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/InvoiceRecord': 'InvoiceRecord',
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/HealthDocumentRecord': 'HealthDocumentRecord',
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/DischargeSummaryRecord': 'DischargeSummaryRecord',
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportRecord': 'DiagnosticReportRecord',
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/ImmunizationRecord': 'ImmunizationRecord'
};

type TransformedBundle = ProcessedResourceMap & {
    bundleType: BundleType;
    AttachmentRefs?: AttachmentRef[];
};

// Helper function to process presentedForm into ProcessedAttachment array
function processPresentedForm(presentedForm?: R4.IAttachment[]): ProcessedAttachment[] {
    if (!presentedForm || presentedForm.length === 0) return [];
    
    return presentedForm.map(form => ({
        processedType: 'Attachment',
        contentType: form.contentType || 'application/octet-stream',
        // data: form.data || '',
        data: 'base64PDFDATA',
        title: form.title || 'Document'
    }));
}

function createTransformer(bundle: Bundle): TransformedBundle {
    const result: ProcessedResourceMap = {};

    bundle.entry?.forEach((entry: BundleEntry) => {
        if (!entry.resource) return;
        const processed = processFhirResource(entry.resource);
        const processedType = processed.processedType;

        if (!result[processedType]) {
            result[processedType] = [];
        }
        (result[processedType] as Array<typeof processed>).push(processed);
    });

    // Get the Composition resource from the first entry
    const firstEntryResource = bundle.entry?.[0]?.resource;
    if (!firstEntryResource) {
        throw new Error('Bundle must start with a resource');
    }

    // Extract the profile URL from the Composition resource
    const profileUrl = firstEntryResource.meta?.profile?.[0];
    
    // If we have a profile URL, try to map it to a bundle type
    let bundleType: BundleType;
    if (profileUrl && profileToBundleType[profileUrl]) {
        bundleType = profileToBundleType[profileUrl];
    } else {
        // If no profile URL or unknown profile, use the resource type of the first entry
        bundleType = firstEntryResource.resourceType as BundleType;
    }

    // Special handling for DiagnosticReport and DiagnosticReportRecord
    if (bundleType === 'DiagnosticReportRecord' || bundleType === 'DiagnosticReport') {
        // Check if we already have Attachments
        if (!result['Attachment'] || result['Attachment'].length === 0) {
            // Find DiagnosticReport entry and process its presentedForm
            const diagnosticReportEntry = bundle.entry?.find(entry => 
                entry.resource?.resourceType === 'DiagnosticReport'
            );
            
            if (diagnosticReportEntry?.resource) {
                const diagnosticReport = diagnosticReportEntry.resource as R4.IDiagnosticReport;
                if (diagnosticReport.presentedForm && diagnosticReport.presentedForm.length > 0) {
                    const processedAttachments = processPresentedForm(diagnosticReport.presentedForm);
                    if (processedAttachments.length > 0) {
                        result['Attachment'] = processedAttachments;
                    }
                }
            }
        }
    }

    return { ...result, bundleType };
}

export function transformFHIRResource(input: any): TransformedBundle {
    // Handle null/undefined input
    if (!input) {
        throw new Error('Input is null or undefined');
    }

    // Check if it's a single bundle
    if (input.resourceType === 'Bundle') {
        const bundle = input as Bundle;
        return createTransformer(bundle);
    }

    // Handle single resources
    if (input.resourceType) {
        const bundle: Bundle = {
            resourceType: 'Bundle',
            type: 'document' as R4.BundleTypeKind,
            entry: [{ resource: input }]
        };
        return createTransformer(bundle);
    }

    throw new Error('Unsupported FHIR resource type');
}