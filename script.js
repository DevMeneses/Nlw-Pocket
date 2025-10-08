// Chave para identificar os dados salvos pela nossa aplicação no navegador.
const STORAGE_KEY = "prompts_storage"

// Estado carregar os prompts salvos e exibir.
const state = {
  prompts: [],
  selectedId: null,
}

// Seletores dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
  toastContainer: document.getElementById("toast-container"),
  confirmModal: document.getElementById("confirm-modal"),
  confirmYes: document.getElementById("confirm-yes"),
  confirmNo: document.getElementById("confirm-no"),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

// Funções para abrir e fechar a sidebar
function openSidebar() {
  elements.sidebar.classList.add("open")
  elements.sidebar.classList.remove("collapsed")
}

function closeSidebar() {
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.add("collapsed")
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })

  elements.promptContent.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    showToast("Título e conteúdo não podem estar vazios.", "error")
    return
  }

  if (state.selectedId) {
    // Editando um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || "Sem conteúdo"
    }
  } else {
    // Criando um novo prompt
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    }

    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }

  renderList(elements.search.value)
  persist()

  // Limpar os inputs após salvar e desmarcar seleção
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  state.selectedId = null
  updateAllEditableStates()
  elements.promptTitle.focus()
  showToast("Prompt salvo com sucesso!", "success")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
    // Persist selectedId as well
    localStorage.setItem(`${STORAGE_KEY}_selected`, state.selectedId)
  } catch (error) {
    console.log("Erro ao salvar no localStorage:", error)
    showToast("Erro ao salvar no localStorage", "error")
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    // Restore selectedId if present
    const sel = localStorage.getItem(`${STORAGE_KEY}_selected`)
    state.selectedId = sel || null
  } catch (error) {
    console.log("Erro ao carregar do localStorage:", error)
  }
}

function createPromptItem(prompt) {
  const tmp = document.createElement("div")
  tmp.innerHTML = prompt.content
  return `
      <li class="prompt-item" data-id="${prompt.id}" data-action="select">
        <div class="prompt-item-content">
          <span class="prompt-item-title">${prompt.title}</span>
          <span class="prompt-item-description">${tmp.textContent}</span>
        </div>

      <button class="btn-icon" title="Remover" data-action="remove">
        <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
      </button>
    </li>
  `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

// Helper de notificações (toast)
function showToast(message, type = "success", ms = 3000) {
  try {
    if (!elements.toastContainer) return

    const t = document.createElement("div")
    t.className = `toast ${type}`
    t.textContent = message

    elements.toastContainer.appendChild(t)

    // Force reflow for transition
    void t.offsetWidth
    t.classList.add("show")

    setTimeout(() => {
      t.classList.remove("show")
      setTimeout(() => t.remove(), 250)
    }, ms)
  } catch (error) {
    console.log("Erro ao mostrar toast:", error)
  }
}

// Mostrar toast com botão "Desfazer" e callback
function showUndoToast(message, undoCallback, ms = 5000) {
  if (!elements.toastContainer) return

  const t = document.createElement("div")
  t.className = "toast success"

  const txt = document.createElement("span")
  txt.textContent = message
  t.appendChild(txt)

  const btn = document.createElement("button")
  btn.className = "undo"
  btn.textContent = "Desfazer"
  t.appendChild(btn)

  elements.toastContainer.appendChild(t)
  void t.offsetWidth
  t.classList.add("show")

  const timeout = setTimeout(() => {
    t.classList.remove("show")
    setTimeout(() => t.remove(), 250)
  }, ms)

  btn.addEventListener("click", function () {
    clearTimeout(timeout)
    t.classList.remove("show")
    setTimeout(() => t.remove(), 250)
    try {
      undoCallback()
      showToast("Remoção desfeita.", "success")
    } catch (e) {
      showToast("Não foi possível desfazer.", "error")
    }
  })
}

// Helpers do modal de confirmação
function openConfirmModal(message, onConfirm) {
  if (!elements.confirmModal) {
    // fallback to native confirm
    const ok = confirm(message)
    if (ok && onConfirm) onConfirm()
    return
  }

  const titleEl = elements.confirmModal.querySelector("#confirm-message")
  if (titleEl) titleEl.textContent = message

  elements.confirmModal.setAttribute("aria-hidden", "false")

  function cleanup() {
    elements.confirmModal.setAttribute("aria-hidden", "true")
    elements.confirmYes.removeEventListener("click", onYes)
    elements.confirmNo.removeEventListener("click", onNo)
  }

  function onYes() {
    cleanup()
    if (onConfirm) onConfirm()
  }

  function onNo() {
    cleanup()
  }

  elements.confirmYes.addEventListener("click", onYes)
  elements.confirmNo.addEventListener("click", onNo)
}

function copySelected() {
  try {
    const contentEl = elements.promptContent
    const text = contentEl ? contentEl.innerText.trim() : ""

    if (!text) {
      showToast("Nada para copiar.", "error")
      return
    }

    // Use Clipboard API when disponível
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      navigator.clipboard
        .writeText(text)
        .then(() =>
          showToast("Conteúdo copiado para a área de transferência!", "success")
        )
        .catch((err) => {
          console.error("Falha ao usar Clipboard API:", err)
          // fallback
          fallbackCopy(text)
        })
      return
    }

    // Fallback para ambientes sem Clipboard API (execCommand)
    fallbackCopy(text)
  } catch (error) {
    console.log("Erro ao copiar para a área de transferência:", error)
  }
}

