import type { Caido } from "@caido/sdk-frontend";
import type { PluginStorage } from "./types";
import "./styles/script.css";

const pluginId = "hack-tools";
const Page = `/${pluginId}` as const;
const Commands = {
  decrement: `${pluginId}.decrement`,
  copyNullByte: `${pluginId}.copyNullByte`,
  copyEmoji: `${pluginId}.copyEmoji`,
  copyUTF16: `${pluginId}.copyUTF16`,
  randomUUID: `${pluginId}.randomUUID`,
  cp0: `${pluginId}.CP0`,
  cp1: `${pluginId}.CP1`,
  cp2: `${pluginId}.CP2`,
  cp3: `${pluginId}.CP3`,
  cp4: `${pluginId}.CP4`,
  cp5: `${pluginId}.CP5`,
  cp6: `${pluginId}.CP6`,
  cp7: `${pluginId}.CP7`,
  cp8: `${pluginId}.CP8`,
  cp9: `${pluginId}.CP9`,
} as const;

const base64Decode = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "Invalid Base64";
  }
};

const base64Encode = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return "Encoding failed";
  }
};

const decodeJWT = (token: string) => {
  const parts = token.split(".");
  if (parts.length !== 3) return { header: "", payload: "", signature: "" };
  try {
    return {
      header: JSON.stringify(JSON.parse(atob(parts[0] ?? "")), null, 2),
      payload: JSON.stringify(JSON.parse(atob(parts[1] ?? "")), null, 2),
      signature: parts[2],
    };
  } catch {
    return { header: "", payload: "", signature: "" };
  }
};

const encodeJWT = (header: string, payload: string, signature: string) => {
  try {
    const h = btoa(header);
    const p = btoa(payload);
    return `${h}.${p}.${signature}`;
  } catch {
    return "Invalid JSON";
  }
};

const createCopyButton = (target: () => string): HTMLButtonElement => {
  const btn = document.createElement("button");
  btn.className = "button";
  btn.textContent = "Copy";
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(target());
  });
  return btn;
};

