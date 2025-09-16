// fhirResourceProcessor.ts
import { R4 } from '@ahryman40k/ts-fhir-types';
import type { ProcessedFhirResource, ProcessedAttachment } from './fhirResourceTypes.d.ts';

export { ProcessedFhirResource, ProcessedAttachment };

// --- Helper Functions (from previous solution, ensure they are here) ---
export function getPersonName(name?: R4.IHumanName[]): string {
    if (!name || name.length === 0) return 'Unknown';
    const n = name.find(nm => nm.use === 'official') || name[0];
    return n.text || `${n.prefix?.join(' ') || ''} ${n.given?.join(' ') || ''} ${n.family || ''}`.replace(/\s+/g, ' ').trim() || 'Unknown';
}

export function extractCodeableConceptText(concept?: R4.ICodeableConcept | R4.ICodeableConcept[]): string {
    if (!concept) return '';
    if (Array.isArray(concept)) {
        return concept.map(c => extractCodeableConceptText(c)).filter(Boolean)[0] || '';
    }
    return concept.text || concept.coding?.[0]?.display || concept.coding?.[0]?.code || '';
}

export function extractCodingDisplay(coding?: R4.ICoding[]): string {
    if (!coding || coding.length === 0) return '';
    return coding[0].display || coding[0].code || '';
}

export function processIdentifier(identifier?: R4.IIdentifier): { type?: string; value: string; } | undefined {
    if (!identifier) return undefined;
    return {
        type: extractCodeableConceptText(identifier.type),
        value: identifier.value || 'N/A'
    };
}

export function processPeriod(p?: R4.IPeriod): string | undefined {
    if (!p) return undefined;
    const start = p.start ? `From: ${p.start}` : '';
    const end = p.end ? `Until: ${p.end}` : '';
    return [start, end].filter(Boolean).join(' - ') || undefined;
}

export function processQuantity(quantity?: R4.IQuantity | R4.IDuration): string {
    if (!quantity) return '';
    const value = quantity.value?.toString() || '';
    const unit = quantity.unit || quantity.code || '';
    return `${value} ${unit}`.trim();
}

export function processNote(notes?: R4.IAnnotation[]): string[] | undefined {
    if (!notes || notes.length === 0) return undefined;
    return notes.map(n => n.text).filter((text): text is string => !!text);
}

export function processValue(item: R4.IObservation | R4.IObservation_Component): { value: string; unit?: string } {
    if ('valueQuantity' in item && item.valueQuantity) {
        return { value: item.valueQuantity.value?.toString() || '', unit: item.valueQuantity.unit || item.valueQuantity.code };
    }
    if ('valueCodeableConcept' in item && item.valueCodeableConcept) {
        return { value: extractCodeableConceptText(item.valueCodeableConcept) };
    }
    if ('valueString' in item && item.valueString) {
        return { value: item.valueString };
    }
    if ('valueBoolean' in item && item.valueBoolean !== undefined) {
        return { value: item.valueBoolean.toString() };
    }
    if ('valueInteger' in item && item.valueInteger !== undefined) {
        return { value: item.valueInteger.toString() };
    }
    if ('valueDateTime' in item && item.valueDateTime) {
        return { value: item.valueDateTime };
    }
    if ('valuePeriod' in item && item.valuePeriod) {
        return { value: `from ${item.valuePeriod.start || '?'} to ${item.valuePeriod.end || '?'}` };
    }
    if ('valueRange' in item && item.valueRange) {
        return { value: `${processQuantity(item.valueRange.low)} - ${processQuantity(item.valueRange.high)}`};
    }
    if ('valueRatio' in item && item.valueRatio) {
        const numerator = processQuantity(item.valueRatio.numerator);
        const denominator = processQuantity(item.valueRatio.denominator);
        return { value: `${numerator} / ${denominator}`};
    }
    return { value: 'No value found' };
}

export function processEventTiming(resource: { [key: string]: any }, prefix: 'onset' | 'abatement' | 'performed' | 'occurrence'): string | undefined {
    if (resource[`${prefix}DateTime`]) return resource[`${prefix}DateTime`];
    if (resource[`${prefix}Period`]) return `From: ${resource[`${prefix}Period`].start || '?'} To: ${resource[`${prefix}Period`].end || '?'}`;
    if (resource[`${prefix}String`]) return resource[`${prefix}String`];
    if (resource[`${prefix}Age`]) return processQuantity(resource[`${prefix}Age`]);
    if (resource[`${prefix}Timing`]) return 'Complex timing schedule'; // Simplify complex timings
    return undefined;
}

