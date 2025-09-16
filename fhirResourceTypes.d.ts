import { R4 } from '@ahryman40k/ts-fhir-types';

// --- Helper Interfaces for Nested Structures ---

interface ProcessedIdentifier {
    type?: string;
    value: string;
}

// --- Interfaces for the ProcessedFhirResource Union Type ---

export interface ProcessedAttachment {
    processedType: 'Attachment';
    contentType: string;
    data: string; // Assuming 'base64PDFDATA' is a placeholder for a base64 string
    title: string;
}

export interface ProcessedPatientInfo {
    processedType: 'PatientInfo';
    name: string;
    id: string;
    telecom?: string[];
    gender?: R4.PatientGenderEnum;
    birthDate?: string;
    address?: string[];
    communication?: string[];
    fullUrl?: string;
}

export interface ProcessedPractitionerInfo {
    processedType: 'PractitionerInfo';
    name: string;
    id: string;
    identifier?: ProcessedIdentifier[];
    telecom?: string[];
    gender?: R4.PractitionerGenderEnum;
    birthDate?: string;
    address?: string[];
    qualification?: {
        code?: string;
        issuer?: R4.IReference;
        period?: string | undefined
    }[];
    active?: boolean;
    fullUrl?: string;
}

export interface ProcessedOrganizationInfo {
    processedType: 'OrganizationInfo';
    name: string;
    id?: string;
    identifier?: ProcessedIdentifier[];
    telecom?: string[];
    address?: string[];
    type?: (string | undefined)[];
    active?: boolean;
    partOf?: R4.IReference;
    endpoint?: R4.IReference[];
    fullUrl?: string;
}

export interface ProcessedObservationResult {
    processedType: 'ObservationResult';
    code?: string;
    value?: any; // Can be string, number, boolean etc.
    unit?: string;
    effectiveDateTime?: string;
    effectiveInstant?: string;
    effectivePeriod?: R4.IPeriod;
    issued?: string;
    text?: string;
    status?: R4.ObservationStatusEnum;
    category?: (string | undefined)[];
    interpretation?: (string | undefined)[];
    referenceRange?: any[]; // Type depends on processReferenceRange
    components?: {
        code?: string;
        value?: any;
        unit?: string;
        referenceRange?: any[]; // Type depends on processReferenceRange
    }[];
    subject?: R4.IReference;
    encounter?: R4.IReference;
    performer?: R4.IReference[];
    specimen?: R4.IReference;
    device?: R4.IReference;
    basedOn?: R4.IReference[];
    partOf?: R4.IReference[];
    hasMember?: R4.IReference[];
    derivedFrom?: R4.IReference[];
    fullUrl?: string;
}

export interface ProcessedMedicationInfo {
    processedType: 'MedicationInfo';
    name: string;
    status: string;
    intent: string;
    category: (string | undefined)[];
    priority: string;
    dosageInstruction?: {
        text?: string;
        additionalInstruction?: (string | undefined)[];
        timing?: any; // Type depends on processTiming
        route?: string;
        method?: string;
        doseAndRate?: {
            dose?: string;
            rate?: string;
        }[];
    }[];
    dispenseRequest?: {
        validityPeriod?: string | undefined
        numberOfRepeatsAllowed?: number;
        quantity?: string;
        expectedSupplyDuration?: stringW;
    };
    authoredOn: string;
    reasonCode: (string | undefined)[];
    reasonReference?: R4.IReference[];
    note?: string | string[];
    substitution?: {
        allowed: boolean | string;
        reason?: string;
    };
    priorPrescription?: R4.IReference;
    supportingInformation?: R4.IReference[];
    subject?: R4.IReference;
    encounter?: R4.IReference;
    requester?: R4.IReference;
    performer?: R4.IReference;
    recorder?: R4.IReference;
    basedOn?: R4.IReference[];
    groupIdentifier?: ProcessedIdentifier;
    courseOfTherapyType?: string;
    insurance?: R4.IReference[];
    fullUrl?: string;
}

