# rmmbr

## Quick start guide

1. **Make sure you have `node` installed on your computer**

2. **Install dependencies**

    ```shell
    npm install
    ```

3. **Run dev server**

    ```shell
    npm run dev
    ```

The app is now running at `https://localhost:5173/`

Open the `rmmbr` directory in your code editor of choice and start developing. Save your changes and the browser will update in real time!

## Build

1.  **Install dependencies using yarn**
    
    ```shell
    npm install
    ```

2.  **Build the app**

    ```shell
    npm run build
    ```

    After this step, the built app is located inside the `dist` directory in a project root.
    
3. **Launch the app**

    ```shell
    npm run preview 
    ```
    3.1 You can combine step 2 and 3 by running:

    ```shell
    npm run prod
    ```
   
4. **Visit the app** 

    Your app is now running at `https://localhost:4173/`

    Open it in your browser and see how the app will look like when you deploy it!

## Commands

You should run the following commands as `npm run <command>` (e.g. `npm run test:unit`)

- `dev` - run a server in development mode
- `build` - build the app for production
- `build:github` - build the app for github pages
- `preview` - run a server in production mode (you have to `build` the app first)
- `prod` - run a server in production mode (combines `build` and `preview` commands)
- `test:unit` - run unit tests
- `lint:check` - check linting rules
- `types:check` - check for all TypeScript types in the project to be correct

## Dev Stack

These are the main libraries/dependencies you should be comfortable with to properly work on this project.

- **TypeScript**
- **Vite**
- **Vitest**
- **Tailwind**
- **Firebase**

## Github Workflows

There're several github workflows that are run depending on some actions:

### ESlint

This workflow checks for linting rules in the project files

*Runs on:*
  - PR to `master`
  - Push to `master`

### TypeScript

This workflow checks for typescript types in the project to be valid

*Runs on:*
  - PR to `master`
  - Push to `master`

### Vitest

This workflow runs unit tests in the project and makes sure that all tests are passing

*Runs on:*
  - PR to `master`
  - Push to `master`

### Deploy

This workflow deploys the app to [`https://rasulomaroff.github.io/rmmbr/`](https://rasulomaroff.github.io/rmmbr/)

*Runs on:*
  - Push to `master`
