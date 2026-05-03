<script lang="ts">
  interface ExecutionResult {
    success: boolean;
    detail?: string;
    data: string[];
  }

  interface ParsedCommand {
    execute: (args: string[]) => Promise<ExecutionResult>;
    parsedArgs?: string[];
  }

  interface Message {
    content: string;
    count: number;
  }

  const PARSE_FAILED: ParsedCommand = {
    async execute(_: string[]): Promise<ExecutionResult> {
      return {
        success: false,
        detail: 'Invalid command! Type "help" for a list of commands.',
        data: [],
      };
    },
  };

  const COMMANDS: Record<string, ParsedCommand> = {
    touch: {
      async execute(args: string[]): Promise<ExecutionResult> {
        if (args.length < 1) {
          return {
            success: false,
            detail:
              'Missing argument: File name. Usage "touch <filename> [content]"',
            data: [],
          };
        }

        if (!args[0].startsWith("/")) {
          args[0] = "/" + args[0];
        }

        let content: string = "";
        if (args.length > 1) {
          content = args.slice(1).join(" ");
        }
        const resp: Response = await fetch("/api/files/", {
          method: "POST",
          headers: {
            "X-File-Path": args[0],
            "X-File-Content": content,
          },
        });

        const data = await resp.json();

        if (resp.ok) {
          return {
            success: true,
            data: [data.detail],
          };
        }

        return {
          success: false,
          detail: data.detail,
          data: [],
        };
      },
    },
    tee: {
      async execute(args: string[]): Promise<ExecutionResult> {
        if (args.length < 2) {
          return {
            success: false,
            detail:
              'Missing argument: File name and/or content. Usage: "tee <filename> <content>"',
            data: [],
          };
        }
        if (!args[0].startsWith("/")) {
          args[0] = "/" + args[0];
        }

        let content: string = "";
        if (args.length > 1) {
          content = args.slice(1).join(" ");
        }
        const resp: Response = await fetch("/api/files/", {
          method: "PUT",
          headers: {
            "X-File-Path": args[0],
            "X-File-Content": content,
          },
        });

        const data = await resp.json();
        console.log(data);
        if (resp.ok) {
          return {
            success: true,
            data: [data.detail],
          };
        }

        return {
          success: false,
          detail: data.detail,
          data: [],
        };
      },
    },
    cat: {
      async execute(args: string[]): Promise<ExecutionResult> {
        if (args.length < 1) {
          return {
            success: false,
            detail: 'Missing argument: File name. Usage "cat <filename>"',
            data: [],
          };
        }

        if (args[0].endsWith("/")) {
          return {
            success: false,
            detail:
              'Cat only works on files, not directories. Use "ls" to list the files in a directory.',
            data: [],
          };
        }

        if (!args[0].startsWith("/")) {
          args[0] = "/" + args[0];
        }

        const resp: Response = await fetch("/api/files/", {
          method: "GET",
          headers: {
            "X-File-Path": args[0],
          },
        });

        const data = await resp.json();

        if (resp.ok) {
          return {
            success: true,
            data: [data.data.content],
          };
        }

        return {
          success: false,
          detail: data.detail,
          data: [],
        };
      },
    },
    ls: {
      async execute(args: string[]): Promise<ExecutionResult> {
        let path = "/";
        if (args.length >= 1) {
          path = args[0];
        }

        if (!path.startsWith("/")) {
          path = "/" + path;
        }

        if (!path.endsWith("/")) {
          return {
            success: false,
            detail:
              'Ls only works with directories. Use "cat" to print out a file.',
            data: [],
          };
        }

        const resp: Response = await fetch("/api/files/", {
          method: "GET",
          headers: {
            "X-File-Path": args[0],
          },
        });

        const data = await resp.json();

        for (const line of renderTree(buildTree(data.data), "", true)) {
          pushMessage(line);
        }

        if (resp.ok) {
          return {
            success: true,
            data: [data.detail],
          };
        }

        return {
          success: false,
          detail: data.detail,
          data: [],
        };
      },
    },
    rm: {
      async execute(args: string[]): Promise<ExecutionResult> {
        if (args.length < 1) {
          return {
            success: false,
            detail: 'Missing argument: File name. Usage "rm <filename>"',
            data: [],
          };
        }

        if (!args[0].startsWith("/")) {
          args[0] = "/" + args[0];
        }

        const resp: Response = await fetch("/api/files/", {
          method: "DELETE",
          headers: {
            "X-File-Path": args[0],
          },
        });

        const data = await resp.json();

        if (resp.ok) {
          return {
            success: true,
            data: [data.detail],
          };
        }

        return {
          success: false,
          detail: data.detail,
          data: [],
        };
      },
    },
    clear: {
      async execute(_: string[]): Promise<ExecutionResult> {
        messages.splice(0);
        return {
          success: true,
          data: [],
        };
      },
    },
    help: {
      async execute(_: string[]): Promise<ExecutionResult> {
        return {
          success: true,
          data: [
            "Available Commands:",
            "- touch <file> [contents] - Create a new file with the specified path and optional contents.",
            "- clear - Clear the contents of this terminal",
            "- cat <file> - Print out of the contents of the specified file",
            "- rm <file> - Delete the specified file",
            "- tee <file> <contents> - Write the specified contents to the specified file",
            "- ls [query] - List the files in the specified directory. (Defaults to root)",
            "- help - Prints out this message :)",
          ],
        };
      },
    },
  };

  let intro: Message[] = [
    { content: "SYS: Welcome to MultiTerm!", count: 1 },
    {
      content:
        'SYS: To get started, type a command. Use "help" for a list of commands.',
      count: 1,
    },
  ];
  let messages: Message[] = $state(intro);
  let value: string = $state("");
  let storedValue = $state("");
  let store: boolean = $state(true);
  let pastCommands: string[] = $state([]);
  let pastIndex: number = $state(0);

  function pushMessage(toPush: string): void {
    let subset = messages.slice(-4);

    for (const msg of subset) {
      if (msg.content === toPush) {
        msg.count++;
        let idx = messages.lastIndexOf(msg);
        messages.splice(idx, 1);
        messages.push(msg);
        return;
      }
    }

    messages.push({ content: toPush, count: 1 });
  }

  async function execute(value: string): Promise<void> {
    let cmd: ParsedCommand = parseCommand(value);
    if (pastCommands.at(pastCommands.length - 1) !== value) {
      pastCommands.push(value);
    }
    pushMessage("$ " + value);
    let args = cmd.parsedArgs;
    if (!args) args = [];
    let result: ExecutionResult = await cmd.execute(args);
    if (!result.success) {
      pushMessage(result.detail);
      return;
    }

    result.data.forEach((element) => {
      pushMessage(element);
    });
  }

  function parseCommand(value: string): ParsedCommand {
    if (!value || value.trim() === "") return PARSE_FAILED;
    const split: string[] = value.split(" ");
    if (split.length < 1) return PARSE_FAILED;
    let cmd: ParsedCommand = COMMANDS[split[0].toLowerCase()];
    if (!cmd) return PARSE_FAILED;
    if (split.length === 1) return cmd;
    cmd.parsedArgs = split.slice(1);
    return cmd;
  }

  function buildTree(files: any[]): any {
    // null is a leaf
    // {} is a branch
    let root = {};

    for (const file of files) {
      const parts = file.path.split("/");
      let node = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!node[part]) {
          node[part] = i === parts.length - 1 ? null : {};
        }
        if (node[part] !== null) {
          node = node[part];
        }
      }
    }

    console.log(root);
    return root;
  }

  function renderTree(node: any, prefix = "", isRoot = true) {
    const lines = [];

    if (isRoot) lines.push("Root (/)");

    const entries = Object.entries(node).sort(([aKey, aVal], [bKey, bVal]) => {
      const aDir = aVal !== null;
      const bDir = bVal !== null;
      if (aDir !== bDir) return aDir ? -1 : 1;
      return aKey.localeCompare(bKey);
    });

    entries.forEach(([name, children], idx) => {
      const isLast = idx === entries.length - 1;
      const char = isLast ? "\\--" : "+--";
      const childPrefix = prefix + (isLast ? "   " : "│    ");

      if (name !== "") {
        lines.push(prefix + char + name);
      }

      if (children !== null) {
        lines.push(...renderTree(children, childPrefix, false));
      }
    });

    return lines;
  }