export interface ProcessedMedication {
    processedType: 'Medication';
    identifier?: ProcessedIdentifier[];
    code?: string;
    status?: R4.MedicationStatusEnum;
    manufacturer?: R4.IReference;
    form?: string;
    amount?: string;
    ingredient?: {
        item?: string | R4.IReference;
        isActive?: boolean;
        strength?: string;
    }[];
    batch?: {
        lotNumber?: string;
        expirationDate?: string;
    };
    fullUrl?: string;
}

export interface ProcessedConditionInfo {
    processedType: 'ConditionInfo';
    code: string;
    clinicalStatus: string;
    verificationStatus: string;
    category: (string | undefined)[];
    severity?: string;
    bodySite: (string | undefined)[];
    recordedDate?: string;
    note?: string | string[];
    evidence: (string | undefined)[];
    onset?: any; // Type depends on processEventTiming
    abatement?: any; // Type depends on processEventTiming
    stage?: {
        summary?: string;
        assessment?: R4.IReference[];
    };
    subject?: R4.IReference;
    encounter?: R4.IReference;
    asserter?: R4.IReference;
    recorder?: R4.IReference;
    identifier?: ProcessedIdentifier[];
}

export interface ProcessedProcedureInfo {
    processedType: 'ProcedureInfo';
    code: string;
    status: string;
    statusReason?: string;
    category?: string;
    performed?: any; // Type depends on processEventTiming
    outcome?: string;
    complication: (string | undefined)[];
    followUp: (string | undefined)[];
    bodySite: (string | undefined)[];
    reasonCode: (string | undefined)[];
    instantiatesCanonical?: string[];
    instantiatesUri?: string[];
    usedCode: (string | undefined)[];
    note?: string | string[];
    subject?: R4.IReference;
    encounter?: R4.IReference;
    recorder?: R4.IReference;
    asserter?: R4.IReference;
    performer?: {
        actor: R4.IReference;
        function?: string;
    }[];
    location?: R4.IReference;
    basedOn?: R4.IReference[];
    usedReference?: R4.IReference[];
    identifier?: ProcessedIdentifier[];
    report?: R4.IReference[];
}

export interface ProcessedEncounterInfo {
    processedType: 'EncounterInfo';
    type: string;
    period?: string | undefined
    status: string;
    class?: string;
    identifier?: ProcessedIdentifier[];
    subject?: R4.IReference;
    hospitalization?: {
        preAdmissionIdentifier?: ProcessedIdentifier;
        origin?: R4.IReference;
        admitSource?: string;
        reAdmission?: string;
        dietPreference?: (string | undefined)[];
        specialCourtesy?: (string | undefined)[];
        specialArrangement?: (string | undefined)[];
        destination?: R4.IReference;
        dischargeDisposition?: string;
    };
    diagnosis?: {
        condition: R4.IReference;
        use?: string;
    }[];
    serviceProvider?: R4.IReference;
    participant?: {
        type?: (string | undefined)[];
        actor?: R4.IReference;
        period?: string | undefined
    }[];
    reasonCode?: (string | undefined)[];
    reasonReference?: R4.IReference[];
    location?: {
        location: R4.IReference;
        status?: R4.EncounterLocationStatusEnum;
        physicalType?: string;
        period?: string | undefined
    }[];
    fullUrl?: string;
}