function fallbackCopy(text) {
  try {
    const textarea = document.createElement("textarea")
    textarea.value = text
    // Prevent scrolling to bottom
    textarea.style.position = "fixed"
    textarea.style.top = "0"
    textarea.style.left = "0"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const successful = document.execCommand("copy")
    document.body.removeChild(textarea)

    if (successful) {
      showToast("Conteúdo copiado para a área de transferência!", "success")
    } else {
      showToast("Não foi possível copiar. Copie manualmente.", "error")
    }
  } catch (err) {
    console.error("Fallback de cópia falhou:", err)
    showToast("Não foi possível copiar para a área de transferência.", "error")
  }
}

// Eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.search.addEventListener("input", function (event) {
  renderList(event.target.value)
})

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")

  if (!item) return

  const id = item.getAttribute("data-id")

  if (removeBtn) {
    // Usar modal custom para confirmação
    const promptToRemove = state.prompts.find((p) => p.id === id)
    if (!promptToRemove) return

    openConfirmModal(
      "Tem certeza que deseja remover este prompt?",
      function () {
        // Remove and keep a backup for undo
        const backup = { ...promptToRemove }
        state.prompts = state.prompts.filter((p) => p.id !== id)

        // If removed item was selected, clear editor
        if (state.selectedId === id) {
          state.selectedId = null
          elements.promptTitle.textContent = ""
          elements.promptContent.textContent = ""
          updateAllEditableStates()
        }

        renderList(elements.search.value)
        persist()

        // Show undo toast
        showUndoToast("Prompt removido.", function () {
          // Restore backup to the start of the list
          state.prompts.unshift(backup)
          persist()
          renderList(elements.search.value)
        })
      }
    )

    return
  }

  state.selectedId = id

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

// Inicialização
function init() {
  load()
  renderList("")
  attachAllEditableHandlers()
  updateAllEditableStates()

  // Estado inicial: sidebar aberta (desktop) ou fechada (mobile)
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.remove("collapsed")

  // Eventos para abrir/fechar sidebar
  elements.btnOpen.addEventListener("click", openSidebar)
  elements.btnCollapse.addEventListener("click", closeSidebar)

  // If there's a selectedId after load, try to restore selection
  if (state.selectedId) {
    const prompt = state.prompts.find((p) => p.id === state.selectedId)
    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    } else {
      state.selectedId = null
      localStorage.removeItem(`${STORAGE_KEY}_selected`)
    }
  }
}

// Detecção mobile: adiciona a classe body.is-mobile quando a viewport for pequena
function updateMobileClass() {
  try {
    const isMobile = window.innerWidth <= 600
    if (isMobile) document.body.classList.add("is-mobile")
    else document.body.classList.remove("is-mobile")
  } catch (e) {
    // ignore
  }
}

window.addEventListener("resize", updateMobileClass)
window.addEventListener("load", updateMobileClass)

// Executa a inicialização ao carregar o script
init()
