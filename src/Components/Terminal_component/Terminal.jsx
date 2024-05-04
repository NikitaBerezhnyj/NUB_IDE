import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { readDir } from "@tauri-apps/api/fs";
import { desktopDir } from "@tauri-apps/api/path";
import { relaunch } from "@tauri-apps/api/process";
import { exists } from "@tauri-apps/api/fs";
import "./Terminal.css";
import { event } from "jquery";

export default function Terminal({
  visible,
  onNew,
  onOpen,
  onClose,
  onExit,
  onlanguagechange,
  onThemeChange,
  filePath,
}) {
  const [inputValue, setInputValue] = useState("");
  const [outputValues, setOutputValues] = useState([]);
  const outputWrapperRef = useRef(null);
  const initialInputValue = "";
  const initialOutputValues = [];
  const [pathForTerminal, setPathForTerminal] = useState(""); // Шлях який використовується тільки для терміналу

  // Локалізація програми
  const { t, i18n } = useTranslation("global");

  // Встановлення віртуального шляху для терміналу
  useEffect(() => {
    if (filePath != null) {
      const lastSeparatorIndex = filePath.lastIndexOf("/");
      const trimmedPath = filePath.substring(0, lastSeparatorIndex);
      setPathForTerminal(trimmedPath);
    }
  }, [filePath]);

  useEffect(() => {
    scrollToBottom();
  }, [outputValues]);

  const scrollToBottom = () => {
    if (outputWrapperRef.current) {
      outputWrapperRef.current.scrollTop =
        outputWrapperRef.current.scrollHeight;
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const getDesktopDir = async () => {
    setPathForTerminal(await desktopDir());
    console.log("Desktop path: " + pathForTerminal);
  };

  const reload = async () => {
    await relaunch();
  };

  useEffect(() => {
    getDesktopDir();
  }, []);

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      const authenticCommand = inputValue;
      const command = inputValue.trim().split(" ");
      let result;
      // Команди терміналу
      // Змінити директорію (змінити змінну, яка використовується тільки для терміналу)
      if (command[0] === "cd" || command[0] === "зт") {
        let newPath = pathForTerminal; // Зберегти поточний шлях
        if (command.length > 1) {
          // Обробити абсолютний або відносний шлях
          if (command[1].startsWith("/")) {
            newPath = command[1];
          } else if (command[1] === "..") {
            const lastSeparatorIndex = newPath.lastIndexOf("/");
            newPath = newPath.substring(0, lastSeparatorIndex);
          } else {
            newPath = pathForTerminal + "/" + command[1];
          }
          // Перевірка існування шляху
          try {
            const isDirectory = await exists(newPath);
            if (!isDirectory) {
              result = "Тека " + newPath + " не існує";
              setOutputValues([
                ...outputValues,
                { command: authenticCommand, result: result },
              ]);
              setInputValue("");
              return;
            } else {
              result = "Успішно перейдено до " + newPath; // Додайте цей рядок для повідомлення про успішне виконання команди
            }
          } catch (error) {
            result = "Помилка перевірки шляху: " + error.message;
            setOutputValues([
              ...outputValues,
              { command: authenticCommand, result: result },
            ]);
            setInputValue("");
            return;
          }
        }
        setPathForTerminal(newPath); // Встановити новий шлях
        setOutputValues([
          ...outputValues,
          { command: authenticCommand, result: result },
        ]); // Додайте цей рядок для додавання результату до outputValues
        setInputValue("");
      }

      // Показати вміст директорії (перевірити вміст директорії за віртуальним шляхом)
      else if (command[0] === "ls" || command[0] === "лф") {
        try {
          // Читаємо вміст теки, використовуючи віртуальний шлях
          const directoryContents = await readDir(pathForTerminal);

          // Очищаємо шляхи файлів від базового шляху
          const fileNames = directoryContents.map((entry) => {
            const pathSegments = entry.path.split("/");
            return pathSegments[pathSegments.length - 1]; // Останній елемент шляху
          });

          // Записуємо шляхи файлів у змінну result як рядок
          result = fileNames.join("\n");
        } catch (error) {
          // Обробляємо помилки, якщо вони виникли під час читання директорії
          result = error.message;
        }
      }
      // Показати в якій директорії знаходиться користувач (знову ж таки віртуально)
      else if (command[0] === "pwd" || command[0] === "цт") {
        result = pathForTerminal;
      }
      // Перезапуск програми
      else if (command[0] === "reload") {
        reload();
      }
      // Новий файл
      else if (command[0] === "new" || command[0] === "новий") {
        if (command.length === 1) {
          result = "Використання: new <назва нового файлу>";
        } else if (command.length > 2) {
          result = "Використання: new <назва нового файлу>";
        } else {
          const newFilePath = pathForTerminal + command[1];
          onNew(newFilePath);
        }
      }
      // Відкриття файлу
      else if (command[0] === "open" || command[0] === "відкрити") {
        if (command.length === 1) {
          result = "Використання: open <назва нового файлу>";
        } else if (command.length > 2) {
          result = "Використання: open <назва нового файлу>";
        } else {
          const openFilePath = pathForTerminal + command[1];
          onOpen(openFilePath);
        }
      }
      // Закрити термінал
      else if (command[0] === "close" || command[0] === "закрити") {
        onClose();
      }
      // Допомога
      else if (command[0] === "help" || command[0] === "допомога") {
        result = t("terminal.help");
      }
      // Змінити мову
      else if (command[0] === "language" || command[0] === "мова") {
        if (command.length === 1) {
          result = t("terminal.language");
        } else if (command[1] === "українська" || command[1] === "ukrainian") {
          onlanguagechange("ua");
          result = "Українську мову встановлено";
        } else if (command[1] === "english" || command[1] === "англійська") {
          onlanguagechange("en");
          result = "English is set";
        } else {
          result = "При встановлені мови відбулася помилка";
        }
      }
      // Встановити тему
      else if (command[0] === "theme" || command[0] === "тема") {
        if (command.length === 1) {
          result = t("terminal.themes");
        } else if (
          command[1] === "azure-sky" ||
          command[1] === "based" ||
          command[1] === "dracula" ||
          command[1] === "lemon-sorbet" ||
          command[1] === "monokai" ||
          command[1] === "niklang" ||
          command[1] === "one-dark-pro" ||
          command[1] === "pink-rabbit" ||
          command[1] === "solarized-dark" ||
          command[1] === "solarized-light" ||
          command[1] === "standard-dark" ||
          command[1] === "standard-light" ||
          command[1] === "tomorrow" ||
          command[1] === "udav" ||
          command[1] === "vanilla-cream"
        ) {
          onThemeChange(command[1]);
          result = "Тему " + command[1] + " встановлено";
        } else {
          result = "При встановлені теми відбулася помилка";
        }
      }
      // Встановлення інтервалу автозбереження
      else if (command[0] === "autosave" || command[0] === "автозбереження") {
        result = "Новий інтервал встановлено";
      }
      // Закрити програму
      else if (command[0] === "exit" || command[0] === "вихід") {
        onExit();
      }
      // Очистити термінал
      else if (command[0] === "clear" || command[0] === "очистити") {
        setOutputValues(initialOutputValues);
        setInputValue(initialInputValue);
        return;
      }
      // Невідома команда
      else {
        result = t("terminal.error");
      }
      setOutputValues([
        ...outputValues,
        { command: authenticCommand, result: result },
      ]);
      setInputValue("");
    }
  };

  const refBox = useRef(null);
  const refTop = useRef(null);

  useEffect(() => {
    const resizableElement = refBox.current;
    const style = window.getComputedStyle(resizableElement);
    let height = parseInt(style.height, 10);

    let startY = 0;

    const onMouseMoveResize = (event) => {
      const dy = event.clientY - startY;
      resizableElement.style.height = height - dy + "px";
    };

    const onMouseUpTopResize = () => {
      document.removeEventListener("mousemove", onMouseMoveResize);
      document.removeEventListener("mouseup", onMouseUpTopResize);
    };

    const onMouseDownTopResize = (event) => {
      startY = event.clientY;
      height = parseInt(style.height, 10);
      document.addEventListener("mousemove", onMouseMoveResize);
      document.addEventListener("mouseup", onMouseUpTopResize);
    };

    const resizerTop = refTop.current;
    resizerTop.addEventListener("mousedown", onMouseDownTopResize);

    return () => {
      resizerTop.removeEventListener("mousedown", onMouseDownTopResize);
    };
  }, []);

  return (
    <div
      ref={refBox}
      className={`terminal-container resizable-box ${
        visible ? "visible" : "hidden"
      }`}
    >
      <div ref={refTop} className="resizer rt"></div>
      <div className="terminal-header">
        <h5>Terminal</h5>
      </div>
      <div className="terminal-content">
        <div className="output-wrapper" ref={outputWrapperRef}>
          {outputValues.map((output, index) => (
            <div key={index} className="output">
              <div>{"> " + output.command}</div>
              <pre dangerouslySetInnerHTML={{ __html: output.result }} />
            </div>
          ))}
        </div>
        <div className="input-wrapper">
          <span>₴ </span>
          <input
            type="text"
            placeholder="..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>
    </div>
  );
}
