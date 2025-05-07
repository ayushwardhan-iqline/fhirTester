// fhirTypes.js

/**
 * @typedef {Object} ProcessedAttachment
 * @property {'Attachment'} processedType
 * @property {string} contentType
 * @property {string} data
 * @property {string} [title]
 */

/**
 * @typedef {Object} ProcessedPatientInfo
 * @property {'PatientInfo'} processedType
 * @property {string} name
 * @property {string} id
 */

/**
 * @typedef {Object} ProcessedPractitionerInfo
 * @property {'PractitionerInfo'} processedType
 * @property {string} name
 * @property {string} id
 */

/**
 * @typedef {Object} ProcessedOrganizationInfo
 * @property {'OrganizationInfo'} processedType
 * @property {string} name
 * @property {string} [id]
 */

/**
 * @typedef {Object} ProcessedObservationResultComponent
 * @property {string} code
 * @property {string} value
 * @property {string} [unit]
 * @property {string} [text]
 */

/**
 * @typedef {Object} ProcessedObservationResult
 * @property {'ObservationResult'} processedType
 * @property {string} code
 * @property {string} value
 * @property {string} [unit]
 * @property {string} [date]
 * @property {string} [text]
 * @property {Array<ProcessedObservationResultComponent>} [components]
 */

/**
 * @typedef {Object} ProcessedMedicationInfo
 * @property {'MedicationInfo'} processedType
 * @property {string} name
 * @property {string} [dosage]
 * @property {string} [frequency]
 * @property {string} [duration]
 * @property {string} [status]
 */

/**
 * @typedef {Object} ProcessedMedication
 * @property {'Medication'} processedType
 * @property {string} name
 * @property {string} [form]
 * @property {string} [identifier]
 * @property {{lotNumber?: string, expirationDate?: string}} [batch]
 */

/**
 * @typedef {Object} ProcessedConditionInfo
 * @property {'ConditionInfo'} processedType
 * @property {string} code
 * @property {string} [status]
 * @property {string} [text]
 */

/**
 * @typedef {Object} ProcessedProcedureInfo
 * @property {'ProcedureInfo'} processedType
 * @property {string} code
 * @property {string} [status]
 * @property {string} [date]
 * @property {string} [text]
 */

/**
 * @typedef {Object} ProcessedEncounterInfo
 * @property {'EncounterInfo'} processedType
 * @property {string} type
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} [date]
 * @property {string} [status]
 */

/**
 * @typedef {Object} ProcessedImmunizationInfo
 * @property {'ImmunizationInfo'} processedType
 * @property {string} vaccine
 * @property {string} date
 * @property {string} [lotNumber]
 * @property {string} status
 */

/**
 * @typedef {Object} ProcessedImmunizationRecommendationInfo
 * @property {'ImmunizationRecommendationInfo'} processedType
 * @property {string} vaccine
 * @property {string} status
 * @property {string} date
 */

/**
 * @typedef {Object} ProcessedAllergyIntoleranceInfo
 * @property {'AllergyIntoleranceInfo'} processedType
 * @property {string} substance
 * @property {string} [severity]
 * @property {string} [status]
 * @property {string} [type]
 */

/**
 * @typedef {Object} ProcessedCompositionInfo
 * @property {'CompositionInfo'} processedType
 * @property {string} title
 * @property {string} [id]
 * @property {string} status
 * @property {string} [date]
 */

/**
 * @typedef {Object} ProcessedDiagnosticReportInfo
 * @property {'DiagnosticReportInfo'} processedType
 * @property {string} test
 * @property {string} conclusion
 * @property {string} date
 */

/**
 * @typedef {Object} ProcessedAppointmentInfo
 * @property {'AppointmentInfo'} processedType
 * @property {string} status
 * @property {string} type
 * @property {string} [description]
 * @property {string} start
 * @property {string} end
 * @property {string} [created]
 */

/**
 * @typedef {Object} ProcessedCarePlanInfo
 * @property {'CarePlanInfo'} processedType
 * @property {string} status
 * @property {string} intent
 * @property {string} title
 * @property {string} [description]
 * @property {string} [category]
 */

/**
 * @typedef {Object} ProcessedMedicationStatementInfo
 * @property {'MedicationStatementInfo'} processedType
 * @property {string} status
 * @property {string} medication // Name or reference to the medication
 * @property {string} [dateAsserted]
 */

/**
 * @typedef {Object} ProcessedSpecimenInfo
 * @property {'SpecimenInfo'} processedType
 * @property {string} type
 * @property {string} [receivedTime]
 * @property {string} [collectionTime]
 */

/**
 * @typedef {Object} ProcessedServiceRequestInfo
 * @property {'ServiceRequestInfo'} processedType
 * @property {string} status
 * @property {string} intent
 * @property {string} code
 * @property {string} [occurrenceDateTime]
 * @property {string} [requester]
 */

/**
 * @typedef {Object} ProcessedChargeItemInfo
 * @property {'ChargeItemInfo'} processedType
 * @property {string} status
 * @property {string} code
 * @property {number} [quantity]
 * @property {string} [product]
 */

/**
 * @typedef {Object} ProcessedInvoiceInfo
 * @property {'InvoiceInfo'} processedType
 * @property {string} status
 * @property {string} type
 * @property {string} date
 * @property {string} [identifier]
 * @property {{value: number, currency: string}} totalNet
 * @property {{value: number, currency: string}} [totalGross]
 */

