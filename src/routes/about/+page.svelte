<div class="min-h-screen bg-bg flex justify-center">
  <div class="sm:max-w-[65vw] sm:min-w-[65vw] text-primary font-title">
    <span class="flex flex-col">
      <h1
        class="text-6xl text-primary mt-20 mb-4 font-title text-center text-shadow-md text-shadow-muted"
      >
        About MultiTerm
      </h1>
      <a
        href="/"
        class="text-secondary/55 text-center font-title italic underline"
        >Home</a
      >
    </span>
    <span>
      <h1 class="mt-6 mb-2 text-2xl">Inspiration</h1>
      <p class="text-secondary">
        This project was created for three reasons. It serves as a project to
        learn Neovim (Lazyvim), Svelte/SvelteKit, and the Cloudflare Workers
        ecosystem. No AI was used in any capacity to create this webapp. All the
        UI was written by hand, using TailwindCSS. The point of the project was
        to get comfortable using Neovim, in a language/framework that I do not
        already associate with a different IDE. (JetBrains)
      </p>
    </span>
    <span>
      <h1 class="mt-6 mb-2 text-2xl">Tech Stack</h1>
      <p class="text-secondary">
        As an infrastructure enthusiast, I'm always happy to talk tech stacks!
        This project runs on the Cloudflare workers platform using D1 for state
        persistence. Each time a "command" is run, a request is sent to the
        worker to mutate the state and reply with the new state. No data is
        stored locally. The code is open source, if you care to peruse it. It
        can be found on <a
          class="underline"
          target="_blank"
          href="https://github.com/Foxikle/MultiTerm">GitHub</a
        >.
      </p>
    </span>
    <span>
      <h1 class="mt-6 mb-2 text-2xl">The Project</h1>
      <p class="text-secondary">
        This project acts as a virtual terminal to a server. To be clear: <strong
          >there is no real terminal/ssh connection</strong
        >. All commands are simulated by the remote server. As of right now,
        there are very few commands supported, mostly CRUD operations for files.
        Since unix doesn't have a "command" to write to a file, per se, I have
        created one. Using the pipe doesn't exactly fit the theme of the rest of
        the commands. I'm willing to make that sacrifice for parity.
      </p>
    </span>
  </div>
</div>
