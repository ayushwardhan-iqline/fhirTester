// fhirResourceProcessor.ts
import { R4 } from '@ahryman40k/ts-fhir-types';

// --- Helper Functions (from previous solution, ensure they are here) ---
export function getPersonName(name?: R4.IHumanName[]): string {
    if (!name || name.length === 0) return 'Unknown';
    const n = name.find(nm => nm.use === 'official') || name[0];
    return n.text || `${n.prefix?.join(' ') || ''} ${n.given?.join(' ') || ''} ${n.family || ''}`.replace(/\s+/g, ' ').trim() || 'Unknown';
}

export function extractCodeableConceptText(concept?: R4.ICodeableConcept): string {
    if (!concept) return '';
    return concept.text || concept.coding?.[0]?.display || concept.coding?.[0]?.code || '';
}

export function extractCodingDisplay(coding?: R4.ICoding[]): string {
    if (!coding || coding.length === 0) return '';
    return coding[0].display || coding[0].code || '';
}

// --- Interfaces for Processed Resource Parts (with discriminant) ---
export interface ProcessedAttachment {
    processedType: 'Attachment';
    contentType: string;
    data: string;
    title?: string;
}

export interface ProcessedPatientInfo {
    processedType: 'PatientInfo';
    name: string;
    id: string;
}

export interface ProcessedPractitionerInfo {
    processedType: 'PractitionerInfo';
    name: string;
    id: string;
}

export interface ProcessedOrganizationInfo {
    processedType: 'OrganizationInfo';
    name: string;
    id?: string;
}

export interface ProcessedObservationResult {
    processedType: 'ObservationResult';
    code: string;
    value: string;
    unit?: string;
    date?: string;
    text?: string;
    components?: Array<{ // Simplified component structure
        code: string;
        value: string;
        unit?: string;
        text?: string;
    }>;
}

export interface ProcessedMedicationInfo {
    processedType: 'MedicationInfo';
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    status?: string;
}

export interface ProcessedConditionInfo {
    processedType: 'ConditionInfo';
    code: string;
    status?: string;
    text?: string;
}

export interface ProcessedProcedureInfo {
    processedType: 'ProcedureInfo';
    code: string;
    status?: string;
    date?: string;
    text?: string;
}

export interface ProcessedEncounterInfo {
    processedType: 'EncounterInfo';
    type: string;
    startDate?: string;
    endDate?: string;
    date?: string;
    status?: string;
}

export interface ProcessedImmunizationInfo {
    processedType: 'ImmunizationInfo';
    vaccine: string;
    date: string;
    lotNumber?: string;
    status: string;
}

export interface ProcessedImmunizationRecommendationInfo {
    processedType: 'ImmunizationRecommendationInfo';
    vaccine: string;
    status: string;
    date: string;
}

export interface ProcessedAllergyIntoleranceInfo {
    processedType: 'AllergyIntoleranceInfo';
    substance: string;
    severity?: string;
    status?: string;
    type?: string;
}

export interface ProcessedCompositionInfo {
    processedType: 'CompositionInfo';
    title: string;
    id?: string;
    status: string;
    date?: string;
}

export interface ProcessedDiagnosticReportInfo {
    processedType: 'DiagnosticReportInfo';
    test: string;
    conclusion: string;
    date: string;
}

export interface ProcessedAppointmentInfo {
    processedType: 'AppointmentInfo';
    status: string;
    type: string;
    description?: string;
    start: string;
    end: string;
    created?: string;
}

export interface ProcessedCarePlanInfo {
    processedType: 'CarePlanInfo';
    status: string;
    intent: string;
    title: string;
    description?: string;
    category?: string;
}

export interface ProcessedMedicationStatementInfo {
    processedType: 'MedicationStatementInfo';
    status: string;
    medication: string;
    dateAsserted?: string;
}

export interface ProcessedSpecimenInfo {
    processedType: 'SpecimenInfo';
    type: string;
    receivedTime?: string;
    collectionTime?: string;
}

export interface ProcessedServiceRequestInfo {
    processedType: 'ServiceRequestInfo';
    status: string;
    intent: string;
    code: string;
    occurrenceDateTime?: string;
    requester?: string;
}

export interface ProcessedChargeItemInfo {
    processedType: 'ChargeItemInfo';
    status: string;
    code: string;
    quantity?: number;
    product?: string;
}

