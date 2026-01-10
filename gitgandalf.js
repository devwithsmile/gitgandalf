const readline = require("readline");
const { spawn } = require("child_process");

const MAX_DIFF_SIZE = 1024 * 1024; // 1MB hard limit
const LLM_TIMEOUT = 60000;
function extractDiffMetadata(diffContent) {
  const lines = diffContent.split("\n");
  const metadata = {
    files_changed: 0,
    files: [],
    binary_files: [],
    lines_added: 0,
    lines_removed: 0,
  };

  const fileSet = new Set();
  const binarySet = new Set();

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      const match = line.match(/diff --git a\/(.*?) b\/(.*?)$/);
      if (match) {
        const filePath = match[2];
        fileSet.add(filePath);
      }
    }

    // Detect binary files and skip
    if (line.startsWith("Binary files ")) {
      const match = line.match(/Binary files (.*?) and (.*?) differ/);
      if (match) {
        const right = match[2]; // b/file or /dev/null
        if (right.startsWith("b/")) {
          binarySet.add(right.slice(2));
        }
      }
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("+++")) {
      metadata.lines_added++;
    }

    if (line.startsWith("-") && !line.startsWith("---")) {
      metadata.lines_removed++;
    }
  }

  metadata.files_changed = fileSet.size;
  metadata.files = Array.from(fileSet);
  metadata.binary_files = Array.from(binarySet);
  return metadata;
}

async function callLocalLLM(prompt) {
  return new Promise((resolve, reject) => {
    const llm = spawn("lms", ["chat", "qwen/qwen3-4b-2507"]);
    
    let output = "";
    let errorOutput = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      llm.kill();
      reject(new Error("LLM request timed out after 60 seconds"));
    }, LLM_TIMEOUT);

    llm.stdout.on("data", (data) => {
      output += data.toString();
    });

    llm.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    llm.on("error", (err) => {
      clearTimeout(timeout);
      if (err.code === "ENOENT") {
        reject(
          new Error("LM Studio CLI not found - is it installed and in PATH?")
        );
      } else {
        reject(new Error(`Failed to spawn LLM: ${err.message}`));
      }
    });

    llm.on("close", (code) => {
      clearTimeout(timeout);

      if (timedOut) {
        return;
      }

      if (code !== 0) {
        reject(
          new Error(`LLM process exited with code ${code}: ${errorOutput}`)
        );
      } else {        
        resolve(output.trim());
      }
    });

    llm.stdin.write(prompt);
    llm.stdin.end();
  });
}

async function main() {
  console.log("\nGit Gandalf Review");
  console.log("(reading input...)");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  let diffContent = "";
  let bytesRead = 0;

  rl.on("line", (line) => {
    const normalizedLine = line.replace(/\r\n|\r/g, "\n");
    const lineSize = Buffer.byteLength(normalizedLine + "\n", "utf8");

    bytesRead += lineSize;

    if (bytesRead > MAX_DIFF_SIZE) {
      console.error("(diff exceeds size limit of 1MB)");
      process.exit(1);
    }

    diffContent += normalizedLine + "\n";
  });

  rl.on("close", async () => {
    if (!diffContent.trim()) {
      console.log("(no changes to review)");
      process.exit(1);
    }

    console.log("(review in progress...)");

    // Extract metadata
    const metadata = extractDiffMetadata(diffContent);
    console.log("(metadata: " + JSON.stringify(metadata) + ")");
    if (
      metadata.binary_files.length > 0 &&
      metadata.files.length === metadata.binary_files.length
    ) {
      console.log("(only binary files - skipping review)");
      process.exit(0);
    }
    try {
      const response = await callLocalLLM(diffContent);
      console.log("\n" + response);
      process.exit(0);
    } catch (err) {
      console.warn("(LLM review failed: " + err.message + ")");
      process.exit(1);
    }
  });

  rl.on("error", (err) => {
    console.error("(failed to read input: " + err.message + ")");
    process.exit(1);
  });
}

main();
