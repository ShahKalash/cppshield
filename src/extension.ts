import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log("CppShield Extension Activated!");
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

function generateCompileCommands(document: vscode.TextDocument): string {
    const tempDir = os.tmpdir();  // Get the temp directory
    const tempFilePath = path.join(tempDir, 'temp_code.cpp');
    const compileCommandsPath = path.join(tempDir, 'compile_commands.json');

    const compileCommands = [
        {
            "directory": tempDir,
            "command": `clang++ -std=c++17 -Wall -Wextra ${tempFilePath}`,
            "file": tempFilePath
        }
    ];

    fs.writeFileSync(compileCommandsPath, JSON.stringify(compileCommands, null, 4));

    return tempDir; // Return directory instead of file path
}
function parseDiagnostics(output: string, document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection) {
    const diagnostics: vscode.Diagnostic[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
        console.log(`Parsing Line: ${line}`);

        const match = line.match(/:(\d+):(\d+): (warning|error): (.*)/);
        if (match) {
            const lineNum = parseInt(match[1]) - 1; // Convert to 0-based index
            const colNum = parseInt(match[2]) - 1;
            const severity = match[3] === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
            const message = match[4];

            const range = new vscode.Range(lineNum, colNum, lineNum, colNum + 1);
            const diagnostic = new vscode.Diagnostic(range, message, severity);
            diagnostics.push(diagnostic);
        }
    }

    diagnosticCollection.set(document.uri, diagnostics);
    console.log(` ${diagnostics.length} diagnostics added.`);
}


// Analyze C++ Code with Clang-Tidy (No compile_commands.json Needed)
function analyzeCode(document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection) {
    const code = document.getText();
    const tempFilePath = path.join(os.tmpdir(), 'temp_code.cpp');
    fs.writeFileSync(tempFilePath, code);

    // Generate compile_commands.json dynamically
    const compileCommandsDir = generateCompileCommands(document); // This should return the directory

    const clangTidyPath = 'clang-tidy';
    const command = `${clangTidyPath} ${tempFilePath} --checks="clang-analyzer-core.uninitialized.*" --export-fixes=- --extra-arg=-std=c++17 --extra-arg=-Wall --extra-arg=-Wextra --extra-arg=-DONLINE_JUDGE -p=${compileCommandsDir}`;

    cp.exec(command, (err, stdout, stderr) => {
        console.log("Clang-Tidy Output:\n", stdout);
        console.log("Clang-Tidy Error Output:\n", stderr);

        if (err) {
            vscode.window.showErrorMessage(`Clang-Tidy Error: ${stderr || err.message}`);
            return;
        }

        parseDiagnostics(stdout, document, diagnosticCollection);
    });
}

export function deactivate() {}
