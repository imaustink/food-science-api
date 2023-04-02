// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#encoding_for_rfc3986
const RFC3986_ADDITIONAL_CHARACTERS = /[!'()*]/g;

function encodeURL(text) {
    return encodeURIComponent(text.trim().toLowerCase().replace(/\s+/gm, "-"))
        .replace(
            RFC3986_ADDITIONAL_CHARACTERS,
            (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
        );
}

module.exports = {
    encodeURL
};