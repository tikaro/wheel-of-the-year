# Dev Container Configuration

This directory contains the development container configuration for the Wheel of the Year React application.

## What's Included

### Base Image
- **Node.js 20** on Debian Bookworm
- Official Microsoft devcontainer image for JavaScript/Node.js development

### Features
- **Node.js**: Version 20 LTS
- **SSH Server**: For remote access and port forwarding

### VS Code Extensions
The following extensions are automatically installed:
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **ES7+ React/Redux/React-Native snippets** - React development snippets
- **vscode-styled-components** - Styled components support
- **Language Stylus** - Stylus syntax support

### Ports
- **Port 3000** - React development server (automatically forwarded)

### Post-Create Setup
After the container is created, the `postcreate.sh` script will:
1. Update apt packages
2. Install lolcat for fun terminal output
3. Run `yarn install` to install all project dependencies
4. Set up SSH directory with proper permissions

## Using the Dev Container

### With GitHub Codespaces
1. Navigate to the repository on GitHub
2. Click the green "Code" button
3. Select the "Codespaces" tab
4. Click "Create codespace on [branch]"

### With VS Code
1. Install the "Dev Containers" extension
2. Open the repository in VS Code
3. Press `F1` and select "Dev Containers: Reopen in Container"

## Starting the Development Server

Once inside the container, run:
```bash
yarn start
```

The app will be available at `http://localhost:3000`

## Other Commands

- `yarn test` - Run tests
- `yarn build` - Build for production