/**
 * @typedef {Object} ProcessedGoalInfo
 * @property {'GoalInfo'} processedType
 * @property {string} description
 * @property {string} status // e.g., active, completed, cancelled
 * @property {string} [id]
 * @property {string} [startDate]
 * @property {string} [targetDate]
 */

/**
 * @typedef {Object} ProcessedUnhandledResource
 * @property {'Unhandled'} processedType
 * @property {string} originalResourceType
 * @property {string} [detail]
 */

/**
 * @typedef {Object} AttachmentRef
 * @property {string} bundleId
 * @property {string} sessionId
 * @property {number} num
 */

/**
 * Union of all possible processed resource types.
 * @typedef {ProcessedAttachment
*  | ProcessedPatientInfo
*  | ProcessedPractitionerInfo
*  | ProcessedOrganizationInfo
*  | ProcessedObservationResult
*  | ProcessedMedicationInfo
*  | ProcessedMedication
*  | ProcessedConditionInfo
*  | ProcessedProcedureInfo
*  | ProcessedEncounterInfo
*  | ProcessedImmunizationInfo
*  | ProcessedImmunizationRecommendationInfo
*  | ProcessedAllergyIntoleranceInfo
*  | ProcessedCompositionInfo
*  | ProcessedDiagnosticReportInfo
*  | ProcessedAppointmentInfo
*  | ProcessedCarePlanInfo
*  | ProcessedMedicationStatementInfo
*  | ProcessedSpecimenInfo
*  | ProcessedServiceRequestInfo
*  | ProcessedChargeItemInfo
*  | ProcessedInvoiceInfo
*  | ProcessedGoalInfo
*  | ProcessedUnhandledResource
* } ProcessedFhirResource
*/

/**
* Defines the type of the bundle, determined by the first entry's profile or resource type.
* Matches the 'BundleType' type in bundleTransformer.ts.
* @typedef {'WellnessRecord'
*  | 'PrescriptionRecord'
*  | 'DischargeSummaryRecord'
*  | 'ImmunizationRecord'
*  | 'OPConsultRecord'
*  | 'InvoiceRecord'
*  | 'HealthDocumentRecord'
*  | 'DiagnosticReportRecord'
*  | 'Patient'
*  | 'Practitioner'
*  | 'Organization'
*  | 'Encounter'
*  | 'Observation'
*  | 'DiagnosticReport'
*  | 'DocumentReference'
*  | 'MedicationRequest'
*  | 'Immunization'
*  | 'Invoice'
*  | 'Condition'
*  | 'Procedure'
*  | 'AllergyIntolerance'
*  | 'CarePlan'
*  | 'Goal'
*  | 'ServiceRequest'
*  | 'Specimen'
*  | 'Binary'
*  | 'Composition'
*  | 'Bundle'
* } BundleType
*/

/**
* Represents the transformed FHIR bundle or resource.
* It includes a bundleType and arrays of processed resources, keyed by their processedType.
* @typedef {Object} TransformedBundle
* @property {BundleType} bundleType
* @property {string} id
* @property {Array<AttachmentRef>} [AttachmentRefs]
* @property {Array<ProcessedAttachment>} [Attachment]
* @property {Array<ProcessedPatientInfo>} [PatientInfo]
* @property {Array<ProcessedPractitionerInfo>} [PractitionerInfo]
* @property {Array<ProcessedOrganizationInfo>} [OrganizationInfo]
* @property {Array<ProcessedObservationResult>} [ObservationResult]
* @property {Array<ProcessedMedicationInfo>} [MedicationInfo]
* @property {Array<ProcessedMedication>} [Medication]
* @property {Array<ProcessedConditionInfo>} [ConditionInfo]
* @property {Array<ProcessedProcedureInfo>} [ProcedureInfo]
* @property {Array<ProcessedEncounterInfo>} [EncounterInfo]
* @property {Array<ProcessedImmunizationInfo>} [ImmunizationInfo]
* @property {Array<ProcessedImmunizationRecommendationInfo>} [ImmunizationRecommendationInfo]
* @property {Array<ProcessedAllergyIntoleranceInfo>} [AllergyIntoleranceInfo]
* @property {Array<ProcessedCompositionInfo>} [CompositionInfo]
* @property {Array<ProcessedDiagnosticReportInfo>} [DiagnosticReportInfo]
* @property {Array<ProcessedAppointmentInfo>} [AppointmentInfo]
* @property {Array<ProcessedCarePlanInfo>} [CarePlanInfo]
* @property {Array<ProcessedMedicationStatementInfo>} [MedicationStatementInfo]
* @property {Array<ProcessedSpecimenInfo>} [SpecimenInfo]
* @property {Array<ProcessedServiceRequestInfo>} [ServiceRequestInfo]
* @property {Array<ProcessedChargeItemInfo>} [ChargeItemInfo]
* @property {Array<ProcessedInvoiceInfo>} [InvoiceInfo]
* @property {Array<ProcessedGoalInfo>} [GoalInfo]
* @property {Array<ProcessedUnhandledResource>} [Unhandled]
*/

// Type Guards

/**
* Generic type guard for any bundle or resource type based on bundleType property.
* This guard helps narrow down the 'bundleType' but not necessarily the specific data properties.
* For more specific data properties, use the dedicated type guards above.
* @template {BundleType} T
* @param {TransformedBundle} bundle
* @param {T} type
* @returns {bundle is TransformedBundle & {bundleType: T}}
*/
function isResourceType(bundle, type) {
   return bundle.bundleType === type;
}

// Export the generic type guard
module.exports = {
   isResourceType
};