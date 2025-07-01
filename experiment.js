import { isResourceType } from "./fhirTypes";

const testPayload = (payload) => {
    if (isResourceType(payload, 'DiagnosticReport')) {
    }
}