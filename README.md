<<<<<<< HEAD
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e555b8cf-8c9a-45db-bf3a-8b39857b697d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e555b8cf-8c9a-45db-bf3a-8b39857b697d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Skin image analysis (Gemini)

This app includes an Express backend that accepts a skin image upload and forwards it to Gemini 1.5 for multimodal analysis. Results are shown in the `Skin Disease Classifier` tool.

Important: This is not a medical diagnosis. Consult a dermatologist or qualified clinician.

### Setup

1. Create a `.env` file in the project root with:

```
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

2. Install dependencies:

```
npm install
```

3. Run backend and frontend together (frontend proxies `/api` to backend):

```
npm run dev:all
```

### API

POST `/api/skin/analyze`

Form fields:
- `image` (required): file (jpeg/png), up to 5MB
- `affectedArea` (optional): string

Response: JSON with possible conditions, recommendations, disclaimer, and sources.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e555b8cf-8c9a-45db-bf3a-8b39857b697d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
=======
# update_med_hub
>>>>>>> 8b0b0e645ab33f4ecad4bc337b4fcc734aac4d39
