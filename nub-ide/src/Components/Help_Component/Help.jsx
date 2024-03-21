import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/tauri";
import { Container, Row } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import Settings from "../../Settings/Settings.json";
import "./Help.css";

export default function Help({
  onClose,
  visible,
  onSave,
  onChangeLang,
  onChangeTheme,
}) {
  const { t, i18n } = useTranslation("global");
  const [selectedLanguage, setSelectedLanguage] = useState(""); // початкове значення мови
  const [selectedTheme, setSelectedTheme] = useState("standard-dark"); // початкова тема
  const [autosaveInterval, setAutosaveInterval] = useState(0); // початковий інтервал автозбереження

  // Запис налаштувань
  const saveSettings = async (
    lang = selectedLanguage,
    theme = selectedTheme,
    autosave = autosaveInterval
  ) => {
    try {
      await invoke("setting_change", { lang, theme, autosave });
    } catch (error) {
      console.error("Error invoking theme change:", error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [selectedLanguage, selectedTheme, autosaveInterval]);

  // Читання налаштувань
  const loadSettings = async () => {
    setSelectedLanguage(Settings.language);
    handleLanguageChange(Settings.language);
    setSelectedTheme(Settings.theme);
    handleThemeChange(Settings.theme);
    setAutosaveInterval(Settings.autosaveInterval);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    if (storedLang) {
      handleLanguageChange(storedLang);
    } else {
      handleLanguageChange("ua");
    }
  }, []);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Зміна мови через select
  const handleLanguageSelectChange = (event) => {
    const lang = event.target.value;
    handleLanguageChange(lang);
  };

  // Зміна теми через select
  const handleThemeChange = async (themeName) => {
    setSelectedTheme(themeName);
    try {
      await invoke("theme_change", { themeName });
    } catch (error) {
      console.error("Error invoking theme change:", error);
    }
  };

  const handleThemeSelectChange = (event) => {
    const themeName = event.target.value;
    handleThemeChange(themeName);
  };

  // Встановлення значення автозбереження через select
  const handleAutosaveSelectChange = (event) => {
    const value = event.target.value;
    setAutosaveInterval(value);
  };

  useEffect(() => {
    const interval = parseInt(autosaveInterval, 10);
    let adjustedInterval = interval * 60;
    if (interval === 10) {
      adjustedInterval = 10 * 60;
    }

    if (adjustedInterval > 0) {
      const intervalId = setInterval(() => {
        onSave();
      }, adjustedInterval * 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [autosaveInterval, onSave]);

  useEffect(() => {
    if (onChangeLang != "") {
      setSelectedLanguage(onChangeLang);
      handleLanguageChange(onChangeLang);
    }
  }, [onChangeLang]);

  useEffect(() => {
    if (onChangeTheme != "") {
      setSelectedTheme(onChangeTheme);
      handleThemeChange(onChangeTheme);
    }
  }, [onChangeTheme]);

  return (
    <Container className={`help-container ${visible ? "visible" : "hidden"}`}>
      <Row className="help-close-button">
        <button onClick={onClose}>
          <b>X</b>
        </button>
      </Row>
      <Row className="help-content-container">
        <div className="help-content">
          <h1>NUB IDE</h1>
          <p>
            Це середовище розробки створене спеціально для мов програмування
            NukLang, Удав та Based
          </p>
          <p>Його основною ідеєю є робота через термінал, але не повна</p>
          <p>
            Оскільки мови не сильно працюють із сторонніми файлами, то робота у
            даному редакторі коду також здійснюється у межах одного файлу
          </p>
          <hr></hr>
          {/* <p>Ide має такі команди для терміналу:</p>
          <p>- cd [path]</p>
          <p>- ls </p>
          <p>- pwd</p>
          <p>- open - відкриває файл</p>
          <p>- save - зберігає файл</p>
          <p>- save as - зберегти файл як</p>
          <p>- translate - викликає меню з вибором мови інтерфейсу</p>
          <p>- exit - закриває все IDE</p>
          <hr></hr> */}
          <h3>Налаштування</h3>
          {/* Обрати мову */}
          <p>Обрати мову</p>
          <Form.Select
            className="select-stylized"
            aria-label="Select Language"
            onChange={handleLanguageSelectChange}
            value={selectedLanguage}
          >
            <option value="ua">Ukrainian</option>
            <option value="en">English</option>
          </Form.Select>
          {/* Обрати тему */}
          <p>Обрати тему</p>
          <Form.Select
            className="select-stylized"
            aria-label="Select Theme"
            onChange={handleThemeSelectChange}
            value={selectedTheme}
          >
            <option value="azure-sky">Azure Sky</option>
            <option value="based">Based</option>
            <option value="dracula">Dracula</option>
            <option value="lemon-sorbet">Lemon Sorbet</option>
            <option value="monokai">Monokai</option>
            <option value="niklang">NikLang</option>
            <option value="one-dark-pro">One Dark Pro</option>
            <option value="pink-rabbit">Pink Rabbit</option>
            <option value="solarized-dark">Solarized Dark</option>
            <option value="solarized-light">Solarized Light</option>
            <option value="standard-dark">Standard Dark</option>
            <option value="standard-light">Standard Light</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="udav">Udav</option>
            <option value="vanilla-cream">Vanilla Cream</option>
          </Form.Select>
          {/* Автозбереження */}
          <p>Автозбереження</p>
          <Form.Select
            className="select-stylized"
            aria-label="Select test"
            onChange={handleAutosaveSelectChange}
            value={autosaveInterval}
          >
            <option value="0">Ніколи</option>
            <option value="1">Кожну хвилину</option>
            <option value="5">Кожні п'ять хвилин</option>
            <option value="10">Кожні десять хвилин</option>
          </Form.Select>
        </div>
      </Row>
    </Container>
  );
}
