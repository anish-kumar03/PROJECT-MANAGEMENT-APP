import { resolve } from "path";
import dotenv from "dotenv";

// Load .env BEFORE Firebase Admin reads GOOGLE_APPLICATION_CREDENTIALS.
// This is necessary because ES Module `import` statements are hoisted —
// dotenv.config() in index.js would run AFTER this module is evaluated.
dotenv.config({ path: "./.env" });

// Resolve the relative credential path to an absolute path.
// applicationDefault() needs an absolute path to locate the JSON key file.
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(
        process.env.GOOGLE_APPLICATION_CREDENTIALS
    );
}

import {
    applicationDefault,
    getApps,
    initializeApp,
} from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: applicationDefault(),
        });

const db = getFirestore(app);

export { app, db };