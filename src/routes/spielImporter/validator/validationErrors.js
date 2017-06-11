function validationError(reason, index) {
    return '[Spiel ' + (index + 1) + ': Validation - Error] ' + reason;
}

function spielEmpty(index) {
    return validationError('Spiel is empty', index)
}

function fieldsInvalid(index, details) {
    const errorDetails = details.map(function (single) {
       return single.message;
    });
    return validationError('Fields invalid: ' + errorDetails.join(', '), index);
}

function entityNotFound(index, name, value) {
    return validationError('Entity ' + name + ' with slug ' + value + ' not found', index);
}

module.exports = {
    spielEmpty: spielEmpty,
    fieldsInvalid: fieldsInvalid,
    entityNotFound: entityNotFound
};