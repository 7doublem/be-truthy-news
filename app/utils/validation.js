// returns an array of required fields missing from the object
function checkMissingFields(obj, requiredFields) {
  return requiredFields.filter((field) => obj[field] === undefined);
}

// returns an array of fields with invalid types based on the provided type map
function checkInvalidTypes(obj, typeMap) {
  return Object.entries(typeMap)
    .filter(
      ([field, type]) => obj[field] !== undefined && typeof obj[field] !== type
    )
    .map(([field]) => field);
}

// capitalises the first character of a string
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { checkMissingFields, checkInvalidTypes, capitalise };
