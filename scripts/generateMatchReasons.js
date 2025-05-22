"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var supabase_js_1 = require("@supabase/supabase-js");
var openai_1 = require("openai");
var supabase = (0, supabase_js_1.createClient)(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
var openai = new openai_1.default({
    apiKey: process.env.VITE_OPENAI_API_KEY,
    timeout: Number(process.env.VITE_OPENAI_TIMEOUT) || 30000
});
var MODEL = process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
var TEMPERATURE = Number(process.env.VITE_OPENAI_TEMPERATURE) || 0.7;
var MAX_TOKENS = Number(process.env.VITE_OPENAI_MAX_TOKENS) || 256;
function fetchMatchesNeedingReasons() {
    return __awaiter(this, arguments, void 0, function (batchSize) {
        var _a, matches, error, roundIds, _b, rounds, roundError, completedRoundIds;
        if (batchSize === void 0) { batchSize = 10; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('match')
                        .select("\n      id, round_id, profile_id_1, profile_id_2,\n      match_reason_1, match_reason_2, icebreaker_1, icebreaker_2\n    ")
                        .or('match_reason_1.is.null,match_reason_2.is.null,icebreaker_1.is.null,icebreaker_2.is.null')
                        .limit(batchSize)];
                case 1:
                    _a = _c.sent(), matches = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    if (!matches)
                        return [2 /*return*/, []];
                    roundIds = __spreadArray([], new Set(matches.map(function (m) { return m.round_id; })), true);
                    return [4 /*yield*/, supabase
                            .from('match_round')
                            .select('id, status')
                            .in('id', roundIds)];
                case 2:
                    _b = _c.sent(), rounds = _b.data, roundError = _b.error;
                    if (roundError)
                        throw roundError;
                    completedRoundIds = new Set((rounds || []).filter(function (r) { return r.status === 'completed'; }).map(function (r) { return r.id; }));
                    return [2 /*return*/, matches.filter(function (m) { return completedRoundIds.has(m.round_id); })];
            }
        });
    });
}
function fetchProfile(profileId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('profile')
                        .select('*')
                        .eq('id', profileId)
                        .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    });
}
function fetchQuestionnaireAnswers(activityId, profileId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, participant, partError, _b, answers, ansError;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('activity_participant')
                        .select('id')
                        .eq('activity_id', activityId)
                        .eq('profile_id', profileId)
                        .single()];
                case 1:
                    _a = _c.sent(), participant = _a.data, partError = _a.error;
                    if (partError || !participant)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, supabase
                            .from('questionnaire_response')
                            .select('question_id, answers')
                            .eq('participant_id', participant.id)];
                case 2:
                    _b = _c.sent(), answers = _b.data, ansError = _b.error;
                    if (ansError)
                        return [2 /*return*/, null];
                    return [2 /*return*/, answers];
            }
        });
    });
}
function buildPrompt(_a) {
    var selfProfile = _a.selfProfile, otherProfile = _a.otherProfile, selfAnswers = _a.selfAnswers, otherAnswers = _a.otherAnswers, activity = _a.activity;
    return "You are an expert matchmaker. Given the following two user profiles and their answers to the event questionnaire, write a short, friendly reason why the first user would be a good match for the second user in this activity, and suggest a fun icebreaker for their first conversation.\n\nActivity: ".concat(activity.title, "\n\nUser A (the one receiving this message):\n").concat(JSON.stringify(selfProfile, null, 2), "\n\nTheir answers:\n").concat(JSON.stringify(selfAnswers, null, 2), "\n\nUser B (their match):\n").concat(JSON.stringify(otherProfile, null, 2), "\n\nTheir answers:\n").concat(JSON.stringify(otherAnswers, null, 2), "\n\nRespond in JSON with keys 'reason' and 'icebreaker'.");
}
function generateReasonAndIcebreaker(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var prompt, completion, text, json;
        var selfProfile = _b.selfProfile, otherProfile = _b.otherProfile, selfAnswers = _b.selfAnswers, otherAnswers = _b.otherAnswers, activity = _b.activity;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    prompt = buildPrompt({ selfProfile: selfProfile, otherProfile: otherProfile, selfAnswers: selfAnswers, otherAnswers: otherAnswers, activity: activity });
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: MODEL,
                            messages: [{ role: 'user', content: prompt }],
                            temperature: TEMPERATURE,
                            max_tokens: MAX_TOKENS
                        })];
                case 1:
                    completion = _c.sent();
                    text = completion.choices[0].message.content;
                    try {
                        json = JSON.parse(text);
                        return [2 /*return*/, {
                                reason: json.reason || '',
                                icebreaker: json.icebreaker || ''
                            }];
                    }
                    catch (e) {
                        // fallback: just return the text as reason
                        return [2 /*return*/, { reason: text || '', icebreaker: '' }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function fetchActivity(roundId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, round, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('match_round')
                        .select('activity_id, activity:activity_id (id, title)')
                        .eq('id', roundId)
                        .single()];
                case 1:
                    _a = _b.sent(), round = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    // round.activity is either an object or an array; ensure we return the object
                    if (Array.isArray(round.activity)) {
                        return [2 /*return*/, round.activity[0]];
                    }
                    return [2 /*return*/, round.activity];
            }
        });
    });
}
function processMatch(match) {
    return __awaiter(this, void 0, void 0, function () {
        var activity, _a, profile1, profile2, _b, answers1, answers2, update, res, res, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, fetchActivity(match.round_id)];
                case 1:
                    activity = _c.sent();
                    return [4 /*yield*/, Promise.all([
                            fetchProfile(match.profile_id_1),
                            fetchProfile(match.profile_id_2)
                        ])];
                case 2:
                    _a = _c.sent(), profile1 = _a[0], profile2 = _a[1];
                    return [4 /*yield*/, Promise.all([
                            fetchQuestionnaireAnswers(activity.id, match.profile_id_1),
                            fetchQuestionnaireAnswers(activity.id, match.profile_id_2)
                        ])];
                case 3:
                    _b = _c.sent(), answers1 = _b[0], answers2 = _b[1];
                    update = {};
                    if (!(!match.match_reason_1 || !match.icebreaker_1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, generateReasonAndIcebreaker({
                            selfProfile: profile1,
                            otherProfile: profile2,
                            selfAnswers: answers1,
                            otherAnswers: answers2,
                            activity: activity
                        })];
                case 4:
                    res = _c.sent();
                    update.match_reason_1 = res.reason;
                    update.icebreaker_1 = res.icebreaker;
                    _c.label = 5;
                case 5:
                    if (!(!match.match_reason_2 || !match.icebreaker_2)) return [3 /*break*/, 7];
                    return [4 /*yield*/, generateReasonAndIcebreaker({
                            selfProfile: profile2,
                            otherProfile: profile1,
                            selfAnswers: answers2,
                            otherAnswers: answers1,
                            activity: activity
                        })];
                case 6:
                    res = _c.sent();
                    update.match_reason_2 = res.reason;
                    update.icebreaker_2 = res.icebreaker;
                    _c.label = 7;
                case 7:
                    if (!(Object.keys(update).length > 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, supabase.from('match').update(update).eq('id', match.id)];
                case 8:
                    _c.sent();
                    console.log("Updated match ".concat(match.id));
                    _c.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    e_1 = _c.sent();
                    console.error("Failed to process match ".concat(match.id, ":"), e_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var matches, _i, matches_1, match;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting match reason/icebreaker generation worker...');
                    return [4 /*yield*/, fetchMatchesNeedingReasons(10)];
                case 1:
                    matches = _a.sent();
                    if (!matches.length) {
                        console.log('No matches needing reasons/icebreakers.');
                        return [2 /*return*/];
                    }
                    _i = 0, matches_1 = matches;
                    _a.label = 2;
                case 2:
                    if (!(_i < matches_1.length)) return [3 /*break*/, 5];
                    match = matches_1[_i];
                    return [4 /*yield*/, processMatch(match)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Done.');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) {
    console.error(e);
    process.exit(1);
});
