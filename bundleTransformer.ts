import { R4 } from '@ahryman40k/ts-fhir-types';
import { Bundle, BundleEntry } from './bundleAnalyzer.js';

interface Attachment {
    contentType: string;
    data: string;  // base64 data
    title?: string;
}

interface SimplifiedDiagnosticReport {
    test: string;
    conclusion: string;
    doctor: string;
    organization: string;
    date: string;
    attachments: Attachment[];
    observations: Array<{
        code: string;
        value: string;
        unit?: string;
    }>;
}

interface SimplifiedPrescription {
    patient: {
        name: string;
        id: string;
    };
    doctor: {
        name: string;
        id: string;
    };
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
    }>;
    conditions: string[];
    date: string;
    attachments: Attachment[];
}

interface SimplifiedDischargeSummary {
    patient: {
        name: string;
        id: string;
    };
    doctor: {
        name: string;
        id: string;
    };
    organization: string;
    encounter: {
        type: string;
        startDate: string;
        endDate: string;
    };
    conditions: Array<{
        code: string;
        status: string;
    }>;
    procedures: Array<{
        code: string;
        date: string;
    }>;
    medications: Array<{
        name: string;
        status: string;
    }>;
    attachments: Attachment[];
    date: string;
}

interface SimplifiedImmunizationRecord {
    patient: {
        name: string;
        id: string;
    };
    doctor: {
        name: string;
        id: string;
    };
    organization: string;
    immunizations: Array<{
        vaccine: string;
        date: string;
        lotNumber?: string;
        status: string;
    }>;
    recommendations: Array<{
        vaccine: string;
        status: string;
        date: string;
    }>;
    attachments: Attachment[];
}

interface SimplifiedOPConsultNote {
    patient: {
        name: string;
        id: string;
    };
    doctor: {
        name: string;
        id: string;
    };
    organization: string;
    encounter: {
        type: string;
        date: string;
    };
    conditions: Array<{
        code: string;
        status: string;
    }>;
    allergies: Array<{
        substance: string;
        severity: string;
    }>;
    procedures: Array<{
        code: string;
        status: string;
    }>;
    medications: Array<{
        name: string;
        status: string;
    }>;
    attachments: Attachment[];
    date: string;
}

interface SimplifiedWellnessRecord {
    patient: {
        name: string;
        id: string;
    };
    doctor: {
        name: string;
        id: string;
    };
    organization: string;
    observations: Array<{
        code: string;
        value: string;
        unit?: string;
        date: string;
    }>;
    attachments: Attachment[];
    date: string;
}

// Note: Could later be changed to get an array of attachments, it's just that all the examples have a single entry. So, consider this MVP
function extractAttachment(resource: R4.IDocumentReference | R4.IBinary): Attachment | null {
    if (resource.resourceType === 'DocumentReference') {
        const doc = resource as R4.IDocumentReference;
        const content = doc.content?.[0];
        if (content?.attachment?.data) {
            return {
                contentType: content.attachment.contentType || 'application/pdf',
                // data: content.attachment.data,
                data: 'base64PDFDATA',
                title: doc.description
            };
        }
    } else if (resource.resourceType === 'Binary') {
        const binary = resource as R4.IBinary;
        if (binary.data) {
            return {
                contentType: binary.contentType || 'application/pdf',
                // data: binary.data,
                data: 'base64PDFDATA',
                title: 'Binary Document'
            };
        }
    }
    return null;
}

function getPersonName(name?: R4.IHumanName[]): string {
    if (!name || name.length === 0) return '';
    const n = name[0];
    return n.text || `${n.prefix?.[0] || ''} ${n.given?.[0] || ''} ${n.family || ''}`.trim();
}

