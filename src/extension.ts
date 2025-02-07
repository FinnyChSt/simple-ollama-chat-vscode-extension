import * as vscode from "vscode";
import { getWebviewContent } from "./chatView";
import { Ollama } from "ollama";

export function activate(context: vscode.ExtensionContext) {
  console.log('started "deep-ollama-chat"');

  // Providing the implementation of the command with registerCommand
  // The commandId parameter matches the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "deep-ollama-chat.start",
    () => {
      // Display this message box to the user on start
      vscode.window.showInformationMessage("Start chatting with the Lama!");
      const panel = vscode.window.createWebviewPanel(
        "ollama chat",
        "Chat with a Lama",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      panel.webview.html = getWebviewContent();
      panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case "ask":
              const ollama = new Ollama();
              const streamResponse = await ollama.chat({
                model: "deepseek-r1:8b",
                messages: [{ role: "user", content: message.text }],
                stream: true,
              });

              //stream the response
              let responseText = "";
              for await (const response of streamResponse) {
                responseText += response.message.content;
                panel.webview.postMessage({
                  command: "response",
                  text: responseText,
                });
              }

              return;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
