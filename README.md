# Buzztracker Backend

This repository hosts the source code for the backend of [buzztracker](https://github.com/swe-grpup-71/react-native-app).

## Prerequisites
If you want to try on this project, please ensure that you have the following:
1. [Google Cloud account](https://console.cloud.google.com/)
2. **JSON private key** for a Google Cloud Service Account with appropriate permissions (ref: https://blog.cloudflare.com/api-at-the-edge-workers-and-firestore/#building-the-api)
3. [Cloudflare account](https://dash.cloudflare.com/)
4. A Cloudflare Workers named `buzztracker-backend`
5. Configure secrets for the Cloudflare Workers and a `.dev.vars` file at the root directory of the project in the following format:
```
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
GOOGLE_CLOUD_SERVICE_ACCOUNT=your-flattened-json-private-key-for-the-service-account
```

## Development Environment
1. [Node.js](https://nodejs.org/en)
2. npm (normally bundled along with Node.js)
3. [VSCode](https://code.visualstudio.com/)
4. (Optional) [ESLint VSCode Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
5. (Optional) [Prettier VSCode Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
6. (Optional) [Git Graph VSCode Extension](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph)

## Launch a local development server
```
npm install
npm run dev
```

## Deploy the backend service
```
npm run deploy
```
