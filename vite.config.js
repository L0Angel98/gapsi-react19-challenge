var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
var RAPID_API_HOST = 'axesso-walmart-data-service.p.rapidapi.com';
var RAPID_API_PATH = '/wlm/walmart-search-by-keyword';
var WINDOW_MS = 60000;
var MAX_REQUESTS_PER_WINDOW = 30;
/**
 * Proxy de desarrollo para RapidAPI. Node lee RAPIDAPI_KEY y nunca se expone
 * mediante una variable VITE_ ni dentro del bundle del navegador.
 */
function rapidApiProxy(env) {
    var requestLog = new Map();
    return {
        name: 'gapsi-rapidapi-proxy',
        configureServer: function (server) {
            var _this = this;
            server.middlewares.use('/api/products', function (request, response) { return __awaiter(_this, void 0, void 0, function () {
                var clientKey, now, recentRequests, requestUrl, keyword, pageValue, page, apiKey, upstreamUrl, upstream, _a, _b, _c, _d, _e;
                var _f, _g, _h, _j, _k, _l, _m, _o;
                return __generator(this, function (_p) {
                    switch (_p.label) {
                        case 0:
                            if (request.method !== 'GET') {
                                response.statusCode = 405;
                                response.setHeader('Allow', 'GET');
                                response.end(JSON.stringify({ error: 'Método no permitido' }));
                                return [2 /*return*/];
                            }
                            clientKey = (_f = request.socket.remoteAddress) !== null && _f !== void 0 ? _f : 'unknown';
                            now = Date.now();
                            recentRequests = ((_g = requestLog.get(clientKey)) !== null && _g !== void 0 ? _g : []).filter(function (timestamp) { return now - timestamp < WINDOW_MS; });
                            if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
                                response.statusCode = 429;
                                response.setHeader('Retry-After', '60');
                                response.end(JSON.stringify({ error: 'Demasiadas búsquedas. Intenta de nuevo en un minuto.' }));
                                return [2 /*return*/];
                            }
                            recentRequests.push(now);
                            requestLog.set(clientKey, recentRequests);
                            requestUrl = new URL((_h = request.url) !== null && _h !== void 0 ? _h : '/', 'http://localhost');
                            keyword = (_k = (_j = requestUrl.searchParams.get('keyword')) === null || _j === void 0 ? void 0 : _j.trim().slice(0, 100)) !== null && _k !== void 0 ? _k : '';
                            pageValue = Number((_l = requestUrl.searchParams.get('page')) !== null && _l !== void 0 ? _l : '1');
                            page = Number.isInteger(pageValue) ? Math.max(1, Math.min(100, pageValue)) : 1;
                            apiKey = (_m = env.RAPIDAPI_KEY) === null || _m === void 0 ? void 0 : _m.trim();
                            if (!apiKey) {
                                response.statusCode = 503;
                                response.setHeader('Content-Type', 'application/json; charset=utf-8');
                                response.end(JSON.stringify({ error: 'Configura RAPIDAPI_KEY en el entorno del proxy.' }));
                                return [2 /*return*/];
                            }
                            if (keyword.length < 1) {
                                response.statusCode = 400;
                                response.setHeader('Content-Type', 'application/json; charset=utf-8');
                                response.end(JSON.stringify({ error: 'keyword es obligatorio.' }));
                                return [2 /*return*/];
                            }
                            upstreamUrl = new URL("https://".concat(RAPID_API_HOST).concat(RAPID_API_PATH));
                            upstreamUrl.searchParams.set('keyword', keyword);
                            upstreamUrl.searchParams.set('page', String(page));
                            upstreamUrl.searchParams.set('sortBy', 'best_match');
                            _p.label = 1;
                        case 1:
                            _p.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, fetch(upstreamUrl, {
                                    headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': RAPID_API_HOST }
                                })];
                        case 2:
                            upstream = _p.sent();
                            response.statusCode = upstream.status;
                            response.setHeader('Content-Type', (_o = upstream.headers.get('content-type')) !== null && _o !== void 0 ? _o : 'application/json');
                            _b = (_a = response).end;
                            _d = (_c = Buffer).from;
                            return [4 /*yield*/, upstream.arrayBuffer()];
                        case 3:
                            _b.apply(_a, [_d.apply(_c, [_p.sent()])]);
                            return [3 /*break*/, 5];
                        case 4:
                            _e = _p.sent();
                            response.statusCode = 502;
                            response.setHeader('Content-Type', 'application/json; charset=utf-8');
                            response.end(JSON.stringify({ error: 'No fue posible consultar el servicio de productos.' }));
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
        }
    };
}
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react(), rapidApiProxy(env)],
        build: {
            target: 'es2022',
            minify: 'esbuild',
            cssMinify: true,
            assetsInlineLimit: 4096,
        }
    };
});
