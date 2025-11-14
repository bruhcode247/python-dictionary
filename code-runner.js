// Pyodide Code Runner for Python Documentation
let pyodide = null;
let pyodideReady = false;

// Initialize Pyodide
async function initPyodide() {
  if (pyodideReady) return;
  try {
    pyodide = await loadPyodide();
    pyodideReady = true;
    console.log("Pyodide loaded successfully");
  } catch (error) {
    console.error("Failed to load Pyodide:", error);
  }
}

// Initialize Pyodide when page loads
window.addEventListener("load", initPyodide);

// Copy code functionality
function copyCode(button) {
  const codeContainer = button.closest(".code-container");
  const code = codeContainer.querySelector("code");
  const text = code.textContent.trim();

  navigator.clipboard
    .writeText(text)
    .then(() => {
      button.textContent = "Copied!";
      button.classList.add("copied");

      setTimeout(() => {
        button.textContent = "Copy";
        button.classList.remove("copied");
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
}

// Run code functionality
async function runCode(button) {
  const codeContainer = button.closest(".code-container");
  const code = codeContainer.querySelector("code");
  const output = codeContainer.querySelector(".code-output");
  const codeText = code.textContent.trim();

  // Show loading state
  button.innerHTML = '<span class="loading-spinner"></span> Running';
  button.classList.add("running");
  output.classList.remove("error");
  output.classList.add("show");

  try {
    if (!pyodideReady) {
      output.textContent = "Loading Python environment...";
      await initPyodide();
    }

    // Handle version command specially
    if (codeText.includes("python --version")) {
      output.textContent =
        "Python 3.11.2 (Pyodide)\nNote: This is running in your browser with Pyodide!";
    } else {
      // Capture stdout
      pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = StringIO()
            `);

      // Run the user code
      pyodide.runPython(codeText);

      // Get the output
      const result = pyodide.runPython("sys.stdout.getvalue()");
      pyodide.runPython("sys.stdout = old_stdout");

      output.textContent = result || "Code executed successfully (no output)";
    }
  } catch (error) {
    output.textContent = `Error: ${error.message}`;
    output.classList.add("error");
  } finally {
    // Reset button state
    button.textContent = "Run";
    button.classList.remove("running");
  }
}
