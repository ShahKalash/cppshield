# **CppShield - Real-time C++ Error Detection**

CppShield is a **VS Code extension** that provides **real-time static error detection** for C++ code.  
It highlights **uninitialized variables, deprecated functions, implicit conversions, and other potential issues** while you type.

## **✨ Features**

✅ **Detects various C++ warnings and errors** using `clang-tidy` and `-Wall`.  
✅ **Highlights error lines in real time** inside VS Code.  
✅ **Works seamlessly in any C++ project**.  
✅ **No need for compile_commands.json**, works without CMake.  
✅ **Starts automatically when a C++ file is opened**, but if it doesn’t, open the **Command Palette** (`Ctrl+Shift+P`) and run `CppShield`.  
✅ **Runs on every file save**. Works smoothly if **Auto Save** is enabled with **"after delay"** in VS Code settings.

---

## **🔍 Errors/Warnings Detected (`-Wall`)

CppShield detects the following issues in C++ code:  
✔ **Uninitialized Variables**  
✔ **Use of Deprecated Functions**  
✔ **Implicit Conversions That Lose Data** (e.g., `int` to `char`)  
✔ **Missing Return Statements**  
✔ **Unused Variables or Functions**  
✔ **Dangling Else** in `if-else` chains  
✔ **Signed/Unsigned Mismatches**  
✔ **Misleading Indentation Warnings**

---

## **🚀 Installation**

### **1️⃣ Install Clang-Tidy (if not installed)**

CppShield requires `clang-tidy` for error analysis. Install it using:

**🔹 Linux (Ubuntu/Debian):**

```sh
sudo apt install clang-tidy
```

**🔹 macOS (Homebrew):**

```sh
brew install llvm
```

**🔹 Windows (via LLVM):**

1. Download LLVM from [LLVM official site](https://releases.llvm.org/).
2. Add `clang-tidy` to the system `PATH`.

---

### **2️⃣ Install CppShield in VS Code**

#### **Option 1: Direct Installation (Recommended)**

You can install CppShield directly from the VS Code Marketplace once published.

#### **Option 2: Install Manually (.vsix file)**

1. Clone this repository and navigate to the folder:
   ```sh
   git clone https://github.com/ShahKalash/cppshield.git
   cd cppshield
   ```
2. Install `vsce` (VS Code Extension Manager) if not installed:
   ```sh
   npm install -g @vscode/vsce
   ```
3. Package the extension:

   ```sh
   npx vsce package
   ```

   This generates a `.vsix` file (e.g., `cppshield-0.0.1.vsix`).

4. Install in VS Code:
   ```sh
   code --install-extension cppshield-0.0.1.vsix
   ```

---

## **🎯 How to Use**

1. **Open a C++ file** (`.cpp`) in VS Code.
2. **Write code**, and CppShield will **highlight errors and warnings in real time**.
3. If errors are not highlighted, ensure `clang-tidy` is installed and accessible.
4. **CppShield should start automatically**, but if it doesn’t, open the **Command Palette** (`Ctrl+Shift+P`) and select `CppShield`.
5. **CppShield runs on every file save**, so for a smooth experience, enable **Auto Save** with **"after delay"** in VS Code settings.

---

## **⚙️ Configuration (Optional)**

You can customize CppShield by modifying `settings.json` in VS Code:

```json
{
  "cppshield.checks": "clang-analyzer-core.uninitialized.*,clang-diagnostic-*",
  "cppshield.extraArgs": ["--extra-arg=-std=c++17"]
}
```

Adjust checks and arguments based on your project needs.

---

## **📢 Contributing**

Feel free to **report issues** or **suggest features** by opening an issue or pull request on GitHub.

---

🚀 **CppShield helps you write safer, cleaner, and more efficient C++ code!** 🚀