const addPage = (caido: Caido) => {
  const body = document.createElement("div");
  body.className = "container";

  body.innerHTML = `
    <div style="display: flex; jsutify-content: space-between;">
    <div>
    <div class="container__count">
      <button class="c-button button" data-command="${Commands.copyNullByte}">NULL BYTE</button>
      <button class="c-button button" data-command="${Commands.copyEmoji}">EMOJI</button>
      <button class="c-button button" data-command="${Commands.copyUTF16}">UTF16</button>
    </div>

    <div style="display: flex; align-items: center; gap: 10px;">
    <div style="display: flex; align-items: center; gap: 10px; flex-direction:column;">
    <div>
      <h3 style="margin-top:6px;">Base64 Decode</h3>
      <textarea id="base64Input" class="input" rows="3"></textarea>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div id="base64Output" style="white-space: pre-wrap; flex: 1;" class="input"></div>
        <div id="base64CopyBtn"></div>
      </div>
    </div>

    <div>
      <h3 style="margin-top:6px;">Text to Base64</h3>
      <textarea id="textInput" rows="3" class="input"></textarea>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div id="textBase64Output" style="white-space: pre-wrap; flex: 1;" class="input"></div>
        <div id="textBase64CopyBtn"></div>
      </div>
    </div>
    </div>

    <div>
      <h3 style="margin-top:6px;">JWT Decode/Modify</h3>
      <textarea id="jwtInput" rows="2" class="input" ></textarea>
      <div id="jwtCopyBtn" style="margin-bottom: 8px;"></div>
      <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
          <h4>Header</h4>
          <textarea id="jwtHeader" rows="3" class="input" style="width: 100%"></textarea>
          <div id="jwtHeaderCopyBtn"></div>
        </div>
        <div style="flex: 1;">
          <h4>Payload</h4>
          <textarea id="jwtPayload" rows="3" class="input" style="width: 100%"></textarea>
          <div id="jwtPayloadCopyBtn"></div>
        </div>
      </div>
    </div>
    </div>

    <div>
      <h3 style="margin-top:6px;">UUID Generator</h3>
      <div style="display: flex; gap: 10px; align-items: center; flex-direction: column;">
        <div id="uuidOutput" class="input" style="flex: 1;"></div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button id="uuidGenBtn" class="button">Generate</button>
          <div id="uuidCopyBtn"></div>
        </div>
      </div>
    </div>

    <div>
      <h3 style="margin-top:6px;">Random String Generator</h3>
      <div style="display: flex; align-items: center; gap: 10px;">
        <input id="randLength" type="number" class="input" min="1" value="16" style="width: 80px;" />
        <button id="randStrGenBtn" class="button">Generate</button>
        <div id="randStrOutput" class="input" style="flex: 1;"></div>
        <div id="randStrCopyBtn"></div>
      </div>
    </div>

    <div>
      <h3 style="margin-top:6px;">URL Encode</h3>
      <textarea id="urlInput" rows="2" class="input" style="width: 100%"></textarea>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div id="urlEncoded" class="input" style="flex: 1;"></div>
        <div id="urlEncodeCopyBtn"></div>
      </div>
    </div>

    <div>
      <h3 style="margin-top:6px;">URL Decode</h3>
      <textarea id="urlEncodedInput" rows="2" class="input" style="width: 100%"></textarea>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div id="urlDecoded" class="input" style="flex: 1;"></div>
        <div id="urlDecodeCopyBtn"></div>
      </div>
    </div>

    <div>
      <h3 style="margin-top:6px;">Unix Timestamp → Date</h3>
      <textarea id="unixInput" rows="1" class="input" style="width: 100%"></textarea>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div id="unixDateOutput" class="input" style="flex: 1;"></div>
        <div id="unixDateCopyBtn"></div>
      </div>
    </div>
    </div>

    <div style="padding-left: 12px;">
      <h3 style="margin: 6px  0px;">Clippy</h3>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div>
          <input id="clippyId" type="number" class="input" min="1" max="10" value="1" style="width: 80px;" />
          <input id="clippyValue" class="input" placeholder="value to save" value="xD" style="width: 80px;" />
          <button id="saveClippy" class="button">Save</button>
          <div id="clippyWrapper">
          </div>
        </div>
      </div>
    </div>
    </div>
  `;

  // Helper for generating random string
  const randomString = (length: number): string => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Elements
  const base64Input = body.querySelector("#base64Input") as HTMLTextAreaElement;
  const base64Output = body.querySelector("#base64Output") as HTMLElement;
  const textInput = body.querySelector("#textInput") as HTMLTextAreaElement;
  const textBase64Output = body.querySelector(
    "#textBase64Output",
  ) as HTMLElement;
  const jwtInput = body.querySelector("#jwtInput") as HTMLTextAreaElement;
  const jwtHeader = body.querySelector("#jwtHeader") as HTMLTextAreaElement;
  const jwtPayload = body.querySelector("#jwtPayload") as HTMLTextAreaElement;

  // Base64 Decode
  base64Input.addEventListener("input", () => {
    base64Output.textContent = base64Decode(base64Input.value);
  });

  // Text to Base64
  textInput.addEventListener("input", () => {
    textBase64Output.textContent = base64Encode(textInput.value);
  });

  // JWT Decode
  jwtInput.addEventListener("input", () => {
    const { header, payload } = decodeJWT(jwtInput.value);
    jwtHeader.value = header;
    jwtPayload.value = payload;
  });

  // JWT Encode
  const updateJWT = () => {
    jwtInput.value = encodeJWT(
      jwtHeader.value,
      jwtPayload.value,
      "signature-placeholder",
    );
  };

  jwtHeader.addEventListener("input", updateJWT);
  jwtPayload.addEventListener("input", updateJWT);

  // Add copy buttons
  const base64CopyBtn = body.querySelector("#base64CopyBtn") as HTMLElement;
  base64CopyBtn.appendChild(
    createCopyButton(() => base64Output.textContent || ""),
  );

  const textBase64CopyBtn = body.querySelector(
    "#textBase64CopyBtn",
  ) as HTMLElement;
  textBase64CopyBtn.appendChild(
    createCopyButton(() => textBase64Output.textContent || ""),
  );

  const jwtCopyBtn = body.querySelector("#jwtCopyBtn") as HTMLElement;
  jwtCopyBtn.appendChild(createCopyButton(() => jwtInput.value));

  const jwtHeaderCopyBtn = body.querySelector(
    "#jwtHeaderCopyBtn",
  ) as HTMLElement;
  jwtHeaderCopyBtn.appendChild(createCopyButton(() => jwtHeader.value));

  const jwtPayloadCopyBtn = body.querySelector(
    "#jwtPayloadCopyBtn",
  ) as HTMLElement;
  jwtPayloadCopyBtn.appendChild(createCopyButton(() => jwtPayload.value));

  const uuidOutput = body.querySelector("#uuidOutput") as HTMLElement;
  const uuidGenBtn = body.querySelector("#uuidGenBtn") as HTMLButtonElement;
  uuidGenBtn.addEventListener("click", () => {
    uuidOutput.textContent = window.crypto.randomUUID();
  });

  (body.querySelector("#uuidCopyBtn") as HTMLElement).appendChild(
    createCopyButton(() => uuidOutput.textContent || ""),
  );

  const randLengthInput = body.querySelector("#randLength") as HTMLInputElement;
  const randStrOutput = body.querySelector("#randStrOutput") as HTMLElement;
  const randStrGenBtn = body.querySelector(
    "#randStrGenBtn",
  ) as HTMLButtonElement;
  randStrGenBtn.addEventListener("click", () => {
    const len = parseInt(randLengthInput.value) || 16;
    randStrOutput.textContent = randomString(len);
  });
  (body.querySelector("#randStrCopyBtn") as HTMLElement).appendChild(
    createCopyButton(() => randStrOutput.textContent || ""),
  );

  const urlInput = body.querySelector("#urlInput") as HTMLTextAreaElement;
  const urlEncoded = body.querySelector("#urlEncoded") as HTMLElement;
  urlInput.addEventListener("input", () => {
    try {
      urlEncoded.textContent = encodeURIComponent(urlInput.value);
    } catch {
      urlEncoded.textContent = "Encoding error";
    }
  });
  (body.querySelector("#urlEncodeCopyBtn") as HTMLElement).appendChild(
    createCopyButton(() => urlEncoded.textContent || ""),
  );

  const urlEncodedInput = body.querySelector(
    "#urlEncodedInput",
  ) as HTMLTextAreaElement;
  const urlDecoded = body.querySelector("#urlDecoded") as HTMLElement;
  urlEncodedInput.addEventListener("input", () => {
    try {
      urlDecoded.textContent = decodeURIComponent(urlEncodedInput.value);
    } catch {
      urlDecoded.textContent = "Decoding error";
    }
  });
  (body.querySelector("#urlDecodeCopyBtn") as HTMLElement).appendChild(
    createCopyButton(() => urlDecoded.textContent || ""),
  );

  const unixInput = body.querySelector("#unixInput") as HTMLTextAreaElement;
  const unixDateOutput = body.querySelector("#unixDateOutput") as HTMLElement;

  unixInput.addEventListener("input", () => {
    const value = unixInput.value.trim();
    const timestamp = parseInt(value, 10);

    if (!isNaN(timestamp)) {
      const date = new Date(
        timestamp.toString().length === 13 ? timestamp : timestamp * 1000,
      );
      unixDateOutput.textContent = date.toISOString();
    } else {
      unixDateOutput.textContent = "Invalid timestamp";
    }
  });

  (body.querySelector("#unixDateCopyBtn") as HTMLElement).appendChild(
    createCopyButton(() => unixInput.value || ""),
  );

  const saveClippyBtn = body.querySelector("#saveClippy") as HTMLButtonElement;
  saveClippyBtn.addEventListener("click", () => {
    const clippyValue = body.querySelector("#clippyValue") as HTMLInputElement;
    const clippyId = body.querySelector("#clippyId") as HTMLInputElement;
    const storage = caido.storage.get() as PluginStorage | undefined;
    const newStorage = {
      ...storage,
      [`cp${clippyId.value}`]: clippyValue.value,
    };
    caido.storage.set(newStorage);
  });

  caido.storage.onChange((newStorage) => {
    const storage = newStorage as PluginStorage | undefined;

    if (storage) {
      const clippyWrapper = body.querySelector(
        "#clippyWrapper",
      ) as HTMLDivElement;
      clippyWrapper.innerHTML = "";
      Object.keys(storage).forEach((key) => {
        if (key.startsWith("cp")) {
          const wrapper = document.createElement("div");
          wrapper.attributeStyleMap.set("margin-top", "6px");
          wrapper.attributeStyleMap.set("max-width", "100px");
          wrapper.innerHTML = `${key}: "${storage[key]}"`;
          clippyWrapper.appendChild(wrapper);
        }
      });
      return;
    }
  });

  // Buttons
  body
    .querySelector(`[data-command="${Commands.copyNullByte}"]`)
    ?.addEventListener("click", () => {
      navigator.clipboard.writeText("�");
    });

  body
    .querySelector(`[data-command="${Commands.copyEmoji}"]`)
    ?.addEventListener("click", () => {
      navigator.clipboard.writeText("😍");
    });

  body
    .querySelector(`[data-command="${Commands.copyUTF16}"]`)
    ?.addEventListener("click", () => {
      navigator.clipboard.writeText("𠀾");
    });

  caido.navigation.addPage(Page, { body });
};