export function processAddress(address?: R4.IAddress): string | undefined {
    if (!address) return undefined;
    const parts = [
        ...(address.line || []),
        address.city,
        address.state,
        address.postalCode,
        address.country
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : address.text;
}

export function processCommunication(communication?: R4.IPatient_Communication): string | undefined {
    if (!communication) return undefined;
    const parts = [
        extractCodeableConceptText(communication.language),
        communication.preferred ? '(Preferred)' : ''
    ].filter(Boolean);
    return parts.length ? parts.join(' ') : undefined;
}

export function processTelecom(telecom?: R4.IContactPoint): string | undefined {
    if (!telecom) return undefined;
    const parts = [
        telecom.value,
        telecom.use ? `(${telecom.use})` : ''
    ].filter(Boolean);
    return parts.length ? parts.join(' ') : undefined;
}

export function processReferenceRange(range?: R4.IObservation_ReferenceRange[]): string[] | undefined {
    if (!range || range.length === 0) return undefined;
    const processed = range.map(r => {
        if (r.text) return r.text;
        const low = r.low ? processQuantity(r.low) : '';
        const high = r.high ? processQuantity(r.high) : '';
        const type = extractCodeableConceptText(r.type);
        let rangeText = '';
        if (low && high) rangeText = `${low} - ${high}`;
        else if (low) rangeText = `> ${low}`;
        else if (high) rangeText = `< ${high}`;
        return [type, rangeText].filter(Boolean).join(': ');
    }).filter((s): s is string => !!s);
    return processed.length > 0 ? processed : undefined;
}

export function processTiming(timing?: R4.ITiming): string | undefined {
    if (!timing) return undefined;
    const parts = [
        timing.event ? timing.event.join(', ') : '',
        timing.repeat ? `Repeat: ${timing.repeat.frequency} times per ${timing.repeat.period} ${timing.repeat.periodUnit}` : ''
    ].filter(Boolean);
    return parts.length ? parts.join(' ') : undefined;
}

export function processMoney(money?: R4.IMoney): string | undefined {
    if (!money || money.value === undefined) return undefined;
    return `${money.value.toFixed(2)} ${money.currency || ''}`.trim();
}

export function processRatio(ratio?: R4.IRatio): string | undefined {
    if (!ratio) return undefined;
    const numerator = processQuantity(ratio.numerator);
    const denominator = processQuantity(ratio.denominator);
    if (!numerator || !denominator) return undefined;
    return `${numerator} / ${denominator}`;
}

// --- The Single Generic Resource Processor ---
export function processFhirResource(resource: R4.IResourceList | undefined | null, fullUrl?: string): ProcessedFhirResource {
    if (!resource || !resource.resourceType) {
        return { processedType: 'Unhandled', originalResourceType: 'Unknown (null or undefined resource)' };
    }

    switch (resource.resourceType) {
        case 'DiagnosticReport':
            const report = resource as R4.IDiagnosticReport;
            return {
                processedType: 'DiagnosticReportInfo',
                status: report.status || '',
                identifier: report.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                category: report.category?.map(c => extractCodeableConceptText(c)) || [],
                code: extractCodeableConceptText(report.code) || '',
                effectiveDateTime: report.effectiveDateTime || '', // Left as is per request
                issued: report.issued || '',
                conclusion: report.conclusion || '',
                subject: report.subject,
                performer: report.performer,
                resultsInterpreter: report.resultsInterpreter,
                specimen: report.specimen,
                result: report.result,
                basedOn: report.basedOn,
                fullUrl
            };

        case 'Patient':
            const patient = resource as R4.IPatient;
            return {
                processedType: 'PatientInfo',
                name: getPersonName(patient.name),
                id: patient.id || 'Unknown ID',
                telecom: patient.telecom?.map(processTelecom).filter((t): t is string => !!t),
                gender: patient.gender,
                birthDate: patient.birthDate,
                address: patient.address?.map(processAddress).filter((a): a is string => !!a),
                communication: patient.communication?.map(processCommunication).filter((c): c is string => !!c),
                fullUrl
            };

        case 'Practitioner':
            const practitioner = resource as R4.IPractitioner;
            return {
                processedType: 'PractitionerInfo',
                name: getPersonName(practitioner.name),
                id: practitioner.id || 'Unknown ID',
                identifier: practitioner.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                telecom: practitioner.telecom?.map(processTelecom).filter((t): t is string => !!t),
                gender: practitioner.gender,
                birthDate: practitioner.birthDate,
                address: practitioner.address?.map(processAddress).filter((a): a is string => !!a),
                qualification: practitioner.qualification?.map(q => ({
                    code: extractCodeableConceptText(q.code),
                    issuer: q.issuer, // R4.IReference
                    period: processPeriod(q.period)
                })),
                active: practitioner.active,
                fullUrl
            };

        case 'Organization':
            const org = resource as R4.IOrganization;
            return {
                processedType: 'OrganizationInfo',
                name: org.name || '',
                id: org.id,
                identifier: org.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                telecom: org.telecom?.map(processTelecom).filter((t): t is string => !!t),
                address: org.address?.map(processAddress).filter((a): a is string => !!a),
                type: org.type?.map(t => extractCodeableConceptText(t)),
                active: org.active,
                partOf: org.partOf,
                endpoint: org.endpoint,
                fullUrl
            };

        case 'Observation':
            const obs = resource as R4.IObservation;
            const { value: obs_value, unit: obs_unit } = processValue(obs);
            return {
                processedType: 'ObservationResult',
                code: extractCodeableConceptText(obs.code),
                value: obs_value,
                unit: obs_unit,
                effectiveDateTime: obs.effectiveDateTime, // Left as is per request
                effectiveInstant: obs.effectiveInstant, // Left as is per request
                effectivePeriod: obs.effectivePeriod, // Left as is per request
                issued: obs.issued,
                text: obs.code?.text || extractCodeableConceptText(obs.code),
                status: obs.status,
                category: obs.category?.map(c => extractCodeableConceptText(c)),
                interpretation: obs.interpretation?.map(i => extractCodeableConceptText(i)),
                referenceRange: processReferenceRange(obs.referenceRange),
                components: obs.component?.map(comp => ({
                    code: extractCodeableConceptText(comp.code),
                    ...processValue(comp), // returns { value, unit? }
                    referenceRange: processReferenceRange(comp.referenceRange),
                })),
                subject: obs.subject,
                encounter: obs.encounter,
                performer: obs.performer,
                specimen: obs.specimen,
                device: obs.device,
                basedOn: obs.basedOn,
                partOf: obs.partOf,
                hasMember: obs.hasMember,
                derivedFrom: obs.derivedFrom,
                fullUrl
            };

        case 'MedicationRequest':
            const medReq = resource as R4.IMedicationRequest;
            return {
                processedType: 'MedicationInfo',
                name: extractCodeableConceptText(medReq.medicationCodeableConcept) || medReq.medicationReference?.display || 'Unknown Medication',
                status: medReq.status || '',
                intent: medReq.intent || '',
                category: medReq.category?.map(c => extractCodeableConceptText(c)) || [],
                priority: medReq.priority || '',
                dosageInstruction: medReq.dosageInstruction?.map(d => ({
                    text: d.text,
                    additionalInstruction: d.additionalInstruction?.map(i => extractCodeableConceptText(i)),
                    timing: processTiming(d.timing),
                    route: extractCodeableConceptText(d.route),
                    method: extractCodeableConceptText(d.method),
                    doseAndRate: d.doseAndRate?.map(dr => ({
                        dose: processQuantity(dr.doseQuantity) || `${processQuantity(dr.doseRange?.low)} - ${processQuantity(dr.doseRange?.high)}`,
                        rate: processQuantity(dr.rateQuantity) || processRatio(dr.rateRatio)
                    }))
                })),
                dispenseRequest: medReq.dispenseRequest ? {
                    validityPeriod: processPeriod(medReq.dispenseRequest.validityPeriod),
                    numberOfRepeatsAllowed: medReq.dispenseRequest.numberOfRepeatsAllowed,
                    quantity: processQuantity(medReq.dispenseRequest.quantity),
                    expectedSupplyDuration: processQuantity(medReq.dispenseRequest.expectedSupplyDuration)
                } : undefined,
                authoredOn: medReq.authoredOn || '',
                reasonCode: medReq.reasonCode?.map(r => extractCodeableConceptText(r)) || [],
                reasonReference: medReq.reasonReference,
                note: processNote(medReq.note),
                substitution: medReq.substitution ? {
                    allowed: medReq.substitution.allowedBoolean || extractCodeableConceptText(medReq.substitution.allowedCodeableConcept) || false,
                    reason: extractCodeableConceptText(medReq.substitution.reason)
                } : undefined,
                priorPrescription: medReq.priorPrescription,
                supportingInformation: medReq.supportingInformation,
                subject: medReq.subject,
                encounter: medReq.encounter,
                requester: medReq.requester,
                performer: medReq.performer,
                recorder: medReq.recorder,
                basedOn: medReq.basedOn,
                groupIdentifier: processIdentifier(medReq.groupIdentifier),
                courseOfTherapyType: extractCodeableConceptText(medReq.courseOfTherapyType),
                insurance: medReq.insurance,
                fullUrl
            };

        case 'Condition':
            const condition = resource as R4.ICondition;
            return {
                processedType: 'ConditionInfo',
                code: extractCodeableConceptText(condition.code) || 'Unknown Condition',
                clinicalStatus: extractCodeableConceptText(condition.clinicalStatus) || '',
                verificationStatus: extractCodeableConceptText(condition.verificationStatus) || '',
                category: condition.category?.map(c => extractCodeableConceptText(c)) || [],
                severity: extractCodeableConceptText(condition.severity),
                bodySite: condition.bodySite?.map(s => extractCodeableConceptText(s)) || [],
                recordedDate: condition.recordedDate,
                note: processNote(condition.note),
                evidence: condition.evidence?.map(e => extractCodeableConceptText(e.code)) || [],
                onset: processEventTiming(condition, 'onset'),
                abatement: processEventTiming(condition, 'abatement'),
                stage: condition.stage?.[0] ? {
                    summary: extractCodeableConceptText(condition.stage[0].summary),
                    assessment: condition.stage[0].assessment
                } : undefined,
                subject: condition.subject,
                encounter: condition.encounter,
                asserter: condition.asserter,
                recorder: condition.recorder,
                identifier: condition.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i)
            };

        case 'Procedure':
            const procedure = resource as R4.IProcedure;
            return {
                processedType: 'ProcedureInfo',
                code: extractCodeableConceptText(procedure.code) || 'Unknown Procedure',
                status: procedure.status || '',
                statusReason: extractCodeableConceptText(procedure.statusReason),
                category: extractCodeableConceptText(procedure.category),
                performed: processEventTiming(procedure, 'performed'),
                outcome: extractCodeableConceptText(procedure.outcome),
                complication: procedure.complication?.map(c => extractCodeableConceptText(c)) || [],
                followUp: procedure.followUp?.map(f => extractCodeableConceptText(f)) || [],
                bodySite: procedure.bodySite?.map(s => extractCodeableConceptText(s)) || [],
                reasonCode: procedure.reasonCode?.map(r => extractCodeableConceptText(r)) || [],
                instantiatesCanonical: procedure.instantiatesCanonical,
                instantiatesUri: procedure.instantiatesUri,
                usedCode: procedure.usedCode?.map(u => extractCodeableConceptText(u)) || [],
                note: processNote(procedure.note),
                subject: procedure.subject,
                encounter: procedure.encounter,
                recorder: procedure.recorder,
                asserter: procedure.asserter,
                performer: procedure.performer?.map(p => ({
                    actor: p.actor,
                    function: extractCodeableConceptText(p.function)
                })),
                location: procedure.location,
                basedOn: procedure.basedOn,
                usedReference: procedure.usedReference,
                identifier: procedure.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                report: procedure.report
            };

        case 'Encounter':
            const encounter = resource as R4.IEncounter;
            return {
                processedType: 'EncounterInfo',
                type: encounter.type?.map(t => extractCodeableConceptText(t)).join(', ') || 'Unknown Encounter Type',
                period: processPeriod(encounter.period),
                status: encounter.status || '',
                class: extractCodingDisplay(encounter.class ? [encounter.class] : []),
                identifier: encounter.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                subject: encounter.subject,
                hospitalization: encounter.hospitalization ? {
                    preAdmissionIdentifier: processIdentifier(encounter.hospitalization.preAdmissionIdentifier),
                    origin: encounter.hospitalization.origin,
                    admitSource: extractCodeableConceptText(encounter.hospitalization.admitSource),
                    reAdmission: extractCodeableConceptText(encounter.hospitalization.reAdmission),
                    dietPreference: encounter.hospitalization.dietPreference?.map(d => extractCodeableConceptText(d)),
                    specialCourtesy: encounter.hospitalization.specialCourtesy?.map(s => extractCodeableConceptText(s)),
                    specialArrangement: encounter.hospitalization.specialArrangement?.map(s => extractCodeableConceptText(s)),
                    destination: encounter.hospitalization.destination,
                    dischargeDisposition: extractCodeableConceptText(encounter.hospitalization.dischargeDisposition),
                } : undefined,
                diagnosis: encounter.diagnosis?.map(d => ({
                    condition: d.condition,
                    use: extractCodeableConceptText(d.use)
                })),
                serviceProvider: encounter.serviceProvider,
                participant: encounter.participant?.map(p => ({
                    type: p.type?.map(t => extractCodeableConceptText(t)),
                    actor: p.individual,
                    period: processPeriod(p.period)
                })).filter(p => p.actor !== undefined),
                reasonCode: encounter.reasonCode?.map(r => extractCodeableConceptText(r)),
                reasonReference: encounter.reasonReference,
                location: encounter.location?.map(l => ({
                    location: l.location,
                    status: l.status,
                    physicalType: extractCodeableConceptText(l.physicalType),
                    period: processPeriod(l.period)
                })),
                fullUrl
            };

        case 'Immunization':
            const immunization = resource as R4.IImmunization;
            return {
                processedType: 'ImmunizationInfo',
                identifier: immunization.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                status: immunization.status || '',
                statusReason: extractCodeableConceptText(immunization.statusReason),
                vaccineCode: extractCodeableConceptText(immunization.vaccineCode) || 'Unknown Vaccine',
                patient: immunization.patient,
                encounter: immunization.encounter,
                occurrence: processEventTiming(immunization, 'occurrence'),
                recorded: immunization.recorded,
                primarySource: immunization.primarySource || false,
                reportOrigin: extractCodeableConceptText(immunization.reportOrigin),
                location: immunization.location,
                manufacturer: immunization.manufacturer,
                lotNumber: immunization.lotNumber,
                expirationDate: immunization.expirationDate,
                site: extractCodeableConceptText(immunization.site),
                route: extractCodeableConceptText(immunization.route),
                doseQuantity: processQuantity(immunization.doseQuantity),
                performer: immunization.performer?.map(p => ({
                    actor: p.actor,
                    function: extractCodeableConceptText(p.function)
                })),
                note: processNote(immunization.note),
                reasonCode: immunization.reasonCode?.map(r => extractCodeableConceptText(r)),
                reasonReference: immunization.reasonReference,
                isSubpotent: immunization.isSubpotent,
                programEligibility: immunization.programEligibility?.map(e => extractCodeableConceptText(e)),
                fundingSource: extractCodeableConceptText(immunization.fundingSource),
                reaction: immunization.reaction?.map(r => ({
                    date: r.date,
                    detail: r.detail,
                    reported: r.reported || false
                })),
                protocolApplied: immunization.protocolApplied?.map(p => ({
                    series: p.series,
                    authority: p.authority,
                    targetDisease: p.targetDisease?.map(d => extractCodeableConceptText(d)),
                    doseNumber: p.doseNumberString || p.doseNumberPositiveInt?.toString(),
                    seriesDoses: p.seriesDosesString || p.seriesDosesPositiveInt?.toString()
                }))
            };

        case 'ImmunizationRecommendation':
            const rec = resource as R4.IImmunizationRecommendation;
            return {
                processedType: 'ImmunizationRecommendationInfo',
                identifier: rec.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                patient: rec.patient,
                date: rec.date || '',
                authority: rec.authority,
                recommendations: rec.recommendation?.map(r => ({
                    vaccineCode: r.vaccineCode?.map(v => extractCodeableConceptText(v)),
                    targetDisease: extractCodeableConceptText(r.targetDisease),
                    contraindicatedVaccineCode: r.contraindicatedVaccineCode?.map(v => extractCodeableConceptText(v)),
                    forecastStatus: extractCodeableConceptText(r.forecastStatus) || '',
                    forecastReason: r.forecastReason?.map(fr => extractCodeableConceptText(fr)),
                    dateCriterion: r.dateCriterion?.map(dc => ({
                        code: extractCodeableConceptText(dc.code) || '',
                        value: dc.value || ''
                    })),
                    description: r.description,
                    series: r.series,
                    doseNumber: r.doseNumberString || r.doseNumberPositiveInt?.toString(),
                    seriesDoses: r.seriesDosesString || r.seriesDosesPositiveInt?.toString(),
                    supportingImmunization: r.supportingImmunization,
                    supportingPatientInformation: r.supportingPatientInformation
                })) || []
            };

        case 'AllergyIntolerance':
            const allergy = resource as R4.IAllergyIntolerance;
            return {
                processedType: 'AllergyIntoleranceInfo',
                identifier: allergy.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                clinicalStatus: extractCodeableConceptText(allergy.clinicalStatus) || '',
                verificationStatus: extractCodeableConceptText(allergy.verificationStatus) || '',
                type: allergy.type || '',
                category: allergy.category || [],
                criticality: allergy.criticality || '',
                code: extractCodeableConceptText(allergy.code) || 'Unknown Substance',
                patient: allergy.patient,
                encounter: allergy.encounter,
                onset: processEventTiming(allergy, 'onset'),
                recordedDate: allergy.recordedDate,
                recorder: allergy.recorder,
                asserter: allergy.asserter,
                lastOccurrence: allergy.lastOccurrence,
                note: processNote(allergy.note),
                reaction: allergy.reaction?.map(r => ({
                    substance: extractCodeableConceptText(r.substance),
                    manifestation: r.manifestation?.map(m => extractCodeableConceptText(m)).filter(Boolean) || [],
                    description: r.description,
                    onset: r.onset,
                    severity: r.severity || '',
                    exposureRoute: extractCodeableConceptText(r.exposureRoute),
                    note: processNote(r.note)
                })) || []
            };

        case 'DocumentReference':
            const docRef = resource as R4.IDocumentReference;
            const content = docRef.content?.[0];
            if (content?.attachment?.data || content?.attachment?.url) {
                return {
                    processedType: 'Attachment',
                    contentType: content.attachment.contentType || 'application/octet-stream',
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
                    data: 'base64PDFDATA',
                    title: 'Binary Document'
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
                type: extractCodeableConceptText(comp.type) || '',
                category: comp.category?.map(c => extractCodeableConceptText(c)) || [],
                subject: comp.subject,
                encounter: comp.encounter,
                date: comp.date,
                author: comp.author,
                confidentiality: comp.confidentiality || '',
                attester: comp.attester?.map(a => ({
                    mode: a.mode || '',
                    time: a.time,
                    party: a.party
                })) || [],
                custodian: comp.custodian,
                event: comp.event?.map(e => ({
                    code: e.code?.map(c => extractCodeableConceptText(c)) || [],
                    period: processPeriod(e.period),
                    detail: e.detail
                })) || [],
                section: comp.section?.map(s => ({
                    title: s.title || '',
                    code: extractCodeableConceptText(s.code),
                    text: s.text?.div || '',
                    entry: s.entry
                })) || [],
                fullUrl
            };
            
        case 'Appointment':
            const appointment = resource as R4.IAppointment;
            return {
                processedType: 'AppointmentInfo',
                identifier: appointment.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                status: appointment.status || '',
                cancelationReason: extractCodeableConceptText(appointment.cancelationReason),
                serviceCategory: appointment.serviceCategory?.map(c => extractCodeableConceptText(c)),
                serviceType: appointment.serviceType?.map(t => extractCodeableConceptText(t)),
                specialty: appointment.specialty?.map(s => extractCodeableConceptText(s)),
                appointmentType: extractCodeableConceptText(appointment.appointmentType),
                reasonCode: appointment.reasonCode?.map(r => extractCodeableConceptText(r)),
                reasonReference: appointment.reasonReference,
                priority: appointment.priority,
                description: appointment.description,
                supportingInformation: appointment.supportingInformation,
                start: appointment.start || '',
                end: appointment.end || '',
                minutesDuration: appointment.minutesDuration,
                slot: appointment.slot,
                created: appointment.created,
                comment: appointment.comment,
                patientInstruction: appointment.patientInstruction,
                basedOn: appointment.basedOn,
                participant: appointment.participant?.map(p => ({
                    actor: p.actor,
                    required: p.required || '',
                    status: p.status || '',
                    type: p.type?.map(t => extractCodeableConceptText(t)),
                    period: processPeriod(p.period)
                })) || [],
                requestedPeriod: appointment.requestedPeriod?.map(rp => processPeriod(rp))
            };

        case 'CarePlan':
            const carePlan = resource as R4.ICarePlan;
            return {
                processedType: 'CarePlanInfo',
                identifier: carePlan.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                basedOn: carePlan.basedOn,
                replaces: carePlan.replaces,
                partOf: carePlan.partOf,
                status: carePlan.status || '',
                intent: carePlan.intent || '',
                category: carePlan.category?.map(c => extractCodeableConceptText(c)),
                title: carePlan.title || '',
                description: carePlan.description,
                subject: carePlan.subject,
                encounter: carePlan.encounter,
                period: processPeriod(carePlan.period),
                created: carePlan.created,
                author: carePlan.author,
                contributor: carePlan.contributor,
                careTeam: carePlan.careTeam,
                addresses: carePlan.addresses,
                supportingInfo: carePlan.supportingInfo,
                goal: carePlan.goal,
                activity: carePlan.activity?.map(a => ({
                    outcomeCodeableConcept: a.outcomeCodeableConcept?.map(oc => extractCodeableConceptText(oc)),
                    outcomeReference: a.outcomeReference,
                    progress: processNote(a.progress),
                    reference: a.reference,
                    detail: a.detail ? {
                        kind: a.detail.kind,
                        instantiatesCanonical: a.detail.instantiatesCanonical,
                        instantiatesUri: a.detail.instantiatesUri,
                        code: extractCodeableConceptText(a.detail.code),
                        reasonCode: a.detail.reasonCode?.map(rc => extractCodeableConceptText(rc)),
                        reasonReference: a.detail.reasonReference,
                        goal: a.detail.goal,
                        status: a.detail.status || '',
                        statusReason: extractCodeableConceptText(a.detail.statusReason),
                        doNotPerform: a.detail.doNotPerform,
                        scheduled: a.detail.scheduledTiming ? processTiming(a.detail.scheduledTiming) : a.detail.scheduledPeriod ? processPeriod(a.detail.scheduledPeriod) : a.detail.scheduledString,
                        location: a.detail.location,
                        performer: a.detail.performer,
                        product: extractCodeableConceptText(a.detail.productCodeableConcept) || a.detail.productReference,
                        dailyAmount: processQuantity(a.detail.dailyAmount),
                        quantity: processQuantity(a.detail.quantity),
                        description: a.detail.description
                    } : undefined
                })) || [],
                note: processNote(carePlan.note),
            };

        case 'MedicationStatement':
            const medStatement = resource as R4.IMedicationStatement;
            return {
                processedType: 'MedicationStatementInfo',
                identifier: medStatement.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                basedOn: medStatement.basedOn,
                partOf: medStatement.partOf,
                status: medStatement.status || '',
                statusReason: medStatement.statusReason?.map(r => extractCodeableConceptText(r)),
                category: extractCodeableConceptText(medStatement.category),
                medication: extractCodeableConceptText(medStatement.medicationCodeableConcept) || medStatement.medicationReference,
                subject: medStatement.subject,
                context: medStatement.context,
                effective: medStatement.effectiveDateTime || processPeriod(medStatement.effectivePeriod),
                dateAsserted: medStatement.dateAsserted,
                informationSource: medStatement.informationSource,
                derivedFrom: medStatement.derivedFrom,
                reasonCode: medStatement.reasonCode?.map(r => extractCodeableConceptText(r)),
                reasonReference: medStatement.reasonReference,
                note: processNote(medStatement.note),
                dosage: medStatement.dosage?.map(d => ({
                    sequence: d.sequence,
                    text: d.text,
                    additionalInstruction: d.additionalInstruction?.map(i => extractCodeableConceptText(i)),
                    patientInstruction: d.patientInstruction,
                    timing: processTiming(d.timing),
                    asNeeded: d.asNeededBoolean !== undefined ? d.asNeededBoolean.toString() : extractCodeableConceptText(d.asNeededCodeableConcept),
                    site: extractCodeableConceptText(d.site),
                    route: extractCodeableConceptText(d.route),
                    method: extractCodeableConceptText(d.method),
                    doseAndRate: d.doseAndRate?.map(dr => ({
                        type: extractCodeableConceptText(dr.type),
                        dose: processQuantity(dr.doseQuantity) || `${processQuantity(dr.doseRange?.low)} - ${processQuantity(dr.doseRange?.high)}`,
                        rate: processRatio(dr.rateRatio) || processQuantity(dr.rateQuantity)
                    }))
                }))
            };

        case 'Specimen':
            const specimen = resource as R4.ISpecimen;
            return {
                processedType: 'SpecimenInfo',
                identifier: specimen.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                accessionIdentifier: processIdentifier(specimen.accessionIdentifier),
                status: specimen.status,
                type: extractCodeableConceptText(specimen.type) || '',
                subject: specimen.subject,
                parent: specimen.parent,
                request: specimen.request,
                collection: specimen.collection ? {
                    collector: specimen.collection.collector,
                    collected: specimen.collection.collectedDateTime || processPeriod(specimen.collection.collectedPeriod),
                    duration: processQuantity(specimen.collection.duration),
                    quantity: processQuantity(specimen.collection.quantity),
                    method: extractCodeableConceptText(specimen.collection.method),
                    bodySite: extractCodeableConceptText(specimen.collection.bodySite),
                    fastingStatus: extractCodeableConceptText(specimen.collection.fastingStatusCodeableConcept) || processQuantity(specimen.collection.fastingStatusDuration)
                } : undefined,
                receivedTime: specimen.receivedTime,
                processing: specimen.processing?.map(p => ({
                    description: p.description,
                    procedure: extractCodeableConceptText(p.procedure),
                    additive: p.additive,
                    time: p.timeDateTime || processPeriod(p.timePeriod)
                })),
                container: specimen.container?.map(c => ({
                    identifier: c.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                    description: c.description,
                    type: extractCodeableConceptText(c.type),
                    capacity: processQuantity(c.capacity),
                    specimenQuantity: processQuantity(c.specimenQuantity),
                    additive: extractCodeableConceptText(c.additiveCodeableConcept) || c.additiveReference,
                })),
                condition: specimen.condition?.map(c => extractCodeableConceptText(c)),
                note: processNote(specimen.note)
            };

        case 'ServiceRequest':
            const serviceRequest = resource as R4.IServiceRequest;
            return {
                processedType: 'ServiceRequestInfo',
                identifier: serviceRequest.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                instantiatesCanonical: serviceRequest.instantiatesCanonical,
                instantiatesUri: serviceRequest.instantiatesUri,
                basedOn: serviceRequest.basedOn,
                replaces: serviceRequest.replaces,
                requisition: processIdentifier(serviceRequest.requisition),
                status: serviceRequest.status || '',
                intent: serviceRequest.intent || '',
                category: serviceRequest.category?.map(c => extractCodeableConceptText(c)),
                priority: serviceRequest.priority || '',
                doNotPerform: serviceRequest.doNotPerform,
                code: extractCodeableConceptText(serviceRequest.code) || '',
                orderDetail: serviceRequest.orderDetail?.map(d => extractCodeableConceptText(d)),
                quantity: processQuantity(serviceRequest.quantityQuantity) || processRatio(serviceRequest.quantityRatio) || `${processQuantity(serviceRequest.quantityRange?.low)} - ${processQuantity(serviceRequest.quantityRange?.high)}`,
                subject: serviceRequest.subject,
                encounter: serviceRequest.encounter,
                occurrence: serviceRequest.occurrenceDateTime || processPeriod(serviceRequest.occurrencePeriod) || processTiming(serviceRequest.occurrenceTiming),
                asNeeded: serviceRequest.asNeededBoolean !== undefined ? serviceRequest.asNeededBoolean.toString() : extractCodeableConceptText(serviceRequest.asNeededCodeableConcept),
                authoredOn: serviceRequest.authoredOn,
                requester: serviceRequest.requester,
                performerType: extractCodeableConceptText(serviceRequest.performerType),
                performer: serviceRequest.performer,
                locationCode: serviceRequest.locationCode?.map(l => extractCodeableConceptText(l)),
                locationReference: serviceRequest.locationReference,
                reasonCode: serviceRequest.reasonCode?.map(r => extractCodeableConceptText(r)),
                reasonReference: serviceRequest.reasonReference,
                insurance: serviceRequest.insurance,
                supportingInfo: serviceRequest.supportingInfo,
                specimen: serviceRequest.specimen,
                bodySite: serviceRequest.bodySite?.map(s => extractCodeableConceptText(s)),
                note: processNote(serviceRequest.note),
                patientInstruction: serviceRequest.patientInstruction,
                relevantHistory: serviceRequest.relevantHistory
            };

        case 'ChargeItem':
            const chargeItem = resource as R4.IChargeItem;
            return {
                processedType: 'ChargeItemInfo',
                identifier: chargeItem.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                definitionUri: chargeItem.definitionUri,
                definitionCanonical: chargeItem.definitionCanonical,
                status: chargeItem.status || '',
                partOf: chargeItem.partOf,
                code: extractCodeableConceptText(chargeItem.code) || '',
                subject: chargeItem.subject,
                context: chargeItem.context,
                occurrence: chargeItem.occurrenceDateTime || processPeriod(chargeItem.occurrencePeriod) || processTiming(chargeItem.occurrenceTiming),
                performer: chargeItem.performer?.map(p => ({
                    function: extractCodeableConceptText(p.function),
                    actor: p.actor
                })),
                performingOrganization: chargeItem.performingOrganization,
                requestingOrganization: chargeItem.requestingOrganization,
                costCenter: chargeItem.costCenter,
                quantity: processQuantity(chargeItem.quantity),
                bodysite: chargeItem.bodysite?.map(b => extractCodeableConceptText(b)),
                factorOverride: chargeItem.factorOverride,
                priceOverride: processMoney(chargeItem.priceOverride),
                overrideReason: chargeItem.overrideReason,
                enterer: chargeItem.enterer,
                enteredDate: chargeItem.enteredDate,
                reason: chargeItem.reason?.map(r => extractCodeableConceptText(r)),
                service: chargeItem.service,
                product: chargeItem.productReference || extractCodeableConceptText(chargeItem.productCodeableConcept),
                account: chargeItem.account,
                note: processNote(chargeItem.note),
                supportingInformation: chargeItem.supportingInformation
            };

        case 'Invoice':
            const invoice = resource as R4.IInvoice;
            return {
                processedType: 'InvoiceInfo',
                identifier: invoice.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                status: invoice.status || '',
                cancelledReason: invoice.cancelledReason,
                type: extractCodeableConceptText(invoice.type),
                subject: invoice.subject,
                recipient: invoice.recipient,
                date: invoice.date,
                participant: invoice.participant?.map(p => ({
                    role: extractCodeableConceptText(p.role),
                    actor: p.actor
                })),
                issuer: invoice.issuer,
                account: invoice.account,
                lineItems: invoice.lineItem?.map(item => ({
                    sequence: item.sequence,
                    chargeItem: item.chargeItemReference || extractCodeableConceptText(item.chargeItemCodeableConcept),
                    priceComponent: item.priceComponent?.map(pc => ({
                        type: pc.type,
                        code: extractCodeableConceptText(pc.code),
                        factor: pc.factor,
                        amount: processMoney(pc.amount)
                    }))
                })),
                totalPriceComponent: invoice.totalPriceComponent?.map(pc => ({
                    type: pc.type,
                    code: extractCodeableConceptText(pc.code),
                    factor: pc.factor,
                    amount: processMoney(pc.amount)
                })),
                totalNet: processMoney(invoice.totalNet),
                totalGross: processMoney(invoice.totalGross),
                paymentTerms: invoice.paymentTerms,
                note: processNote(invoice.note),
                fullUrl
            };

        case 'Medication':
            const medication = resource as R4.IMedication;
            return {
                processedType: 'Medication',
                identifier: medication.identifier?.map(processIdentifier).filter((i): i is { type?: string; value: string; } => !!i),
                code: extractCodeableConceptText(medication.code),
                status: medication.status,
                manufacturer: medication.manufacturer,
                form: extractCodeableConceptText(medication.form),
                amount: processRatio(medication.amount),
                ingredient: medication.ingredient?.map(ing => ({
                    item: extractCodeableConceptText(ing.itemCodeableConcept) || ing.itemReference,
                    isActive: ing.isActive,
                    strength: processRatio(ing.strength)
                })),
                batch: medication.batch ? {
                    lotNumber: medication.batch.lotNumber,
                    expirationDate: medication.batch.expirationDate
                } : undefined,
                fullUrl
            };
            
        default:
            console.warn(`processFhirResource: Unhandled resourceType: ${resource.resourceType}`);
            return { processedType: 'Unhandled', originalResourceType: resource.resourceType };
    }
}