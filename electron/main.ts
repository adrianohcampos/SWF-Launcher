import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron"
import * as path from "path"
import * as fs from "fs"
import { exec } from "child_process"

// Adicione esta configuração para lidar com eventos de arrastar e soltar
app.on("web-contents-created", (_, contents) => {
  contents.on("will-navigate", (event) => {
    event.preventDefault()
  })
})

// Configurações padrão
const defaultSettings = {
  rufflePath: path.join(app.getAppPath(), "ruffle", "ruffle.exe"),
  gamesFolder: path.join(app.getAppPath(), "games"),
  darkMode: false,
  defaultView: "grid",
  autoRefresh: true,
}

// Caminho para o arquivo de configurações
const settingsPath = path.join(app.getPath("userData"), "settings.json")

// Função para carregar configurações
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf8")
      return { ...defaultSettings, ...JSON.parse(data) }
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error)
  }
  return defaultSettings
}

// Função para salvar configurações
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Erro ao salvar configurações:", error)
    return false
  }
}

// Carregar configurações
let settings = loadSettings()

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Necessário para carregar arquivos locais
    },
    icon: path.join(app.getAppPath(), "assets", "icon.ico")    
  })

  // Em desenvolvimento, carrega o servidor de desenvolvimento
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173")
    mainWindow.webContents.openDevTools()
  } else {
    // Em produção, carrega o arquivo HTML compilado
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
  }

  // Para depuração
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Falha ao carregar:", errorCode, errorDescription)
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()

  app.on("activate", () => {
    if (mainWindow === null) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

// Função para ler os jogos da pasta 'games'
async function getGames() {
  const gamesPath = settings.gamesFolder || path.join(app.getAppPath(), "games")
  console.log("Buscando jogos em:", gamesPath)

  try {
    // Verifica se a pasta games existe
    if (!fs.existsSync(gamesPath)) {
      console.log("Pasta games não encontrada, criando...")
      fs.mkdirSync(gamesPath, { recursive: true })
      return []
    }

    // Lê o arquivo games.json se existir
    let gamesMetadata: Record<string, any> = {}
    const metadataPath = path.join(gamesPath, "games.json")

    if (fs.existsSync(metadataPath)) {
      console.log("Arquivo games.json encontrado")
      const metadataContent = fs.readFileSync(metadataPath, "utf-8")
      gamesMetadata = JSON.parse(metadataContent)
    } else {
      console.log("Arquivo games.json não encontrado")
    }

    // Encontra todos os arquivos .swf
    const files = fs.readdirSync(gamesPath)
    console.log("Arquivos encontrados:", files)
    const swfFiles = files.filter((file) => file.endsWith(".swf"))
    console.log("Arquivos SWF encontrados:", swfFiles)

    // Mapeia os arquivos para objetos Game
    const games = swfFiles.map((file) => {
      const gameId = path.basename(file, ".swf")
      const coverFileName = `${gameId}.png`
      const coverPath = path.join(gamesPath, coverFileName)

      // Verifica se a capa existe
      const hasCover = fs.existsSync(coverPath)
      console.log(`Capa para ${gameId}: ${hasCover ? "encontrada" : "não encontrada"}`)

      // Obtém metadados do jogo ou usa valores padrão
      const metadata = gamesMetadata[gameId] || {}

      return {
        id: gameId,
        title: metadata.title || gameId,
        filePath: path.join(gamesPath, file),
        coverPath: hasCover ? coverPath : path.join(app.getAppPath(), "assets", "default-cover.png"),
        categories: metadata.categories || [],
      }
    })

    console.log("Jogos encontrados:", games.length)
    return games
  } catch (error) {
    console.error("Erro ao ler jogos:", error)
    return []
  }
}

// Função para iniciar um jogo com o Ruffle
async function playGame(gameId: string) {
  try {
    const games = await getGames()
    const game = games.find((g) => g.id === gameId)

    if (!game) {
      throw new Error(`Jogo com ID ${gameId} não encontrado`)
    }

    const rufflePath = settings.rufflePath || path.join(app.getAppPath(), "ruffle", "ruffle.exe")
    console.log("Caminho do Ruffle:", rufflePath)

    if (!fs.existsSync(rufflePath)) {
      console.error("Ruffle não encontrado em:", rufflePath)
      dialog.showErrorBox(
        "Ruffle não encontrado",
        'O emulador Ruffle não foi encontrado. Verifique se ele está instalado corretamente na pasta "ruffle" ou configure o caminho correto nas configurações.',
      )
      return
    }

    // Inicia o Ruffle com o arquivo SWF
    console.log("Iniciando jogo:", game.filePath)
    exec(`"${rufflePath}" "${game.filePath}"`, (error) => {
      if (error) {
        console.error("Erro ao iniciar o jogo:", error)
        dialog.showErrorBox("Erro ao iniciar o jogo", `Não foi possível iniciar o jogo: ${error.message}`)
      }
    })
  } catch (error) {
    console.error("Erro ao iniciar o jogo:", error)
    dialog.showErrorBox(
      "Erro ao iniciar o jogo",
      `Não foi possível iniciar o jogo: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// Configurar handlers IPC
ipcMain.handle("get-games", async () => {
  console.log("Recebida solicitação para obter jogos")
  const games = await getGames()
  console.log("Retornando jogos:", games.length)
  return games
})

ipcMain.handle("play-game", async (_, gameId) => {
  console.log("Recebida solicitação para jogar:", gameId)
  return await playGame(gameId)
})

ipcMain.handle("refresh-games", async () => {
  console.log("Recebida solicitação para atualizar jogos")
  const games = await getGames()
  if (mainWindow) {
    mainWindow.webContents.send("games-updated", games)
  }
  return games
})

// Handlers para configurações
ipcMain.handle("get-settings", async () => {
  console.log("Recebida solicitação para obter configurações")
  return settings
})

ipcMain.handle("save-settings", async (_, newSettings) => {
  console.log("Recebida solicitação para salvar configurações:", newSettings)
  settings = { ...settings, ...newSettings }
  return saveSettings(settings)
})

// Handler para selecionar pasta/arquivo
ipcMain.handle("browse-folder", async (_, options) => {
  console.log("Recebida solicitação para selecionar pasta/arquivo:", options)
  return dialog.showOpenDialog(options)
})