</script>

<div class="min-h-screen bg-bg no-scrollbar">
  <header
    class="block w-screen text-center text-6xl text-primary p-6 font-title text-shadow-sm text-shadow-muted"
  >
    MultiTerm
  </header>
  <div class="flex flex-col justify-center items-center my-6">
    <div
      id="content"
      class="bg-terminal sm:max-w-[75vw] sm:min-w-[75vw] max-h-[60vh] min-h-[60vh] p-6 pb-3 rounded shadow-xl flex flex-col"
    >
      <div
        class="min-h-0 flex-1 overflow-y-auto flex flex-col justify-end no-scrollbar"
      >
        {#each messages as msg}
          <span class="flex flex-row">
            <pre class="font-code text-secondary">{msg.content}</pre>
            {#if msg.count > 1}
              <h1 class="font-code ml-1 text-secondary/50">({msg.count})</h1>
            {/if}
          </span>
        {/each}
      </div>
      <div id="input">
        <input
          onkeydown={(e) => {
            if (e.key === "Enter") {
              execute(value);
              value = "";
              storedValue = "";
              store = true;
              pastIndex = pastCommands.length;
              return;
            }

            if (e.key === "ArrowUp") {
              if (pastIndex <= 0) return;
              if (pastIndex === pastCommands.length) {
                storedValue = value;
              }

              pastIndex -= 1;
              value = pastCommands[pastIndex];
              return;
            }

            if (e.key === "ArrowDown") {
              if (pastIndex >= pastCommands.length) return;
              pastIndex += 1;
              if (pastIndex === pastCommands.length) {
                value = storedValue;
                return;
              }
              value = pastCommands[pastIndex];
            }
          }}
          bind:value
          id="cmd"
          placeholder="Type a command ... "
          class="w-full font-code text-secondary bg-bg/20 mt-2 px-3 outline-none"
          type="text"
        />
      </div>
    </div>
  </div>
  <footer class="text-secondary/55 font-title">
    <span class="flex flex-col items-center justify-center">
      <p>
        Made with love by <a
          class="underline italic outline-none focus:text-secondary"
          href="https://foxikle.dev"
        >
          Foxikle</a
        > &lt;3
      </p>
      <span class="flex gap-4">
        <a
          href="https://github.com/Foxikle/MultiTerm"
          target="_blank"
          class="underline italic outline-none focus:text-secondary"
          >Source Code</a
        >
        <a
          href="/about"
          class="underline italic outline-none focus:text-secondary">About</a
        >
      </span>
    </span>
  </footer>
</div>
