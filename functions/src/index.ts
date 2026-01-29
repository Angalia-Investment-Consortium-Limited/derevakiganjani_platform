
// This is the main entry point for all your cloud functions.
// This file imports and exports all the individual functions from their respective modules.

import { setCustomUserRole } from './auth/customClaims';
import { onLicenseStatusChange, onNewJobPosted } from './notifications/triggers';
import { incrementJobApplicationCount, decrementJobApplicationCount } from './aggregations/counters';
import { generateThumbnail } from './storage/imageProcessing';

// Export all the functions for deployment
export {
  setCustomUserRole,
  onLicenseStatusChange,
  onNewJobPosted,
  incrementJobApplicationCount,
  decrementJobApplicationCount,
  generateThumbnail,
};
