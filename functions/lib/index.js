"use strict";
// This is the main entry point for all your cloud functions.
// This file imports and exports all the individual functions from their respective modules.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateThumbnail = exports.decrementJobApplicationCount = exports.incrementJobApplicationCount = exports.onNewJobPosted = exports.onLicenseStatusChange = exports.setCustomUserRole = void 0;
const customClaims_1 = require("./auth/customClaims");
Object.defineProperty(exports, "setCustomUserRole", { enumerable: true, get: function () { return customClaims_1.setCustomUserRole; } });
const triggers_1 = require("./notifications/triggers");
Object.defineProperty(exports, "onLicenseStatusChange", { enumerable: true, get: function () { return triggers_1.onLicenseStatusChange; } });
Object.defineProperty(exports, "onNewJobPosted", { enumerable: true, get: function () { return triggers_1.onNewJobPosted; } });
const counters_1 = require("./aggregations/counters");
Object.defineProperty(exports, "incrementJobApplicationCount", { enumerable: true, get: function () { return counters_1.incrementJobApplicationCount; } });
Object.defineProperty(exports, "decrementJobApplicationCount", { enumerable: true, get: function () { return counters_1.decrementJobApplicationCount; } });
const imageProcessing_1 = require("./storage/imageProcessing");
Object.defineProperty(exports, "generateThumbnail", { enumerable: true, get: function () { return imageProcessing_1.generateThumbnail; } });
//# sourceMappingURL=index.js.map