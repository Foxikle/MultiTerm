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

  const SUFFIX_REGEX = /.* \(.*[2-9]\)$/;

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
    console.log(result);
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
</script>

<div class="min-h-screen bg-bg">
  <header
    class="block w-screen text-center text-6xl text-primary p-6 font-title text-shadow-sm text-shadow-muted"
  >
    MultiTerm
  </header>
  <div class="flex flex-col justify-center items-center my-6">
    <div
      id="content"
      class="bg-terminal sm:max-w-[75vw] sm:min-w-[75vw] min-h-[60vh] overflow-y-scroll no-scrollbar p-6 pb-3 rounded shadow-xl flex flex-col justify-end"
    >
      <span>
        {#each messages as msg}
          <span class="flex flex-row">
            <h1 class="font-code text-secondary">{msg.content}</h1>
            {#if msg.count > 1}
              <h1 class="font-code ml-1 text-secondary/50">({msg.count})</h1>
            {/if}
          </span>
        {/each}
      </span>
      <span id="input">
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
      </span>
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