export const init = (caido: Caido) => {
  caido.commands.register(Commands.copyNullByte, {
    name: "CopyNullByte",
    run: () => navigator.clipboard.writeText("�"),
  });
  caido.commandPalette.register(Commands.copyNullByte);

  caido.commands.register(Commands.randomUUID, {
    name: "RandomUUID",
    run: () => navigator.clipboard.writeText(window.crypto.randomUUID()),
  });

  caido.commandPalette.register(Commands.randomUUID);

  caido.commands.register(Commands.copyEmoji, {
    name: "CopyEmoji",
    run: () => navigator.clipboard.writeText("😍"),
  });

  caido.commandPalette.register(Commands.copyEmoji);

  caido.commands.register(Commands.copyUTF16, {
    name: "CopyUTF16",
    run: () => navigator.clipboard.writeText("𠀾"),
  });

  caido.commandPalette.register(Commands.copyUTF16);

  const storage = caido.storage.get();
  const clippyWrapper = document.querySelector(
    "#clippyWrapper",
  ) as HTMLDivElement;

  if (storage) {
    Object.keys(storage).forEach((key) => {
      if (key.startsWith("cp")) {
        const wrapper = document.createElement("div");
        wrapper.attributeStyleMap.set("margin-top", "6px");
        wrapper.attributeStyleMap.set("max-width", "100px");
        wrapper.innerHTML = `${key}: "${storage[key]}"`;
        clippyWrapper.appendChild(wrapper);
      }
    });
  }

  for (let k = 0; k < 10; k++) {
    caido.commands.register(Commands[`cp${k}`], {
      name: `CP${k}`,
      run: () => {
        const storage = caido.storage.get() as PluginStorage | undefined;

        if (storage) {
          navigator.clipboard.writeText(storage[`cp${k}`]);
        }
      },
    });
    caido.commandPalette.register(Commands[`cp${k}`]);
    caido.shortcuts.register(Commands[`cp${k}`], ["alt", `${k}`]);
  }

  addPage(caido);

  caido.sidebar.registerItem("HackTools", Page, {
    icon: "fas fa-rocket",
  });
};
