import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { exit } from "@tauri-apps/api/process";
import { save, open } from "@tauri-apps/api/dialog";
import { readTextFile } from "@tauri-apps/api/fs";
import TopBarMenu from "./Components/Top_Bar_Menu_Component/Top_Bar_Menu";
import StartScreen from "./Components/Start_Screen_Component/StartScreen";
import CodeEditor from "./Components/Code_Editor_Component/Code_Editor";
import Help from "./Components/Help_Component/Help";
import Terminal from "./Components/Terminal_component/Terminal";
import "./App.css";
import { paste } from "@testing-library/user-event/dist/paste";
import { changeLanguage } from "i18next";

function App() {
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [startVisible, setStartVisible] = useState(true);
  const [filePath, setFilePath] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [terminalLang, setTerminalLang] = useState(false);
  const [terminalTheme, setTerminalTheme] = useState(false);
  const [programmingLanguage, setProgrammingLanguage] = useState("");

  // Функція для визначення мови програмування за шляхом файлу
  const getProgrammingLanguage = (filePath) => {
    const extension = filePath.split(".").pop();
    switch (extension) {
      case "nl":
        return "NikLang";
      case "udav":
        return "Udav";
      case "based":
        return "Based";
      default:
        return "Other";
    }
  };

  // Функція для зміни стану відображення терміналу
  const toggleTerminal = () => {
    setTerminalVisible(!terminalVisible);
  };

  // Функція для зміни стану відображення довідки
  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

  const exitFromApp = async () => {
    await exit(0);
  };

  // Прив'язка відкриття та закриття терміналу на Ctrl + `
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleTerminal]);

  //
  const handleCopy = () => {
    document.execCommand("copy");
  };

  //
  const handleCut = () => {
    document.execCommand("cut");
  };

  //
  const handlePaste = () => {
    document.execCommand("paste");
  };

  //
  const handleUndo = () => {};

  //
  const handleRedo = () => {};

  //
  const handleSelectAll = () => {
    const textarea = document.getElementById("textarea").select();
  };

  //
  const handleLangChange = (lang) => {
    setTerminalLang(lang);
  };

  //
  const handleThemeChange = (theme) => {
    setTerminalTheme(theme);
  };

  //
  const handleNewFile = async (newFilePath) => {
    try {
      if (!newFilePath) return;
      setFilePath(newFilePath);
      const language = getProgrammingLanguage(newFilePath);
      setProgrammingLanguage(language);
      await invoke("create_file", { path: newFilePath });
      setStartVisible(false);
      setFileContent("new_file");
    } catch (err) {
      console.error(err);
    }
  };

  //
  const handleOpenFile = async (openFilePath) => {
    try {
      if (!openFilePath) return;
      const fileContent = await readTextFile(openFilePath);
      setFilePath(openFilePath);
      const language = getProgrammingLanguage(openFilePath);
      setProgrammingLanguage(language);
      setFileContent(fileContent);
      if (openFilePath) {
        setStartVisible(false);
      } else {
        setStartVisible(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Функція для збереження вмісту файлу
  const saveFileContents = async (fileContent, savePath = filePath) => {
    try {
      if (!savePath) {
        savePath = await save({
          filters: [
            { name: "Text file", extensions: ["**"] },
            { name: "Niklang.nl", extensions: ["nl"] },
            { name: "Based.based", extensions: ["based"] },
            { name: "Udav.udav", extensions: ["udav"] },
          ],
        });
        if (!savePath) return;
        setFilePath(savePath);
      }
      await invoke("save_file", { path: savePath, contents: fileContent });
      if (savePath) {
        setStartVisible(false);
      } else {
        setStartVisible(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const autosaveFileContents = async (fileContent, savePath = filePath) => {
    try {
      if (!savePath) {
        return;
      } else {
        await invoke("save_file", { path: savePath, contents: fileContent });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Функція для створення нового файлу
  const newFileContents = async () => {
    try {
      let newFilePath = await save({
        filters: [
          { name: "Text File", extensions: ["**"] },
          { name: "Niklang.nl", extensions: ["nl"] },
          { name: "Based.based", extensions: ["based"] },
          { name: "Udav.udav", extensions: ["udav"] },
        ],
      });
      if (!newFilePath) return;
      setFilePath(newFilePath);
      const language = getProgrammingLanguage(newFilePath);
      setProgrammingLanguage(language);
      await invoke("create_file", { path: newFilePath });
      setStartVisible(false);
      setFileContent("new_file");
    } catch (err) {
      console.error(err);
    }
  };

  // Функція відкриття файлу
  const openFileContent = async () => {
    try {
      const selectedPath = await open({
        multiple: false,
        title: "Open file",
        filters: [
          { name: "Text File", extensions: ["**"] },
          { name: "Niklang.nl", extensions: ["nl"] },
          { name: "Based.based", extensions: ["based"] },
          { name: "Udav.udav", extensions: ["udav"] },
        ],
      });
      if (!selectedPath) return;
      const fileContent = await readTextFile(selectedPath);
      setFilePath(selectedPath);
      const language = getProgrammingLanguage(selectedPath);
      setProgrammingLanguage(language);
      setFileContent(fileContent);
      if (selectedPath) {
        setStartVisible(false);
      } else {
        setStartVisible(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <TopBarMenu
        toggleTerminal={toggleTerminal}
        toggleHelp={toggleHelp}
        onSave={saveFileContents}
        onOpen={openFileContent}
        onNew={newFileContents}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSelectAll={handleSelectAll}
      />
      <CodeEditor
        programming_language={programmingLanguage}
        fileContent={fileContent}
      />
      <StartScreen
        onNew={newFileContents}
        onOpen={openFileContent}
        visible={startVisible}
      />
      <Terminal
        visible={terminalVisible}
        onClose={toggleTerminal}
        onNew={handleNewFile}
        onOpen={handleOpenFile}
        onExit={exitFromApp}
        onlanguagechange={handleLangChange}
        onThemeChange={handleThemeChange}
        filePath={filePath}
      />
      <Help
        onClose={toggleHelp}
        visible={helpVisible}
        onSave={autosaveFileContents}
        onChangeLang={terminalLang}
        onChangeTheme={terminalTheme}
      />
    </div>
  );
}

export default App;