export interface ProcessedInvoiceInfo {
    processedType: 'InvoiceInfo';
    status: string;
    type: string;
    date?: string;
    identifier?: string;
    totalNet?: { value: number; currency: string };
    totalGross?: { value: number; currency: string };
}

export interface ProcessedUnhandledResource {
    processedType: 'Unhandled';
    originalResourceType: string;
    detail?: string;
}

// Union of all processed types
export type ProcessedFhirResource =
    | ProcessedAttachment
    | ProcessedPatientInfo
    | ProcessedPractitionerInfo
    | ProcessedOrganizationInfo
    | ProcessedObservationResult
    | ProcessedMedicationInfo
    | ProcessedConditionInfo
    | ProcessedProcedureInfo
    | ProcessedEncounterInfo
    | ProcessedImmunizationInfo
    | ProcessedImmunizationRecommendationInfo
    | ProcessedAllergyIntoleranceInfo
    | ProcessedCompositionInfo
    | ProcessedDiagnosticReportInfo
    | ProcessedAppointmentInfo
    | ProcessedCarePlanInfo
    | ProcessedMedicationStatementInfo
    | ProcessedSpecimenInfo
    | ProcessedServiceRequestInfo
    | ProcessedChargeItemInfo
    | ProcessedInvoiceInfo
    | ProcessedUnhandledResource;