export interface ProcessedImmunizationInfo {
    processedType: 'ImmunizationInfo';
    identifier?: ProcessedIdentifier[];
    status: string;
    statusReason?: string;
    vaccineCode: string;
    patient: R4.IReference;
    encounter?: R4.IReference;
    occurrence?: any; // Type depends on processEventTiming
    recorded?: string;
    primarySource: boolean;
    reportOrigin?: string;
    location?: R4.IReference;
    manufacturer?: R4.IReference;
    lotNumber?: string;
    expirationDate?: string;
    site?: string;
    route?: string;
    doseQuantity?: string;
    performer?: {
        actor: R4.IReference;
        function?: string;
    }[];
    note?: string | string[];
    reasonCode?: (string | undefined)[];
    reasonReference?: R4.IReference[];
    isSubpotent?: boolean;
    programEligibility?: (string | undefined)[];
    fundingSource?: string;
    reaction?: {
        date?: string;
        detail?: R4.IReference;
        reported: boolean;
    }[];
    protocolApplied?: {
        series?: string;
        authority?: R4.IReference;
        targetDisease?: (string | undefined)[];
        doseNumber?: string;
        seriesDoses?: string;
    }[];
}

export interface ProcessedImmunizationRecommendationInfo {
    processedType: 'ImmunizationRecommendationInfo';
    identifier?: ProcessedIdentifier[];
    patient: R4.IReference;
    date: string;
    authority?: R4.IReference;
    recommendations: {
        vaccineCode?: (string | undefined)[];
        targetDisease?: string;
        contraindicatedVaccineCode?: (string | undefined)[];
        forecastStatus: string;
        forecastReason?: (string | undefined)[];
        dateCriterion?: {
            code: string;
            value: string;
        }[];
        description?: string;
        series?: string;
        doseNumber?: string;
        seriesDoses?: string;
        supportingImmunization?: R4.IReference[];
        supportingPatientInformation?: R4.IReference[];
    }[];
}

export interface ProcessedAllergyIntoleranceInfo {
    processedType: 'AllergyIntoleranceInfo';
    identifier?: ProcessedIdentifier[];
    clinicalStatus: string;
    verificationStatus: string;
    type: string;
    category: R4.AllergyIntoleranceCategoryEnum[];
    criticality: string;
    code: string;
    patient: R4.IReference;
    encounter?: R4.IReference;
    onset?: any; // Type depends on processEventTiming
    recordedDate?: string;
    recorder?: R4.IReference;
    asserter?: R4.IReference;
    lastOccurrence?: string;
    note?: string | string[];
    reaction: {
        substance?: string;
        manifestation: string[];
        description?: string;
        onset?: string;
        severity: string;
        exposureRoute?: string;
        note?: string | string[];
    }[];
}

export interface ProcessedCompositionInfo {
    processedType: 'CompositionInfo';
    title: string;
    id?: string;
    status: string;
    type: string;
    category: (string | undefined)[];
    subject?: R4.IReference;
    encounter?: R4.IReference;
    date?: string;
    author: R4.IReference[];
    confidentiality: string;
    attester: {
        mode: string;
        time?: string;
        party?: R4.IReference;
    }[];
    custodian?: R4.IReference;
    event: {
        code: (string | undefined)[];
        period?: string | undefined
        detail?: R4.IReference[];
    }[];
    section: {
        title: string;
        code?: string;
        text: string;
        entry?: R4.IReference[];
    }[];
    fullUrl?: string;
}

export interface ProcessedDiagnosticReportInfo {
    processedType: 'DiagnosticReportInfo';
    status: string;
    identifier?: ProcessedIdentifier[];
    category: (string | undefined)[];
    code: string;
    effectiveDateTime: string;
    issued: string;
    conclusion: string;
    subject?: R4.IReference;
    performer?: R4.IReference[];
    resultsInterpreter?: R4.IReference[];
    specimen?: R4.IReference[];
    result?: R4.IReference[];
    basedOn?: R4.IReference[];
    fullUrl?: string;
}

