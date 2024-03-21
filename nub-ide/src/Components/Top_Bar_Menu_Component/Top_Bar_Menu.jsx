import { useEffect, useState } from "react";
import { confirm } from "@tauri-apps/api/dialog";
import { useTranslation } from "react-i18next";
import { Container, Row, Dropdown } from "react-bootstrap";
import { exit } from "@tauri-apps/api/process";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Top_Bar_Menu.css";

export default function TopBarMenu({
  toggleTerminal,
  toggleHelp,
  onNew,
  onSave,
  onOpen,
  onCopy,
  onCut,
  onPaste,
  onUndo,
  onRedo,
  onSelectAll,
}) {
  // Локалізація програми
  const { t, i18n } = useTranslation("global");
  const [dropdownFileOpen, setFileDropdownOpen] = useState(false);
  const [dropdownEditOpen, setEditDropdownOpen] = useState(false);

  // Створення нового файлу
  const handleNew = async () => {
    const textarea = document.getElementById("textarea");
    if (textarea.value !== "") {
      const saveAsk = await confirm(t("dialogue.change_file_save"), "NUB IDE");
      if (saveAsk === true) {
        handleSave();
        onNew();
      } else {
        onNew();
      }
    } else {
      onNew();
    }
  };

  // Відкриття файлу що існує
  const handleOpen = async () => {
    const textarea = document.getElementById("textarea");
    if (textarea.value !== "") {
      const saveAsk = await confirm(t("dialogue.change_file_save"), "NUB IDE");
      if (saveAsk === true) {
        handleSave();
        onOpen();
      } else {
        onOpen();
      }
    } else {
      onOpen();
    }
  };

  // Збереження файлу
  const handleSave = () => {
    const textarea = document.getElementById("textarea");
    const fileContent = textarea.value;
    onSave(fileContent);
  };

  // Збереження файлу як
  const handleSaveAs = async () => {
    const textarea = document.getElementById("textarea");
    const fileContent = textarea.value;
    onSave(fileContent, null);
  };

  // Виклик функції copy
  const handleCopy = () => {
    onCopy();
  };

  // Виклик функції cut
  const handleCut = () => {
    onCut();
  };

  // Виклик функції paste
  const handlePaste = () => {
    onPaste();
  };

  // Виклик функції undo
  const handleUndo = () => {
    onUndo();
  };

  // Виклик функції redo
  const handleRedo = () => {
    onRedo();
  };

  // Виділити все
  const handleSelectAll = () => {
    onSelectAll();
  };

  // Прив'язка гарячих клавіш Ctrl+S та Ctrl+Shift+S
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
      if (event.ctrlKey && event.shiftKey && event.key === "S") {
        event.preventDefault();
        handleSaveAs();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave, handleSaveAs]);

  // Прив'язка гарячих клавіш Ctrl+N та Ctrl+O
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "n") {
        event.preventDefault();
        handleNew();
      }
      if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        handleOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNew, handleOpen]);

  // Закриття програми
  const exitApp = async () => {
    const textarea = document.getElementById("textarea");
    if (textarea.value !== "") {
      const saveAsk = await confirm(t("dialogue.exit_save"), "NUB IDE");
      if (saveAsk === true) {
        handleSave();
        await exit(0);
      } else {
        await exit(0);
      }
    } else {
      await exit(0);
    }
  };

  // Відкриття та закриття dropdown menu Файл
  const handleFileDropdownToggle = () => {
    setFileDropdownOpen(!dropdownFileOpen);
  };

  //  Відкриття та закриття dropdown menu Редагування
  const handleEditDropdownToggle = () => {
    setEditDropdownOpen(!dropdownEditOpen);
  };

  return (
    <Container className="top-bar-container">
      <Row className="top-bar-content">
        {/* Меню файл */}
        <Dropdown onToggle={handleFileDropdownToggle}>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            {t("header.file")}
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={
              dropdownFileOpen
                ? "dropdown-content visible"
                : "dropdown-content hidden"
            }
          >
            <Dropdown.Item onClick={handleNew}>{t("header.new")}</Dropdown.Item>
            <Dropdown.Item onClick={handleOpen}>
              {t("header.open")}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleSave}>
              {t("header.save")}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleSaveAs}>
              {t("header.save_as")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {/* Меню редагування */}
        {/* <Dropdown onToggle={handleEditDropdownToggle}>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            {t("header.edit")}
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={
              dropdownEditOpen
                ? "dropdown-content visible"
                : "dropdown-content hidden"
            }
          >
            <Dropdown.Item onClick={handleCopy}>
              {t("header.copy")}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleCut}>{t("header.cut")}</Dropdown.Item>
            <Dropdown.Item onClick={handlePaste}>
              {t("header.paste")}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleUndo}>
              {t("header.undo")}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleRedo}>
              {t("header.repo")}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSelectAll}>
              {t("header.selectAll")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown> */}
        {/* Кнопка відкриття терміналу */}
        <button id="termButton" onClick={toggleTerminal}>
          {t("header.terminal")}
        </button>
        {/* Кнопка відкриття довідки */}
        <button id="helpButton" onClick={toggleHelp}>
          {t("header.help")}
        </button>
        {/* Кнопка закриття програми */}
        <button id="exitButton" onClick={exitApp}>
          {t("header.exit")}
        </button>
      </Row>
    </Container>
  );
}
