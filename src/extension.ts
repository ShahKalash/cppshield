import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
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
function analyzeCode(document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection) {
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

        vscode.window.showInformationMessage("Clang-Tidy Output: " + stdout);

        if (err) {
            vscode.window.showErrorMessage(`Clang-Tidy Error: ${stderr || err.message}`);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const lines = stdout.split('\n');

        for (const line of lines) {
            console.log(` Parsing Line: ${line}`);  // DEBUG LINE

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

export function deactivate() {}
