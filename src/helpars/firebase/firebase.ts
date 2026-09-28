import admin from "firebase-admin";
import { serviceAccount } from "../../config/serviceAccount";


if (
  !admin.apps.length &&
  serviceAccount.project_id &&
  serviceAccount.private_key &&
  !serviceAccount.private_key.includes("your-project-id")
) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
  } catch (error) {
    console.warn("Firebase Admin SDK failed to initialize:", error);
  }
}

export default admin;