export function transformDiagnosticReportBundle(bundle: Bundle): SimplifiedDiagnosticReport {
    const result: SimplifiedDiagnosticReport = {
        test: '',
        conclusion: '',
        doctor: '',
        organization: '',
        date: '',
        attachments: [],
        observations: []
    };

    bundle.entry?.forEach((entry: BundleEntry) => {
        if (!entry.resource) return;

        switch (entry.resource.resourceType) {
            case 'DiagnosticReport':
                const report = entry.resource as R4.IDiagnosticReport;
                result.test = report.code?.text || '';
                result.conclusion = report.conclusion || '';
                result.date = report.effectiveDateTime || '';
                break;

            case 'Practitioner':
                const practitioner = entry.resource as R4.IPractitioner;
                result.doctor = getPersonName(practitioner.name);
                break;

            case 'Organization':
                const org = entry.resource as R4.IOrganization;
                result.organization = org.name || '';
                break;

            case 'Observation':
                const obs = entry.resource as R4.IObservation;
                result.observations.push({
                    code: obs.code?.text || '',
                    value: obs.valueQuantity?.value?.toString() || '',
                    unit: obs.valueQuantity?.unit,
                });
                break;

            case 'DocumentReference':
            case 'Binary':
                const attachment = extractAttachment(entry.resource as R4.IDocumentReference | R4.IBinary);
                if (attachment) {
                    result.attachments.push(attachment);
                }
                break;
        }
    });

    return result;
}

export function transformPrescriptionBundle(bundle: Bundle): SimplifiedPrescription {
    const result: SimplifiedPrescription = {
        patient: { name: '', id: '' },
        doctor: { name: '', id: '' },
        medications: [],
        conditions: [],
        date: '',
        attachments: []
    };

    bundle.entry?.forEach((entry: BundleEntry) => {
        if (!entry.resource) return;

        switch (entry.resource.resourceType) {
            case 'Patient':
                const patient = entry.resource as R4.IPatient;
                result.patient = {
                    name: getPersonName(patient.name),
                    id: patient.id || ''
                };
                break;

            case 'Practitioner':
                const practitioner = entry.resource as R4.IPractitioner;
                result.doctor = {
                    name: getPersonName(practitioner.name),
                    id: practitioner.id || ''
                };
                break;

            case 'MedicationRequest':
                const med = entry.resource as R4.IMedicationRequest;
                const timingRepeat = med.dosageInstruction?.[0]?.timing?.repeat;
                const frequencyInfo = timingRepeat ? `${timingRepeat.frequency} for ${timingRepeat.period}/${timingRepeat.periodUnit}` : '';

                result.medications.push({
                    name: med.medicationCodeableConcept?.text || med.medicationCodeableConcept?.coding?.[0]?.display || '',
                    dosage: med.dosageInstruction?.[0]?.text || '',
                    frequency: med.dosageInstruction?.[0]?.timing?.code?.text || frequencyInfo || '',
                    duration: med.dispenseRequest?.validityPeriod?.start || ''
                });
                result.date = med.authoredOn || '';
                break;

            case 'Condition':
                const condition = entry.resource as R4.ICondition;
                result.conditions.push(condition.code?.text || '');
                break;

            case 'DocumentReference':
            case 'Binary':
                const attachment = extractAttachment(entry.resource as R4.IDocumentReference | R4.IBinary);
                if (attachment) {
                    result.attachments.push(attachment);
                }
                break;
        }
    });

    return result;
}

