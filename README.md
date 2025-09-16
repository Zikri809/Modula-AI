# Modula AI


![GitHub commit activity](https://img.shields.io/github/commit-activity/w/Zikri809/Modula-AI?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/Zikri809/Modula-AI?style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/Zikri809/Modula-AI?style=for-the-badge)
![GitHub top language](https://img.shields.io/github/languages/top/Zikri809/Modula-AI?style=for-the-badge)
![GitHub contributors](https://img.shields.io/github/contributors/Zikri809/Modula-AI?style=for-the-badge)


Modula AI is web interface powered by Next Js for multimodal , multiinput and persistent chatbot that are capable of using persistent memory to remember unique details and preferences of the user.


## Features
1. Multimodal - capable of receiving text and file prompt (max 3 file per upload)
2. Multi LLM - capable of changing to multiple LLM mid conversation
3. Token Cost Saving - files undergo OCR upon upload stored in DB for subsequent used
4. Persistent Memory - User persona are extracted using an LLM (Gemini-2.0 Flash)


## Technologies Used
[![My Skills](https://skillicons.dev/icons?i=nextjs,react,tailwind,js,ts,html,css,firebase,supabase,postgres)](https://skillicons.dev)

## Demo 
https://modula-ai-mu.vercel.app/

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Zikri809/Modula-AI.git
   cd Modula-AI

2. **Install dependencies**

   Make sure you have Node.js (>=18) and npm or yarn installed.

    ````
   npm install
   # or
   yarn install
3. **Set up environment variables**
    > ⚠️ Keep `SUPABASE_SERVICE_KEY` and `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY` **server-side only**.  Do not expose them in frontend bundles.

    Create a `.env` file in the project root and fill in the following variables:

    ```bash
    # -------------------------
    # Firebase (Client SDK)
    # -------------------------
    NEXT_PUBLIC_API_KEY=                # Firebase web API key
    NEXT_PUBLIC_AUTH_DOMAIN=            # Firebase Auth domain (e.g. myapp.firebaseapp.com)
    NEXT_PUBLIC_PROJECT_ID=             # Firebase project ID
    PUBLIC_STORAGE_BUCKET=              # Firebase storage bucket (public assets)
    NEXT_PUBLIC_MESSAGING_SENDER_ID=    # Firebase messaging sender ID
    NEXT_PUBLIC_APP_ID=                 # Firebase app ID
    NEXT_PUBLIC_MEASUREMENT_ID=         # Firebase analytics measurement ID

    # -------------------------
    # Firebase (Admin SDK)
    # -------------------------
    FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY= # JSON string for Firebase Admin SDK service account

    # -------------------------
    # Authentication
    # -------------------------
    SHARED_JWT_SECRET=                  # Secret used to sign/verify custom JWTs

    # -------------------------
    # AI / LLM APIs
    # -------------------------
    KIMI_K2_API_KEY=                    # OpenRouter API key (for all model not just KIMI)
    GEMINI_API=                         # Gemini API key

    # -------------------------
    # Application Origins
    # -------------------------
    DEV_ORIGIN=http://localhost:3000    # Local dev origin
    PROD_ORIGIN=                        # Production origin (e.g. https://yourapp.com)

    # -------------------------
    # Database (Postgres / Prisma)
    # -------------------------
    DATABASE_URL=                       # Full database connection string
    DIRECT_URL=                         # Direct DB connection (optional, for migrations)

    NODE_ENV="development"              # Set to "development" or "production"

    # -------------------------
    # Supabase
    # -------------------------
    SUPABASE_URL=                       # Supabase project URL
    SUPABASE_ANON_KEY=                  # Public anon key for client-side use
    SUPABASE_SERVCE_KEY=                # Service role key (server-side only, keep secret!)
    ```

5. **Run the development server**

    ```bash
      npm run dev
      # or
      yarn dev
    ```

    Your app should now be running at http://localhost:3000.

6. **Build for production (optional)**

    ```bash
    npm run build
    npm start
    ```

## Deployment
Recommended: [Vercel](https://vercel.com/) for frontend and serverless backend + Firebase/Supabase for infra.  
1. Push your fork to GitHub.  
2. Import repo into Vercel and set up environment variables.  
3. Connect Firebase and Supabase projects.



## How To Use
1. When you visit the localhost:3000, you will be redirected to a log in page
2. Log In with email or password, will be redirected to /chat upon success
3. Create new chat by clicking the button, chat_id will be append to the /chat?chat_id=[chat_id]
4. The Input at the bottom consist of text area of text prompt, file attachment (max 3), web search and reasoning toggle (Some Gemini model has auto reasoning), you can select llm available using the toggle and lastly a send button
5. To edit previous prompt there is a pen icon beside the date of user prompt (note: this will erase all the subsequent message after it) 

## Documentation  
For detailed setup, architecture overview, and advanced configuration, see the [full documentation](./docs/README.md).


## Credits
- [Next.js](https://nextjs.org/) for the framework
- [Firebase](https://firebase.google.com/) for Auth and Storage
- [Supabase](https://supabase.com/) for Postgres DB
- [Gemini](https://ai.google.dev/gemini-api/docs) for LLM Access and SDK
- [OpenAI](https://platform.openai.com/docs/libraries) for OpenRouter Access and SDK
- [OpenRouter](https://openrouter.ai/) for multi-LLM access


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
