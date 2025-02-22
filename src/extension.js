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
     console.log("✅ CppShield Extension Activated!");
    vscode.window.showInformationMessage("✅ CppShield is now active!");
    let diagnosticCollection = vscode.languages.createDiagnosticCollection('cpp-analyzer');
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'cpp') {
            analyzeCode(event.document, diagnosticCollection);
        }
    });
    vscode.workspace.onDidOpenTextDocument(document => {
        if (document.languageId === 'cpp') {
            analyzeCode(document, diagnosticCollection);
        }
    });
    context.subscriptions.push(diagnosticCollection);
}
function analyzeCode(document, diagnosticCollection) {
    const code = document.getText();
    const tempFilePath = path.join(os.tmpdir(), 'temp_code.cpp');
    fs.writeFileSync(tempFilePath, code);
    const clangTidyPath = 'clang-tidy'; // Ensure clang-tidy is installed
    cp.exec(`${clangTidyPath} ${tempFilePath} --checks=-*,bugprone-uninit-variable`, (err, stdout, stderr) => {
        if (err) {
            console.error('Error running clang-tidy:', err);
            return;
        }
        const diagnostics = [];
        // Parse clang-tidy output
        const lines = stdout.split('\n');
        for (const line of lines) {
            const match = line.match(/:(\d+):(\d+): warning: (.*)/);
            if (match) {
                const lineNum = parseInt(match[1]) - 1; // VS Code uses zero-based indexing
                const colNum = parseInt(match[2]) - 1;
                const message = match[3];
                const range = new vscode.Range(lineNum, colNum, lineNum, colNum + 1);
                const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
                diagnostics.push(diagnostic);
            }
        }
        diagnosticCollection.set(document.uri, diagnostics);
    });
}

function deactivate() { }
//# sourceMappingURL=extension.js.map