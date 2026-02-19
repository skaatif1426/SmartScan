# **App Name**: NutriScan AI

## Core Features:

- Live Barcode/QR Scanner: Automatically detect and scan barcodes/QR codes using the device camera. Fallback for manual barcode input (numeric keyboard only). Provide guidance on enabling camera permissions if initially denied.
- Product Data Fetch: Fetch verified product information from the OpenFoodFacts API using the scanned barcode. Implement retry logic for API failures.
- AI Nutrition Insights & Multilingual Chatbot: Generate concise (1-2 lines), simple, and non-medical nutrition insights based on fetched product data using a LLM tool to decide on appropriate warnings. Integrate a chatbot that supports English, Hindi, Marathi, and Hinglish. Allow the user to set the system language.
- Scan History: Save scan history including product name, brand, date, and barcode, associated with the user.
- Analytics Dashboard: Track total scans, most scanned categories per user, and scan streaks/achievements.
- User Preferences: Allow users to set dietary preferences (e.g., veg/non-veg, allergies) to filter results. Implement a system for staged feature rollout (e.g., OS-specific feature visibility).
- Error Handling: Display clear and readable error messages for invalid barcodes, product not found, API timeouts, and scan failures.

## Style Guidelines:

- Primary color: Light sea green (#20B2AA), evoking health and nature without being overly cliché.
- Background color: Very light greenish gray (#F5F5F5), providing a clean backdrop.
- Accent color: Soft orange (#FFA07A), to draw attention to CTAs and important information, while providing good contrast.
- Body and headline font: 'Inter', sans-serif, providing a clean and modern feel, suitable for both headlines and body text.
- Use simple, minimalist icons for product categories and user preferences.
- Mobile-first, clean and minimal design with no unnecessary clutter or decorative elements.
- Subtle loading animations while fetching product data.