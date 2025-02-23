"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
function activate(context) {
    console.log("CppShield Extension Activated! 🚀");
    let diagnosticCollection = vscode.languages.createDiagnosticCollection('cpp-analyzer');
    vscode.workspace.onDidSaveTextDocument(document => {
        if (document.languageId === 'cpp') {
            analyzeCode(document, diagnosticCollection);
        }
    });
    vscode.workspace.onDidOpenTextDocument(document => {
        if (document.languageId === 'cpp') {
            analyzeCode(document, diagnosticCollection);
        }
    });
    let disposable = vscode.commands.registerCommand('cppshield.analyzeCode', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'cpp') {
            analyzeCode(editor.document, diagnosticCollection);
            vscode.window.showInformationMessage('C++ Code Analysis Completed!');
        }
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(diagnosticCollection);
}
// Analyze C++ Code with Clang-Tidy (No compile_commands.json Needed)
function analyzeCode(document, diagnosticCollection) {
    const code = document.getText();
    const tempFilePath = path.join(os.tmpdir(), 'temp_code.cpp');
    fs.writeFileSync(tempFilePath, code);
    const clangTidyPath = 'clang-tidy';
    //Using --extra-arg to provide manual compilation flags (No compile_commands.json needed)
    // const command = `${clangTidyPath} ${tempFilePath} --checks="clang-analyzer-core.uninitialized.*" --extra-arg=-std=c++17 --extra-arg=-Wall --extra-arg=-Wextra --extra-arg=-I/usr/include/c++/11`;
    const command = `${clangTidyPath} ${tempFilePath} --checks="clang-analyzer-core.uninitialized.*" --extra-arg=-std=c++17 --extra-arg=-Wall --extra-arg=-Wextra --extra-arg=-I/usr/include/c++/11 --extra-arg=-DONLINE_JUDGE`;
    cp.exec(command, (err, stdout, stderr) => {
        console.log("Clang-Tidy Output:\n", stdout);
        console.log("Clang-Tidy Error Output:\n", stderr);
        // vscode.window.showInformationMessage("Clang-Tidy Output: " + stdout);
        if (err) {
            // vscode.window.showErrorMessage(`Clang-Tidy Error: ${stderr || err.message}`);
            return;
        }
        const diagnostics = [];
        const lines = stdout.split('\n');
        for (const line of lines) {
            console.log(` Parsing Line: ${line}`); // DEBUG LINE
            const match = line.match(/:(\d+):(\d+): (warning|error): (.*)/);
            if (match) {
                console.log(` Matched Warning/Error at ${match[1]}:${match[2]} → ${match[4]}`); // DEBUG MATCH
                const lineNum = parseInt(match[1]) - 1; // Convert to 0-based index
                const colNum = parseInt(match[2]) - 1;
                const message = match[4];
                const range = new vscode.Range(lineNum, colNum, lineNum, colNum + 1);
                const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
                diagnostics.push(diagnostic);
            }
        }
        diagnosticCollection.set(document.uri, diagnostics);
        console.log(` ${diagnostics.length} diagnostics added.`);
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map