export interface ProcessedAppointmentInfo {
    processedType: 'AppointmentInfo';
    identifier?: ProcessedIdentifier[];
    status: string;
    cancelationReason?: string;
    serviceCategory?: (string | undefined)[];
    serviceType?: (string | undefined)[];
    specialty?: (string | undefined)[];
    appointmentType?: string;
    reasonCode?: (string | undefined)[];
    reasonReference?: R4.IReference[];
    priority?: number;
    description?: string;
    supportingInformation?: R4.IReference[];
    start: string;
    end: string;
    minutesDuration?: number;
    slot?: R4.IReference[];
    created?: string;
    comment?: string;
    patientInstruction?: string;
    basedOn?: R4.IReference[];
    participant: {
        actor?: R4.IReference;
        required: string;
        status: string;
        type?: (string | undefined)[];
        period?: string | undefined
    }[];
    requestedPeriod?: (string | undefined)[];
}

export interface ProcessedCarePlanInfo {
    processedType: 'CarePlanInfo';
    identifier?: ProcessedIdentifier[];
    basedOn?: R4.IReference[];
    replaces?: R4.IReference[];
    partOf?: R4.IReference[];
    status: string;
    intent: string;
    category?: (string | undefined)[];
    title: string;
    description?: string;
    subject: R4.IReference;
    encounter?: R4.IReference;
    period?: string | undefined
    created?: string;
    author?: R4.IReference;
    contributor?: R4.IReference[];
    careTeam?: R4.IReference[];
    addresses?: R4.IReference[];
    supportingInfo?: R4.IReference[];
    goal?: R4.IReference[];
    activity: {
        outcomeCodeableConcept?: (string | undefined)[];
        outcomeReference?: R4.IReference[];
        progress?: string[];
        reference?: R4.IReference;
        detail?: {
            kind?: R4.CarePlanActivityKindEnum;
            instantiatesCanonical?: string[];
            instantiatesUri?: string[];
            code?: string;
            reasonCode?: (string | undefined)[];
            reasonReference?: R4.IReference[];
            goal?: R4.IReference[];
            status: string;
            statusReason?: string;
            doNotPerform?: boolean;
            scheduled?: any; // Can be string, Period, or Timing
            location?: R4.IReference;
            performer?: R4.IReference[];
            product?: string | R4.IReference;
            dailyAmount?: string;
            quantity?: string;
            description?: string;
        };
    }[];
    note?: string | string[];
}

export interface ProcessedMedicationStatementInfo {
    processedType: 'MedicationStatementInfo';
    identifier?: ProcessedIdentifier[];
    basedOn?: R4.IReference[];
    partOf?: R4.IReference[];
    status: string;
    statusReason?: (string | undefined)[];
    category?: string;
    medication?: string | R4.IReference;
    subject: R4.IReference;
    context?: R4.IReference;
    effective?: string | undefined;
    dateAsserted?: string;
    informationSource?: R4.IReference;
    derivedFrom?: R4.IReference[];
    reasonCode?: (string | undefined)[];
    reasonReference?: R4.IReference[];
    note?: string | string[];
    dosage?: {
        sequence?: number;
        text?: string;
        additionalInstruction?: (string | undefined)[];
        patientInstruction?: string;
        timing?: any; // Type depends on processTiming
        asNeeded?: string;
        site?: string;
        route?: string;
        method?: string;
        doseAndRate?: {
            type?: string;
            dose?: string;
            rate?: string;
        }[];
    }[];
}

export interface ProcessedSpecimenInfo {
    processedType: 'SpecimenInfo';
    identifier?: ProcessedIdentifier[];
    accessionIdentifier?: ProcessedIdentifier;
    status?: R4.SpecimenStatusEnum;
    type: string;
    subject?: R4.IReference;
    parent?: R4.IReference[];
    request?: R4.IReference[];
    collection?: {
        collector?: R4.IReference;
        collected?: string;
        duration?: string;
        quantity?: string;
        method?: string;
        bodySite?: string;
        fastingStatus?: string;
    };
    receivedTime?: string;
    processing?: {
        description?: string;
        procedure?: string;
        additive?: R4.IReference[];
        time?: string | undefined;
    }[];
    container?: {
        identifier?: ProcessedIdentifier[];
        description?: string;
        type?: string;
        capacity?: string;
        specimenQuantity?: string;
        additive?: string | R4.IReference;
    }[];
    condition?: (string | undefined)[];
    note?: string | string[];
}

