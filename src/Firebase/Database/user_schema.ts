interface UserSchema {
  uid: string;            // Unique user ID, e.g. "lBxhvTkDUXMsX3eHoA1Zi9mdHqU2"
  plan: 'free' | 'paid' | 'dev'; 
  email: string,          // e.g. "free", "premium", etc.
  sessionIDs: User_sessions[];   // Array of session document IDs (unique strings)
  token_remain: number; // Remaining tokens for the user, e.g. 5000
  free_upload: number   
}
interface User_sessions{
  title: string,
  sessionId: string
}
export type {UserSchema, User_sessions}