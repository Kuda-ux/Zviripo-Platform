// React Native provides a global WebSocket; the `ws` package is a Node-only
// implementation that pulls in Node stdlib modules (stream) and breaks bundling.
// Metro redirects `ws` imports here on native platforms.
const WS = globalThis.WebSocket;
module.exports = WS;
module.exports.default = WS;
module.exports.WebSocket = WS;
