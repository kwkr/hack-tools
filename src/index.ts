import type { Caido } from "@caido/sdk-frontend";

import type { PluginStorage } from "./types";

import "./styles/script.css";

const pluginId = "hack-tools";
const Page = `/${pluginId}` as const;
const Commands = {
  decrement: `${pluginId}.decrement`,
  copyNullByte: `${pluginId}.decrement`,
} as const;

const getCount = (caido: Caido) => {
  const storage = caido.storage.get() as PluginStorage | undefined;

  if (storage) {
    return storage.count;
  }

  return 0;
};

const decrement = (caido: Caido) => {
  const count = getCount(caido);
  caido.storage.set({ count: count - 1 });
};

const copyNullByte = (caido: Caido) => {};

const addPage = (caido: Caido) => {
  const body = document.createElement("div");
  body.className = "container";
  body.innerHTML = `
    <div class="container__count">
      <button class="c-button" data-command="${Commands.copyNullByte}">NULL BYTE</button>
    </div>
    <div>

      <button class="c-button" data-command="${Commands.decrement}">Decrement</button>
    </div>
  `;

  const countElement = body.querySelector(".container__value") as HTMLElement;
  const copyNullByteButton = body.querySelector(
    `[data-command="${Commands.copyNullByte}"]`,
  ) as HTMLElement;

  const decrementButton = body.querySelector(
    `[data-command="${Commands.decrement}"]`,
  ) as HTMLElement;

  caido.storage.onChange((newStorage) => {
    const storage = newStorage as PluginStorage | undefined;

    if (storage) {
      countElement.innerHTML = `${storage.count}`;
      return;
    }
  });

  copyNullByteButton.addEventListener("click", () => {
    navigator.clipboard.writeText("�");
  });

  decrementButton.addEventListener("click", () => {
    decrement(caido);
  });

  caido.navigation.addPage(Page, {
    body,
  });
};

export const init = (caido: Caido) => {
  // Register commands
  // Commands are registered with a unique identifier and a handler function
  // The run function is called when the command is executed
  // These commands can be registered in various places like command palette, context menu, etc.
  caido.commands.register(Commands.copyNullByte, {
    name: "CopyNullByte",
    run: () => copyNullByte(caido),
  });

  caido.commands.register(Commands.decrement, {
    name: "Decrement",
    run: () => decrement(caido),
  });

  caido.commandPalette.register(Commands.decrement);

  // Register page
  addPage(caido);

  // Register sidebar
  caido.sidebar.registerItem("HackTools", Page, {
    icon: "fas fa-rocket",
  });
};
