 *  Executing task: (set -o pipefail && firebase deploy --only functions:selcomWebhook 2>&1 | tee /tmp/ai.1.log) 


=== Deploying to 'derevakiganjani'...

i  deploying functions
i  functions: preparing codebase default for deployment
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
i  artifactregistry: ensuring required API artifactregistry.googleapis.com is enabled...
⚠  functions: Runtime Node.js 20 will be deprecated on 2026-04-30 and will be decommissioned on 2026-10-30, after which you will not be able to deploy without upgrading. Consider upgrading now to avoid disruption. See https://cloud.google.com/functions/docs/runtime-support for full details on the lifecycle policy
⚠  functions: package.json indicates an outdated version of firebase-functions. Please upgrade using npm install --save firebase-functions@latest in your functions directory.
⚠  functions: Please note that there will be breaking changes when you upgrade.
i  functions: Loading and analyzing source code for codebase default to determine what to deploy
i  functions: You are using a version of firebase-functions SDK (4.9.0) that does not have support for the newest Firebase Extensions features. Please update firebase-functions SDK to >=5.1.0 to use them correctly
Serving at port 8418

i  functions: preparing functions directory for uploading...
⚠ DEPRECATION NOTICE: Action required before March 2026

The functions.config() API and the Cloud Runtime Config service are deprecated. Deploys that rely on functions.config() will fail once Runtime Config shuts down in March 2026.

The legacy functions:config:* CLI commands are deprecated and will be removed before March 2026.

Learn how to migrate from functions.config() to the params package:

https://firebase.google.com/docs/functions/config-env#migrate-config

To convert existing functions.config() values to params, try the interactive migration command:

  firebase functions:config:export

i  functions: packaged /home/user/derevakiganjani_platform/functions (92.21 KB) for uploading
✔  functions: functions source uploaded successfully

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/derevakiganjani/overview
 *  Terminal will be reused by tasks, press any key to close it. 
