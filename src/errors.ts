import {
  HttpStatusCode,
  JsonApiError,
  JsonApiErrors
} from "@joelalejandro/jsonapi-ts";

const Errors = {
  ...JsonApiErrors,
  DataRequired: (fieldName: string): JsonApiError => ({
    status: HttpStatusCode.BadRequest,
    code: "data_required",
    detail: fieldName
  }),
  InvalidData: (fieldName: string, allowedValues: string[]): JsonApiError => ({
    status: HttpStatusCode.BadRequest,
    code: "invalid_data",
    detail: `${fieldName} allows the following values: ${allowedValues.join(
      ", "
    )}`
  }),
  RelatedDataNotFound: (relationshipName: string): JsonApiError => ({
    status: HttpStatusCode.NotFound,
    code: "related_data_not_found",
    detail: `relationship ${relationshipName} has an ID that isn't registered in the DB`
  })
};

export default Errors;
