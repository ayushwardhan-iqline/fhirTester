import { R4 } from '@ahryman40k/ts-fhir-types';
import { Bundle, BundleEntry } from './bundleAnalyzer.js';
import { processFhirResource, ProcessedFhirResource } from './fhirResourceProcessor.js';

type ProcessedResourceWithoutType = Omit<ProcessedFhirResource, 'processedType'>;
type ProcessedResourceMap = {
    [K in ProcessedFhirResource['processedType']]?: ProcessedResourceWithoutType | ProcessedResourceWithoutType[];
};

type BundleType = 
    | 'DiagnosticReport'
    | 'Prescription'
    | 'DischargeSummary'
    | 'ImmunizationRecord'
    | 'OPConsultNote'
    | 'WellnessRecord'
    | 'InvoiceRecord'
    | 'HealthDocumentRecord';

type TransformedBundle = ProcessedResourceMap & {
    bundleType: BundleType;
};

function createTransformer(bundle: Bundle): TransformedBundle {
    const result: ProcessedResourceMap = {};

    bundle.entry?.forEach((entry: BundleEntry) => {
        if (!entry.resource) return;
        const processed = processFhirResource(entry.resource);
        const processedType = processed.processedType;
        const { processedType: _, ...processedWithoutType } = processed;

        if (result[processedType]) {
            const existing = result[processedType] as ProcessedResourceWithoutType;
            if (Array.isArray(existing)) {
                existing.push(processedWithoutType);
            } else {
                result[processedType] = [existing, processedWithoutType];
            }
        } else {
            result[processedType] = processedWithoutType;
        }
    });

    // Determine bundle type
    const hasDiagnosticReport = bundle.entry?.some(e => e.resource?.resourceType === 'DiagnosticReport');
    const hasPrescription = bundle.entry?.some(e => e.resource?.resourceType === 'MedicationRequest');
    const hasDischargeSummary = bundle.entry?.some(e => e.resource?.resourceType === 'Encounter' && 
        e.resource?.class?.code === 'IMP');
    const hasImmunization = bundle.entry?.some(e => e.resource?.resourceType === 'Immunization');
    const hasOPConsult = bundle.entry?.some(e => e.resource?.resourceType === 'Encounter' && 
        e.resource?.class?.code === 'AMB');
    const hasWellness = bundle.entry?.some(e => e.resource?.resourceType === 'Observation' && 
        e.resource?.category?.[0]?.coding?.[0]?.code === 'vital-signs');
    const hasInvoice = bundle.entry?.some(e => e.resource?.resourceType === 'Invoice');
    const hasHealthDocument = bundle.entry?.some(e => e.resource?.resourceType === 'DocumentReference' && 
        !hasDiagnosticReport && !hasPrescription && !hasDischargeSummary && !hasImmunization && 
        !hasOPConsult && !hasWellness && !hasInvoice);

    let bundleType: BundleType;
    if (hasDiagnosticReport) {
        bundleType = 'DiagnosticReport';
    } else if (hasPrescription) {
        bundleType = 'Prescription';
    } else if (hasDischargeSummary) {
        bundleType = 'DischargeSummary';
    } else if (hasImmunization) {
        bundleType = 'ImmunizationRecord';
    } else if (hasOPConsult) {
        bundleType = 'OPConsultNote';
    } else if (hasWellness) {
        bundleType = 'WellnessRecord';
    } else if (hasInvoice) {
        bundleType = 'InvoiceRecord';
    } else if (hasHealthDocument) {
        bundleType = 'HealthDocumentRecord';
    } else {
        throw new Error('Unknown bundle type');
    }

    return { ...result, bundleType };
}

export function transformFHIRResource(input: any): any {
    // Handle null/undefined input
    if (!input) {
        throw new Error('Input is null or undefined');
    }

    // Check if it's a list of bundles
    if (Array.isArray(input.entries)) {
        return input.entries.map((entry: any) => transformFHIRResource(entry));
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