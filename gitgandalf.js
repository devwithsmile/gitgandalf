const readline = require("readline");

async function main() {
  console.log("\nGit Gandalf Review");
  console.log("(reading input...)");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  let diffContent = "";

  rl.on("line", (line) => {
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
}

main();
