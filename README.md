# Tauri 2.0

## Overview

Tauri 2.0 is a modern, open-source framework for building native desktop applications using web technologies (HTML, CSS, JavaScript) alongside a robust Rust-based backend. Its primary goals are:

- **Lightweight Executables**: Uses the system's native webview (like WebView2 on Windows, WKWebView on macOS, and WebKit on Linux) instead of bundling a full browser engine.
- **Enhanced Security**: Leverages Rust's memory safety guarantees and a strict command-based IPC system to minimize the attack surface.
- **High Performance**: Utilizes Rust for computationally intensive operations while keeping the UI flexible with web technologies.
- **Cross-Platform Support**: Write once and deploy on Windows, macOS, and Linux with minimal modifications.

## Technical Architecture

### Dual-Layer Design

Tauri splits the application into two major layers:

#### Frontend (UI Layer)
- **Webview-Based Rendering**: Uses the operating system's native webview component, reducing the bundle size significantly.
- **Framework Agnostic**: Supports any modern web framework (React, Vue, Svelte, Angular, etc.). The frontend consists of static assets (HTML, JS, CSS) served inside a native window.

#### Backend (Core Layer)
- **Rust-Powered**: The backend is written in Rust, known for its performance and safety. It compiles to native code, ensuring low memory overhead and high speed.
- **Secure IPC (Inter-Process Communication)**: The frontend communicates with the Rust backend via a command-based system. Only whitelisted commands can be called, significantly reducing the risk of remote code execution or unintended system access.
- **Access to Native APIs**: Through Rust, Tauri can interact with operating system APIs (file system, notifications, window management) without exposing these directly to the web layer.

### Communication
- **Command Invocation**: In your frontend JavaScript, you call Tauri's API (e.g., `window.__TAURI__.invoke('command_name', { param: value })`) to execute a function implemented in Rust.
- **JSON Messaging**: Communication is typically serialized in JSON, ensuring a simple and secure data exchange.
- **Whitelisting & Security**: The Rust backend only exposes explicitly defined functions, minimizing the surface area for potential exploits.

## Build & Packaging Process

- **Tauri CLI**: Used to scaffold, build, and package your app. It handles project initialization, development mode with live reloading, and production builds.
- **Configuration Files**: `tauri.conf.json` or `tauri.conf.rs` allow you to customize many aspects of your app, including window settings, security policies, and build options.

## Installation and Environment Setup

### Prerequisites