export function transformDischargeSummaryBundle(bundle: Bundle): SimplifiedDischargeSummary {
    const result: SimplifiedDischargeSummary = {
        patient: { name: '', id: '' },
        doctor: { name: '', id: '' },
        organization: '',
        encounter: { type: '', startDate: '', endDate: '' },
        conditions: [],
        procedures: [],
        medications: [],
        attachments: [],
        date: ''
    };

    bundle.entry?.forEach((entry: BundleEntry) => {
        if (!entry.resource) return;

        switch (entry.resource.resourceType) {
            case 'Patient':
                const patient = entry.resource as R4.IPatient;
                result.patient = {
                    name: getPersonName(patient.name),
                    id: patient.id || ''
                };
                break;

            case 'Practitioner':
                const practitioner = entry.resource as R4.IPractitioner;
                result.doctor = {
                    name: getPersonName(practitioner.name),
                    id: practitioner.id || ''
                };
                break;

            case 'Organization':
                const org = entry.resource as R4.IOrganization;
                result.organization = org.name || '';
                break;

            case 'Encounter':
                const encounter = entry.resource as R4.IEncounter;
                result.encounter = {
                    type: encounter.class?.display || '',
                    startDate: encounter.period?.start || '',
                    endDate: encounter.period?.end || ''
                };
                result.date = encounter.period?.end || '';
                break;

            case 'Condition':
                const condition = entry.resource as R4.ICondition;
                result.conditions.push({
                    code: condition.code?.coding?.[0]?.display || '',
                    status: condition.clinicalStatus?.coding?.[0]?.display || ''
                });
                break;

            case 'Procedure':
                const procedure = entry.resource as R4.IProcedure;
                result.procedures.push({
                    code: procedure.code?.text || '',
                    date: procedure.performedDateTime || ''
                });
                break;

            case 'MedicationRequest':
                const med = entry.resource as R4.IMedicationRequest;
                result.medications.push({
                    name: med.medicationCodeableConcept?.coding?.[0]?.display || '',
                    status: med.status || ''
                });
                break;

            case 'DocumentReference':
            case 'Binary':
                const attachment = extractAttachment(entry.resource as R4.IDocumentReference | R4.IBinary);
                if (attachment) {
                    result.attachments.push(attachment);
                }
                break;
        }
    });

    return result;
}

export function transformImmunizationRecordBundle(bundle: Bundle): SimplifiedImmunizationRecord {
    const result: SimplifiedImmunizationRecord = {
        patient: { name: '', id: '' },
        doctor: { name: '', id: '' },
        organization: '',
        immunizations: [],
        recommendations: [],
        attachments: []
    };

    bundle.entry?.forEach((entry: BundleEntry) => {
        if (!entry.resource) return;

        switch (entry.resource.resourceType) {
            case 'Patient':
                const patient = entry.resource as R4.IPatient;
                result.patient = {
                    name: getPersonName(patient.name),
                    id: patient.id || ''
                };
                break;

            case 'Practitioner':
                const practitioner = entry.resource as R4.IPractitioner;
                result.doctor = {
                    name: getPersonName(practitioner.name),
                    id: practitioner.id || ''
                };
                break;

            case 'Organization':
                const org = entry.resource as R4.IOrganization;
                result.organization = org.name || '';
                break;

            case 'Immunization':
                const immunization = entry.resource as R4.IImmunization;
                result.immunizations.push({
                    vaccine: immunization.vaccineCode?.coding?.[0]?.display || '',
                    date: immunization.occurrenceDateTime || '',
                    lotNumber: immunization.lotNumber,
                    status: immunization.status || ''
                });
                break;

            case 'ImmunizationRecommendation':
                const recommendation = entry.resource as R4.IImmunizationRecommendation;
                result.recommendations.push({
                    vaccine: recommendation.recommendation?.[0]?.vaccineCode?.[0]?.coding?.[0]?.display || '',
                    status: recommendation.recommendation?.[0]?.forecastStatus?.text || '',
                    date: recommendation.date || ''
                });
                break;

            case 'DocumentReference':
            case 'Binary':
                const attachment = extractAttachment(entry.resource as R4.IDocumentReference | R4.IBinary);
                if (attachment) {
                    result.attachments.push(attachment);
                }
                break;
        }
    });

    return result;
}

