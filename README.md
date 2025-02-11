# Egoverse

This repository contains the source code for [Egoverse](https://github.com/dennisego1999/egoverse), a project structured into two main folders: `app` and `server`.

## Node Version
Make sure you're using the correct Node.js version for the project by running the following in the root of the repository:
```sh
   nvm use
   ```

## Folder Structure

### `app` - Frontend
The `app` folder contains the frontend built with Vue.js. To set up and run the frontend, follow these steps:

1. Navigate into the `app` folder:
   ```sh
   cd app
   ```
2. Install dependencies:
   ```sh
   yarn
   ```
3. Start the development server:
   ```sh
   yarn dev
   ```
4. Build the project for production:
   ```sh
   yarn build
   ```

### `server` - Socket.IO Server
The `server` folder contains the WebSocket logic powered by Socket.IO. To run the socket server:

1. Navigate into the `server` folder:
   ```sh
   cd server
   ```
2. Install dependencies:
   ```sh
   yarn
   ```
3. Start the Socket.IO server:
   ```sh
   yarn socket