export interface ProcessedServiceRequestInfo {
    processedType: 'ServiceRequestInfo';
    identifier?: ProcessedIdentifier[];
    instantiatesCanonical?: string[];
    instantiatesUri?: string[];
    basedOn?: R4.IReference[];
    replaces?: R4.IReference[];
    requisition?: ProcessedIdentifier;
    status: string;
    intent: string;
    category?: (string | undefined)[];
    priority: string;
    doNotPerform?: boolean;
    code: string;
    orderDetail?: (string | undefined)[];
    quantity?: string | undefined;
    subject: R4.IReference;
    encounter?: R4.IReference;
    occurrence?: string | undefined;
    asNeeded?: string;
    authoredOn?: string;
    requester?: R4.IReference;
    performerType?: string;
    performer?: R4.IReference[];
    locationCode?: (string | undefined)[];
    locationReference?: R4.IReference[];
    reasonCode?: (string | undefined)[];
    reasonReference?: R4.IReference[];
    insurance?: R4.IReference[];
    supportingInfo?: R4.IReference[];
    specimen?: R4.IReference[];
    bodySite?: (string | undefined)[];
    note?: string | string[];
    patientInstruction?: string;
    relevantHistory?: R4.IReference[];
}

export interface ProcessedChargeItemInfo {
    processedType: 'ChargeItemInfo';
    identifier?: ProcessedIdentifier[];
    definitionUri?: string[];
    definitionCanonical?: string[];
    status: string;
    partOf?: R4.IReference[];
    code: string;
    subject: R4.IReference;
    context?: R4.IReference;
    occurrence?: string | undefined;
    performer?: {
        function?: string;
        actor: R4.IReference;
    }[];
    performingOrganization?: R4.IReference;
    requestingOrganization?: R4.IReference;
    costCenter?: R4.IReference;
    quantity?: string;
    bodysite?: (string | undefined)[];
    factorOverride?: number;
    priceOverride?: string;
    overrideReason?: string;
    enterer?: R4.IReference;
    enteredDate?: string;
    reason?: (string | undefined)[];
    service?: R4.IReference[];
    product?: R4.IReference | string;
    account?: R4.IReference[];
    note?: string | string[];
    supportingInformation?: R4.IReference[];
}

export interface ProcessedInvoiceInfo {
    processedType: 'InvoiceInfo';
    identifier?: ProcessedIdentifier[];
    status: string;
    cancelledReason?: string;
    type?: string;
    subject?: R4.IReference;
    recipient?: R4.IReference;
    date?: string;
    participant?: {
        role?: string;
        actor: R4.IReference;
    }[];
    issuer?: R4.IReference;
    account?: R4.IReference;
    lineItems?: {
        sequence?: number;
        chargeItem?: R4.IReference | string;
        priceComponent?: {
            type?: R4.InvoicePriceComponentTypeEnum;
            code?: string;
            factor?: number;
            amount?: string;
        }[];
    }[];
    totalPriceComponent?: {
        type?: R4.InvoicePriceComponentTypeEnum;
        code?: string;
        factor?: number;
        amount?: string;
    }[];
    totalNet?: string;
    totalGross?: string;
    paymentTerms?: string;
    note?: string | string[];
    fullUrl?: string;
}

export interface ProcessedUnhandledResource {
    processedType: 'Unhandled';
    originalResourceType: string;
    detail?: string;
}


// --- The Master Union Type ---

export type ProcessedFhirResource =
    | ProcessedAttachment
    | ProcessedPatientInfo
    | ProcessedPractitionerInfo
    | ProcessedOrganizationInfo
    | ProcessedObservationResult
    | ProcessedMedicationInfo
    | ProcessedMedication
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