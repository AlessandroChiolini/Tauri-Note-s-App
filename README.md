# Tauri Notes App
This project is a simple notes app built with Tauri and React. It is a simple CRUD app that allows you to create, read, update, and delete notes.
The objective of the app is to demonstrate that Tauri can be used to build desktop, web and mobile applications with a single codebase.
It will be used to compare it with Electron mainly, but also with other frameworks like Flutter, React Native, etc.

## Environment Setup
### Node.js and npm
You need to have Node.js and npm installed on your machine. You can download them from [here](https://nodejs.org/en).

### Rust
You need to have Rust installed on your machine. You can download it from [here](https://www.rust-lang.org/fr/tools/install).

To check if Rust is up to date 
```bash
rustup update
```

### C++ tools
You need to have C++ tools installed on your machine. You can install them with the Visual Studio Installer : 
![image info](./images/visualstudioC.png)

### Tauri CLI
You need to have Tauri CLI installed on your machine. You can install it by running the following command:
```bash
npm install -g @tauri-apps/cli
```

or 

```bash
cargo install tauri-cli
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Project Setup
### Tauri App from 0
To create a new Tauri app from scratch, you can run the following command:
```bash
npm create tauri-app@latest
```

You will then have to follow the prompts to choose : 
- The Package Manager : We have chosen npm
- The Template : We have chosen React
- Javascript or Typescript : We have chosen Javascript

Once the project is created, you can navigate inside it : 
```bash
cd tauri-app
```

And you can install the dependencies 
```bash
npm install
```

### Tauri App from this repository
To run this project, you can clone the repository and navigate inside it:
```bash
git clone https://github.com/AlessandroChiolini/Tauri-Note-s-App.git
cd Tauri-Note-s-App
npm install
```

## Running the App
To run the app, you can run the following command:
```bash
npm run tauri dev
```

This will start the Tauri app in development mode. You can now open the app on your desktop and start using it.

## Building the App
To build the app, you can run the following command:
```bash
npm run tauri build
```

This will build the app for your current platform. You can find the built app in the `src-tauri/target/release` directory.
