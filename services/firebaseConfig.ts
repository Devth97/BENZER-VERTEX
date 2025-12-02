
import { initializeApp } from "firebase/app";
import { getVertexAI, VertexAI } from "firebase/vertexai";

// ------------------------------------------------------------------
// CONFIGURATION STATUS:
// Credentials have been populated based on user input.
// Ensure "Vertex AI in Firebase" is ENABLED in the Firebase Console
// and the project is on the BLAZE (Pay-as-you-go) plan.
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCcktCgCClQEMcTp7egEjh0ZPk8i5h13BY",
  authDomain: "tailorpreview.firebaseapp.com",
  projectId: "tailorpreview",
  storageBucket: "tailorpreview.firebasestorage.app",
  messagingSenderId: "746496504402",
  appId: "1:746496504402:web:022bc26f165be7c1b9a58b",
  measurementId: "G-LHCJN0RMVS"
};

let app: any;
let vertexAI: VertexAI | undefined;
let isInitialized = false;

// Check if the user has replaced the placeholders
const isConfigured = firebaseConfig.projectId !== "YOUR_PROJECT_ID" && 
                     !firebaseConfig.projectId.includes("your-project-id");

// Lazy initialization function
export const getAI = (): VertexAI => {
  if (!isConfigured) {
    throw new Error("Firebase Config missing. Please update services/firebaseConfig.ts with your credentials.");
  }

  if (isInitialized && vertexAI) {
    return vertexAI;
  }

  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
    }
    vertexAI = getVertexAI(app);
    isInitialized = true;
    console.log("✅ Firebase Vertex AI initialized successfully");
    return vertexAI;
  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error);
    throw new Error("Failed to initialize AI service. Check console for details.");
  }
};

export { isConfigured };
