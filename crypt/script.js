function dec2hex(a) {
    return Number(parseInt(a, 10)).toString(16)
}
function dec2bin(a) {
    return Number(parseInt(a, 10)).toString(2)
}
function bin2dec(a) {
    return parseInt(a, 2)
}
function bin2hex(a) {
    return Number(parseInt(a, 2)).toString(16)
}
function hex2dec(a) {
    return parseInt(a, 16)
}
function hex2bin(a) {
    return Number(parseInt(a, 16)).toString(2)
}
function buildOctet(a) {
    for (var d = 8 - a.length, b = 0; b < d; b += 1)a = "0" + a;
    return a
}
function text2bin(a) {
    for (var d = "", b = [], c = a.length, b = "", e = 0; e < c; e += 1)b = encodeURIComponent(a.charAt(e)).split("%"), 2 < b.length ? (b = b[1] + b[2], d += hex2bin(b)) : d += buildOctet(dec2bin(a.charCodeAt(e)));
    return d
}
function bin2text(a) {
    for (var d = a.length >> 3, b = [], c = 0; c < d; c += 1)b[c] = a.substr(c << 3, 8);
    a = b.length;
    d = "";
    for (c = 0; c < a; c += 1)if ("110" === b[c].substr(0, 3)) {
        try {
            d += decodeURIComponent("%" + bin2hex(b[c]) + "%" + bin2hex(b[c + 1]))
        } catch (e) {
            continue
        }
        c += 1
    } else d += String.fromCharCode(bin2dec(b[c]));
    return d
};