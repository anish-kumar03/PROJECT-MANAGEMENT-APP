/**
 * Firebase Admin + Cloud Firestore Connection Test
 * -------------------------------------------------
 * This script verifies that:
 *   1. The Firebase Admin SDK initializes successfully.
 *   2. Application Default Credentials load correctly.
 *   3. A Cloud Firestore API request succeeds.
 *
 * Usage:
 *   node scripts/test-firebase.js
 *
 * Prerequisites:
 *   - serviceAccountKey.json must exist in the project root.
 *   - GOOGLE_APPLICATION_CREDENTIALS must be set in .env
 *     (this script loads .env itself via firebaseAdmin.js).
 */

import { app, db } from "../src/firebaseAdmin.js";

try {
    // Verify the SDK initialized and we can read the project ID.
    const projectId = app.options.projectId ?? app.options.credential?.projectId;
    console.log("──────────────────────────────────────────────");
    console.log("Firebase Admin initialization : ✔ successful");
    console.log("Project ID                    :", projectId ?? "(not available)");

    // Attempt a non-destructive Firestore read (list root collections).
    const collections = await db.listCollections();

    console.log("Cloud Firestore request       : ✔ successful");
    console.log("Root collection count         :", collections.length);

    if (collections.length > 0) {
        console.log(
            "Collections                   :",
            collections.map((c) => c.id).join(", ")
        );
    } else {
        console.log("(No collections yet — the database is empty, which is expected for a new project.)");
    }

    console.log("──────────────────────────────────────────────");
    console.log("✅ All checks passed. Firestore is connected.");
    process.exit(0);
} catch (error) {
    console.error("──────────────────────────────────────────────");
    console.error("❌ Cloud Firestore verification failed.");
    console.error("Error code   :", error.code ?? "Unknown");
    console.error("Error message:", error.message);

    // Provide actionable guidance for common errors.
    if (error.code === 5 || error.message?.includes("NOT_FOUND")) {
        console.error("\n💡 This usually means the Cloud Firestore database has not been created yet.");
        console.error("   Go to https://console.firebase.google.com/ → your project → Firestore Database → Create database.");
    } else if (error.code === 7 || error.message?.includes("PERMISSION_DENIED")) {
        console.error("\n💡 The service account does not have permission to access Firestore.");
        console.error("   Check IAM roles in the Google Cloud Console.");
    } else if (error.message?.includes("Could not load the default credentials")) {
        console.error("\n💡 GOOGLE_APPLICATION_CREDENTIALS is not set or the file path is incorrect.");
        console.error("   Verify that .env contains the correct path and serviceAccountKey.json exists.");
    }

    console.error("──────────────────────────────────────────────");
    process.exit(1);
}