- **Node.js and npm**: Required to manage the frontend assets and run the Tauri CLI. Download from [nodejs.org](https://nodejs.org).
- **Rust and Cargo**: Install from [rust-lang.org](https://rust-lang.org). Use `rustup update` to keep your Rust installation current.
- **C++ Build Tools**: 
  - On Windows, install via the Visual Studio Installer (ensure you include the C++ workload).
  - On macOS and Linux, make sure you have the necessary build essentials (like Xcode command line tools on macOS).

### Installing the Tauri CLI

You can install the Tauri CLI globally using either npm or Cargo:

```bash
# Using npm
npm install -g @tauri-apps/cli

# Using cargo (Rust's package manager)
cargo install tauri-cli
```

### IDE and Developer Tools

**Visual Studio Code (VS Code)**: Install the VS Code Tauri extension for integrated Tauri commands and the rust-analyzer extension for Rust code intelligence.

## Creating and Running a Tauri App

### Setting Up a New Tauri Project

You can start from scratch using the Tauri CLI, which scaffolds the project for you:

```bash
npm create tauri-app@latest
```

During the setup, you'll be prompted to choose:
- Package Manager: (e.g., npm, yarn, or pnpm)
- Template: Choose a template such as React, Vue, or Svelte.
- Language: Option for JavaScript or TypeScript.

Once the project is created:

```bash
cd your-tauri-app
npm install
```

### Running in Development Mode

To develop your application with live reloading:

```bash
npm run tauri dev
```

This command starts both your web development server and the Tauri backend, allowing you to see changes in real time.

### Building for Production

After development, you can compile your app into a native executable:

```bash
npm run tauri build
```

The output will be located in the `src-tauri/target/release` folder, ready for distribution.

## Detailed Tauri API and Command System

### Defining Rust Commands

Commands in Tauri are Rust functions that you expose to the frontend. Here's an example:

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}!", name)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

- **Annotation**: The `#[tauri::command]` attribute registers the function so it can be invoked from JavaScript.
- **Handler Registration**: `tauri::generate_handler![greet]` collects the command(s) for use in the Tauri builder.

### Calling Commands from the Frontend

In your JavaScript/TypeScript code, you can call the Rust command:

```javascript
import { invoke } from '@tauri-apps/api/tauri';

async function sayHello() {
  const greeting = await invoke('greet', { name: 'Alice' });
  console.log(greeting); // "Hello, Alice!"
}
```

- **Security Aspect**: Only functions registered in the backend are accessible, preventing arbitrary code execution.

## Advanced Configuration and Customization

### Tauri Configuration File

The `tauri.conf.json` (or Rust version `tauri.conf.rs`) is central to configuring your Tauri app. Key configuration sections include:

- **Window Settings**: Set the default window size, resizability, title, and even custom animations.
- **Security Policies**: Configure Content Security Policy (CSP) rules to control what web resources can be loaded.
- **Build Options**: Specify icons, bundle identifiers, and platform-specific settings (like signing on macOS).

Example snippet from a `tauri.conf.json`:

```json
{
  "tauri": {
    "windows": [
      {
        "title": "My Tauri App",
        "width": 800,
        "height": 600,
        "resizable": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    },
    "bundle": {
      "identifier": "com.example.mytauriapp",
      "icon": ["icons/icon.png"]
    }
  }
}
```

### Customizing the Build Process

- **Feature Flags**: Tauri supports conditional compilation in Rust. You can enable or disable features to further reduce the binary size.
- **Resource Management**: Define which assets (images, additional scripts, etc.) should be bundled with the application.

## Advantages, Use Cases, and Comparisons

### Advantages Over Other Frameworks

- **Performance & Resource Efficiency**: Tauri apps are significantly smaller and use fewer system resources compared to Electron because they do not include an embedded browser engine.
- **Security**: Rust's compile-time safety combined with Tauri's restricted command interface ensures that the attack surface is minimal.
- **Modern Development Experience**: Use familiar web development tools, libraries, and frameworks while enjoying native performance and OS integration.
- **Customizability**: Fine-tune everything from the window appearance to low-level OS interactions through Rust.

### When to Use Tauri

- **Desktop Applications with a Web-Based UI**: Ideal for projects that want to reuse web development skills to create native apps.
- **Resource-Constrained Environments**: When you need a small installation footprint and lower memory/CPU usage.
- **High-Security Applications**: Projects that require strong isolation between the UI and native functionalities.

### Comparisons with Alternatives

| Feature | Tauri | Electron | Flutter / React Native |
|---------|-------|----------|------------------------|
| Bundle Size | Very small (<10 MB) | Large (often 100+ MB) | Varies; mobile focus |
| Memory Usage | Low | Relatively high | Optimized for mobile |
| Security | Rust safety + IPC restrictions | Node.js integration risks | Varies, not typically desktop |
| Performance | Near-native performance in Rust | Extra overhead from Chromium | Optimized for mobile UI |
| Cross-Platform | Excellent for desktop (Windows, macOS, Linux) | Excellent for desktop | Primarily mobile and web |

## Real-World Examples and Use Cases

- **Productivity Apps**: Note-taking, task managers, and lightweight editors where a responsive UI and small install size are crucial.
- **Enterprise Tools**: Internal applications where security, resource management, and cross-platform deployment are essential.
- **Prototyping & Educational Tools**: Projects that allow rapid prototyping with familiar web technologies while having access to native system features.

## Conclusion

Tauri 2.0 represents a paradigm shift in desktop application development by seamlessly combining the ease of modern web development with the power and safety of Rust. Its innovative approach results in lightweight, secure, and high-performance applications, making it an excellent alternative to more resource-heavy frameworks like Electron.

For academic or practical applications, Tauri's modular architecture, robust security measures, and efficient use of system resources offer a rich case study in modern software engineering practices.

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