export function transformOPConsultNoteBundle(bundle: Bundle): SimplifiedOPConsultNote {
    const result: SimplifiedOPConsultNote = {
        patient: { name: '', id: '' },
        doctor: { name: '', id: '' },
        organization: '',
        encounter: { type: '', date: '' },
        conditions: [],
        allergies: [],
        procedures: [],
        medications: [],
        attachments: [],
        date: ''
    };

    bundle.entry?.forEach((entry: BundleEntry) => {
        if (!entry.resource) return;

        switch (entry.resource.resourceType) {
            case 'Patient':
                const patient = entry.resource as R4.IPatient;
                result.patient = {
                    name: getPersonName(patient.name),
                    id: patient.id || ''
                };
                break;

            case 'Practitioner':
                const practitioner = entry.resource as R4.IPractitioner;
                result.doctor = {
                    name: getPersonName(practitioner.name),
                    id: practitioner.id || ''
                };
                break;

            case 'Organization':
                const org = entry.resource as R4.IOrganization;
                result.organization = org.name || '';
                break;

            case 'Encounter':
                const encounter = entry.resource as R4.IEncounter;
                result.encounter = {
                    type: encounter.class?.display || '',
                    date: encounter.period?.start || ''
                };
                result.date = encounter.period?.start || '';
                break;

            case 'Condition':
                const condition = entry.resource as R4.ICondition;
                result.conditions.push({
                    code: condition.code?.text || '',
                    status: condition.clinicalStatus?.coding?.[0]?.display || ''
                });
                break;

            case 'AllergyIntolerance':
                const allergy = entry.resource as R4.IAllergyIntolerance;
                result.allergies.push({
                    substance: allergy.code?.coding?.[0]?.display || '',
                    severity: allergy.reaction?.[0]?.severity || ''
                });
                break;

            case 'Procedure':
                const procedure = entry.resource as R4.IProcedure;
                result.procedures.push({
                    code: procedure.code?.text || '',
                    status: procedure.status || ''
                });
                break;

            case 'MedicationRequest':
                const med = entry.resource as R4.IMedicationRequest;
                result.medications.push({
                    name: med.medicationCodeableConcept?.coding?.[0]?.display || '',
                    status: med.status || ''
                });
                break;

            case 'DocumentReference':
            case 'Binary':
                const attachment = extractAttachment(entry.resource as R4.IDocumentReference | R4.IBinary);
                if (attachment) {
                    result.attachments.push(attachment);
                }
                break;
        }
    });

    return result;
}

export function transformWellnessRecordBundle(bundle: Bundle): SimplifiedWellnessRecord {
    const result: SimplifiedWellnessRecord = {
        patient: { name: '', id: '' },
        doctor: { name: '', id: '' },
        organization: '',
        observations: [],
        attachments: [],
        date: ''
    };

    bundle.entry?.forEach((entry: BundleEntry) => {
        if (!entry.resource) return;

        switch (entry.resource.resourceType) {
            case 'Patient':
                const patient = entry.resource as R4.IPatient;
                result.patient = {
                    name: getPersonName(patient.name),
                    id: patient.id || ''
                };
                break;

            case 'Practitioner':
                const practitioner = entry.resource as R4.IPractitioner;
                result.doctor = {
                    name: getPersonName(practitioner.name),
                    id: practitioner.id || ''
                };
                break;

            case 'Organization':
                const org = entry.resource as R4.IOrganization;
                result.organization = org.name || '';
                break;

            case 'Observation':
                const obs = entry.resource as R4.IObservation;
                result.observations.push({
                    code: obs.code?.text || '',
                    value: obs.valueQuantity?.value?.toString() || '',
                    unit: obs.valueQuantity?.unit,
                    date: obs.effectiveDateTime || ''
                });
                if (obs.effectiveDateTime) {
                    result.date = obs.effectiveDateTime;
                }
                break;

            case 'DocumentReference':
            case 'Binary':
                const attachment = extractAttachment(entry.resource as R4.IDocumentReference | R4.IBinary);
                if (attachment) {
                    result.attachments.push(attachment);
                }
                break;
        }
    });

    return result;
}

// Add more transformer functions for other bundle types as needed 