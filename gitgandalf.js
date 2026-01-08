const readline = require("readline");
const MAX_DIFF_SIZE = 1024 * 1024; // 1MB

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

    diffContent += line + "\n";
  });

  rl.on("close", async () => {
    // Check if input is empty
    if (!diffContent.trim()) {
      console.log("(no input provided)");
      process.exit(1);
    }

    console.log("(review in progress...)");
  });

  rl.on("error", (err) => {
    console.error("(failed to read input: " + err.message + ")");
    process.exit(1);
  });
}

main();