// --- The Single Generic Resource Processor ---
export function processFhirResource(resource: R4.IResourceList | undefined | null): ProcessedFhirResource {
    if (!resource || !resource.resourceType) {
        return { processedType: 'Unhandled', originalResourceType: 'Unknown (null or undefined resource)' };
    }

    switch (resource.resourceType) {
        case 'DiagnosticReport':
            const report = resource as R4.IDiagnosticReport;
            return {
                processedType: 'DiagnosticReportInfo',
                test: extractCodeableConceptText(report.code) || '',
                conclusion: report.conclusion || '',
                date: report.effectiveDateTime || ''
            };

        case 'Patient':
            const patient = resource as R4.IPatient;
            return {
                processedType: 'PatientInfo',
                name: getPersonName(patient.name),
                id: patient.id || 'Unknown ID'
            };

        case 'Practitioner':
            const practitioner = resource as R4.IPractitioner;
            return {
                processedType: 'PractitionerInfo',
                name: getPersonName(practitioner.name),
                id: practitioner.id || 'Unknown ID'
            };

        case 'Organization':
            const org = resource as R4.IOrganization;
            return {
                processedType: 'OrganizationInfo',
                name: org.name || 'Unknown Organization',
                id: org.id
            };

        case 'Observation':
            const obs = resource as R4.IObservation;
            let obs_value = '';
            let obs_unit = '';
            let obs_text_display = obs.code?.text || extractCodingDisplay(obs.code?.coding);

            if (obs.valueQuantity) {
                obs_value = obs.valueQuantity.value?.toString() || '';
                obs_unit = obs.valueQuantity.unit || obs.valueQuantity.code || '';
            } else if (obs.valueCodeableConcept) {
                obs_value = extractCodeableConceptText(obs.valueCodeableConcept);
            } else if (obs.valueString) {
                obs_value = obs.valueString;
            } else if (obs.valueBoolean !== undefined) {
                obs_value = obs.valueBoolean.toString();
            } else if (obs.valueInteger !== undefined) {
                obs_value = obs.valueInteger.toString();
            } else if (obs.valueDateTime) {
                obs_value = obs.valueDateTime;
            } // Add other value[x] types as needed

            const obs_components = obs.component?.map(comp => {
                let c_val = '', c_unit = '';
                if (comp.valueQuantity) { c_val = comp.valueQuantity.value?.toString() || ''; c_unit = comp.valueQuantity.unit || ''; }
                else if (comp.valueCodeableConcept) { c_val = extractCodeableConceptText(comp.valueCodeableConcept); }
                // Add other component value types
                return {
                    code: comp.code?.text || extractCodingDisplay(comp.code?.coding) || '',
                    value: c_val,
                    unit: c_unit,
                    text: comp.code?.text || extractCodingDisplay(comp.code?.coding) || ''
                };
            }) || [];

            return {
                processedType: 'ObservationResult',
                code: obs.code?.text || extractCodingDisplay(obs.code?.coding) || '',
                value: obs_value,
                unit: obs_unit,
                date: obs.effectiveDateTime || obs.effectiveInstant || obs.effectivePeriod?.start || '',
                text: obs_text_display,
                components: obs_components,
            };

        case 'MedicationRequest':
            const medReq = resource as R4.IMedicationRequest;
            const medicationName = extractCodeableConceptText(medReq.medicationCodeableConcept) ||
                                   medReq.medicationReference?.display ||
                                   'Unknown Medication';
            const dosageInstruction = medReq.dosageInstruction?.[0];
            let dosageText = dosageInstruction?.text || '';
            let frequencyInfo = '';
            if (dosageInstruction?.timing?.repeat) {
                const repeat = dosageInstruction.timing.repeat;
                frequencyInfo = `${repeat.frequency || ''} per ${repeat.period || ''} ${repeat.periodUnit || ''}`.trim();
            }
             if (!dosageText && dosageInstruction?.doseAndRate?.[0]?.doseQuantity) {
                dosageText = `${dosageInstruction.doseAndRate[0].doseQuantity.value} ${dosageInstruction.doseAndRate[0].doseQuantity.unit}`;
            }
            return {
                processedType: 'MedicationInfo',
                name: medicationName,
                dosage: dosageText,
                frequency: extractCodeableConceptText(dosageInstruction?.timing?.code) || frequencyInfo,
                duration: medReq.dispenseRequest?.validityPeriod?.end || '', // Or expectedSupplyDuration
                status: medReq.status || '',
            };

        case 'Condition':
            const condition = resource as R4.ICondition;
            return {
                processedType: 'ConditionInfo',
                code: extractCodeableConceptText(condition.code) || 'Unknown Condition',
                status: extractCodeableConceptText(condition.clinicalStatus) || extractCodeableConceptText(condition.verificationStatus) || '',
                text: extractCodeableConceptText(condition.code), // Often same as code for simple cases
            };

        case 'Procedure':
            const procedure = resource as R4.IProcedure;
            return {
                processedType: 'ProcedureInfo',
                code: extractCodeableConceptText(procedure.code) || 'Unknown Procedure',
                status: procedure.status || '',
                date: procedure.performedDateTime || procedure.performedPeriod?.start || '',
                text: extractCodeableConceptText(procedure.code),
            };

        case 'Encounter':
            const encounter = resource as R4.IEncounter;
            return {
                processedType: 'EncounterInfo',
                type: encounter.class?.display || encounter.class?.code || extractCodeableConceptText(encounter.type?.[0]) || 'Unknown Encounter Type',
                startDate: encounter.period?.start || '',
                endDate: encounter.period?.end || '',
                date: encounter.period?.start || '', // Often start date is the primary date
                status: encounter.status || '',
            };

        case 'Immunization':
            const immunization = resource as R4.IImmunization;
            return {
                processedType: 'ImmunizationInfo',
                vaccine: extractCodeableConceptText(immunization.vaccineCode) || 'Unknown Vaccine',
                date: immunization.occurrenceDateTime || immunization.occurrenceString || '',
                lotNumber: immunization.lotNumber,
                status: immunization.status || '',
            };

        case 'ImmunizationRecommendation':
            const rec = resource as R4.IImmunizationRecommendation;
            const firstRecommendation = rec.recommendation?.[0];
            return {
                processedType: 'ImmunizationRecommendationInfo',
                vaccine: extractCodeableConceptText(firstRecommendation?.vaccineCode?.[0]) || 'Unknown Vaccine',
                status: extractCodeableConceptText(firstRecommendation?.forecastStatus) || '',
                date: rec.date || '',
            };

        case 'AllergyIntolerance':
            const allergy = resource as R4.IAllergyIntolerance;
            return {
                processedType: 'AllergyIntoleranceInfo',
                substance: extractCodeableConceptText(allergy.code) || 'Unknown Substance',
                severity: allergy.reaction?.[0]?.severity || '',
                status: extractCodeableConceptText(allergy.clinicalStatus) || extractCodeableConceptText(allergy.verificationStatus) || '',
                type: allergy.type || ''
            };

        case 'DocumentReference':
            const docRef = resource as R4.IDocumentReference;
            const content = docRef.content?.[0];
            if (content?.attachment?.data || content?.attachment?.url) {
                return {
                    processedType: 'Attachment',
                    contentType: content.attachment.contentType || 'application/octet-stream',
                    // data: content.attachment.data || `URL: ${content.attachment.url}`, // Using placeholder 'base64PDFDATA' for now if you prefer
                    data: 'base64PDFDATA',
                    title: content.attachment.title || docRef.description || 'Document'
                };
            }
            return { processedType: 'Unhandled', originalResourceType: resource.resourceType, detail: "No attachment data/url in DocumentReference" };

        case 'Binary':
            const binary = resource as R4.IBinary;
            if (binary.data) {
                return {
                    processedType: 'Attachment',
                    contentType: binary.contentType || 'application/octet-stream',
                    // data: binary.data,
                    data: 'base64PDFDATA',
                    title: 'Binary Document' // Binaries usually don't have a descriptive title field like DocumentReference
                };
            }
            return { processedType: 'Unhandled', originalResourceType: resource.resourceType, detail: "No data/url in Binary" };

        case 'Composition':
            const comp = resource as R4.IComposition;
            return {
                processedType: 'CompositionInfo',
                title: comp.title || 'Untitled Document',
                id: comp.id,
                status: comp.status || 'unknown',
                date: comp.date
            };

        case 'Appointment':
            const appointment = resource as R4.IAppointment;
            return {
                processedType: 'AppointmentInfo',
                status: appointment.status || '',
                type: extractCodeableConceptText(appointment.appointmentType) || '',
                description: appointment.description,
                start: appointment.start || '',
                end: appointment.end || '',
                created: appointment.created
            };

        case 'CarePlan':
            const carePlan = resource as R4.ICarePlan;
            return {
                processedType: 'CarePlanInfo',
                status: carePlan.status || '',
                intent: carePlan.intent || '',
                title: carePlan.title || '',
                description: carePlan.description,
                category: extractCodeableConceptText(carePlan.category?.[0])
            };

        case 'MedicationStatement':
            const medStatement = resource as R4.IMedicationStatement;
            return {
                processedType: 'MedicationStatementInfo',
                status: medStatement.status || '',
                medication: extractCodeableConceptText(medStatement.medicationCodeableConcept) || '',
                dateAsserted: medStatement.dateAsserted
            };

        case 'Specimen':
            const specimen = resource as R4.ISpecimen;
            return {
                processedType: 'SpecimenInfo',
                type: extractCodeableConceptText(specimen.type) || '',
                receivedTime: specimen.receivedTime,
                collectionTime: specimen.collection?.collectedDateTime
            };

        case 'ServiceRequest':
            const serviceRequest = resource as R4.IServiceRequest;
            return {
                processedType: 'ServiceRequestInfo',
                status: serviceRequest.status || '',
                intent: serviceRequest.intent || '',
                code: extractCodeableConceptText(serviceRequest.code) || '',
                occurrenceDateTime: serviceRequest.occurrenceDateTime,
                requester: serviceRequest.requester?.display
            };

        case 'ChargeItem':
            const chargeItem = resource as R4.IChargeItem;
            return {
                processedType: 'ChargeItemInfo',
                status: chargeItem.status || '',
                code: extractCodeableConceptText(chargeItem.code) || '',
                quantity: chargeItem.quantity?.value,
                product: extractCodeableConceptText(chargeItem.productCodeableConcept)
            };

        case 'Invoice':
            const invoice = resource as R4.IInvoice;
            return {
                processedType: 'InvoiceInfo',
                status: invoice.status || '',
                type: extractCodeableConceptText(invoice.type) || '',
                date: invoice.date,
                identifier: invoice.identifier?.[0]?.value,
                totalNet: invoice.totalNet ? {
                    value: invoice.totalNet.value || 0,
                    currency: invoice.totalNet.currency || ''
                } : undefined,
                totalGross: invoice.totalGross ? {
                    value: invoice.totalGross.value || 0,
                    currency: invoice.totalGross.currency || ''
                } : undefined
            };

        default:
            // console.warn(`processFhirResource: Unhandled resourceType: ${resource.resourceType}`);
            return { processedType: 'Unhandled', originalResourceType: resource.resourceType };
    }
}