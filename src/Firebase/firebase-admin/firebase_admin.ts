import * as admin from 'firebase-admin';

const service_account_key = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;

if (!service_account_key) {
    //console.log('there is not service account key provided')
    throw new Error('there is not service account key provided');
}
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(service_account_key)),
    });
}

export const auth = admin.auth();
export const db = admin.firestore();
export const bucket = admin
    .storage()
    .bucket(process.env.NEXT_PUBLIC_STORAGE_BUCKET);
