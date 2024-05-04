import React, { useState, useEffect, useRef } from "react";
import { RichTextarea } from "rich-textarea";
import { Container } from "react-bootstrap";
import "./Code_Editor.css";

export default function CodeEditor({ programming_language, fileContent }) {
  const [text, setText] = useState("");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const textareaRef = useRef(null);

  // Дужки та оператори для підсвічування
  const operators = [
    "+",
    "-",
    "*",
    "/",
    "++",
    "==",
    "!=",
    "<",
    ">",
    "<=",
    ">=",
  ];
  const brackets = ["{", "}", "[", "]", "(", ")", '"', '"', "'", "'"];

  // Ключові слова мов програмування
  const NikLangKeyword = [
    "друк",
    "ввід",
    "ввід_числа",
    "якщо",
    "інакше",
    "інакше_якщо",
    "поки",
    "для_кожного",
    "повернути",
    "функція",
    "змінна",
    "ціле",
    "дійсне",
    "рядок",
    "логічне",
    "символ",
    "кінець",
  ];
  const UdavKeywords = [
    "друк",
    "ввід",
    "якщо",
    "інакше",
    "інакшеЯкщо",
    "правда",
    "брехня",
    "або",
    "не",
    "також",
    "для",
    "поки",
    "функція",
    "припинити",
    "продовжити",
    "повернути",
    "пропуск",
    "клас",
    "як",
    "від",
    "отримати",
    "заочно",
    "жодний",
    "крім",
    "належить",
    "підняти",
    "остаточно",
    "це",
    "лямбда",
    "спробувати",
    "неЛокально",
    "утверджувати",
    "видалити",
    "глобально",
    "із",
    "асинхронний",
    "здобути",
    "число",
    "дріб",
    "рядок",
    "границях",
    "своє",
  ];
  const BasedKeywords = [
    "друк",
    "ввід",
    "ввід_числа",
    "якщо",
    "інакше",
    "інакше_якщо",
    "поки",
    "для_кожного",
    "повернути",
    "функція",
    "змінна",
    "ціле",
    "дійсне",
    "рядок",
    "логічне",
    "символ",
    "кінець",
  ];

  // Копіювати
  const copy = () => {
    document.execCommand("copy");
  };

  // Вирізати
  const cut = () => {
    document.execCommand("cut");
  };

  // Вставити
  const paste = () => {
    document.execCommand("paste");
  };

  // Відміна дії
  const undo = () => {
    if (currentStep > 0) {
      setText(history[currentStep - 1]);
      setCurrentStep(currentStep - 1);
    }
  };

  // На дію вперед
  const redo = () => {
    if (currentStep < history.length - 1) {
      setText(history[currentStep + 1]);
      setCurrentStep(currentStep + 1);
    }
  };

  // Виділити все
  const selectAll = () => {
    document.getElementById("textarea").select();
  };

  // Очищення історії дій
  const clearActionHistory = () => {
    setHistory([]);
    setCurrentStep(-1);
  };

  // Додавання табуляції
  const tabulation = () => {
    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd, value } = textarea;
    const start = value.substring(0, selectionStart);
    const end = value.substring(selectionEnd);
    const tabbedText = start + "\t" + end;
    setText(tabbedText);
    const currentPosition = textarea.selectionStart;
    textarea.value = tabbedText;
    textarea.setSelectionRange(currentPosition + 1, currentPosition + 1);
    textarea.focus();
  };

  // Створення коментаря
  const createOrRemoveComment = () => {
    let commentSymbol = "";

    switch (programming_language) {
      case "NikLang":
        commentSymbol = "// ";
        break;
      case "Udav":
      case "Based":
        commentSymbol = "# ";
        break;
      default:
        commentSymbol = "";
        break;
    }

    const textarea = document.getElementById("textarea");
    let currentPosition = textarea.selectionStart;

    moveToLineStart();

    const { selectionStart, selectionEnd, value } = textarea;
    const start = value.substring(0, selectionStart);
    const end = value.substring(selectionEnd);
    const textAfterCursor = value.substring(selectionStart);

    let newText;
    // Видаляємо коментар
    if (textAfterCursor.trim().startsWith(commentSymbol.trim())) {
      newText = start + end.substring(commentSymbol.length);
      currentPosition -= commentSymbol.length;
    }
    // Додаємо коментар
    else {
      newText = start + commentSymbol + end;
      currentPosition += commentSymbol.length;
    }

    setText(newText);
    textarea.value = newText;
    textarea.setSelectionRange(currentPosition, currentPosition);
    textarea.focus();
  };

  // Перемістити курсор на початок рядка
  const moveToLineStart = () => {
    const textarea = document.getElementById("textarea");
    const currentPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, currentPosition);
    const lastNewLineIndex = textBeforeCursor.lastIndexOf("\n");
    const newPosition = lastNewLineIndex === -1 ? 0 : lastNewLineIndex + 1;
    textarea.setSelectionRange(newPosition, newPosition);
    textarea.focus();
  };

  // Натискання на Ctrl + z та Ctrl + y
  useEffect(() => {
    const handleUndoRedo = (event) => {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleUndoRedo);

    return () => {
      window.removeEventListener("keydown", handleUndoRedo);
    };
  }, [undo, redo]);

  // Натискання на Tab
  useEffect(() => {
    const handleTabulation = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        tabulation();
      }
    };

    window.addEventListener("keydown", handleTabulation);

    return () => {
      window.removeEventListener("keydown", handleTabulation);
    };
  }, [tabulation]);

  // Додавання табуляції в наступний рядок, якщо вона є в минулому
  useEffect(() => {
    const handleEnterPress = (event) => {
      if (event.key === "Enter") {
        const textarea = textareaRef.current;
        const currentPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, currentPosition);
        const lastNewLineIndex = textBeforeCursor.lastIndexOf("\n");
        const lastLine = textBeforeCursor.substring(lastNewLineIndex + 1);

        if (lastLine.startsWith("\t")) {
          event.preventDefault();
          const spaces = "\t".repeat(lastLine.match(/^\t*/)[0].length); // рахуємо кількість табуляцій
          const newText =
            textarea.value.substring(0, currentPosition) +
            "\n" +
            spaces +
            textarea.value.substring(currentPosition);
          setText(newText);
          textarea.setSelectionRange(
            currentPosition + spaces.length + 1,
            currentPosition + spaces.length + 1
          ); // переміщення курсору
        }
      }
    };

    window.addEventListener("keydown", handleEnterPress);

    return () => {
      window.removeEventListener("keydown", handleEnterPress);
    };
  }, [text]);

  // Додавання коментарів
  useEffect(() => {
    const handleComment = (event) => {
      if (event.ctrlKey && event.key === "/") {
        event.preventDefault();
        createOrRemoveComment();
      }
    };

    window.addEventListener("keydown", handleComment);

    return () => {
      window.removeEventListener("keydown", handleComment);
    };
  }, [createOrRemoveComment]);

  // Відкриття файлу
  useEffect(() => {
    if (fileContent) {
      if (fileContent == "new_file") {
        setText("");
        clearActionHistory();
      } else {
        setText(fileContent);
        clearActionHistory();
      }
    }
  }, [fileContent]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbersEle = document.getElementById("line-numbers");

    const displayLineNumbers = () => {
      const lines = text.split("\n");
      lineNumbersEle.innerHTML = Array.from(
        {
          length: lines.length,
        },
        (_, i) => `<div>${i + 1}</div>`
      ).join("");
    };

    displayLineNumbers();

    const handleInput = (event) => {
      if (event.inputType === "insertText") {
        const { selectionStart, value } = event.target;
        const closingChars = {
          "(": ")",
          "{": "}",
          "[": "]",
          '"': '"',
          "'": "'",
        };

        if (event.data in closingChars) {
          event.preventDefault();
          const closingChar = closingChars[event.data];
          setText(
            value.substring(0, selectionStart) +
              closingChar +
              value.substring(selectionStart)
          );
          textarea.selectionStart = selectionStart;
          textarea.selectionEnd = selectionStart;
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(selectionStart, selectionStart);
          }, 0);
        } else if (event.data === closingChars[value[selectionStart]]) {
          event.preventDefault();
          textarea.selectionStart = selectionStart;
          textarea.selectionEnd = selectionStart;
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(selectionStart, selectionStart);
          }, 0);
        }
      }
    };

    textarea.addEventListener("input", handleInput);

    return () => {
      textarea.removeEventListener("input", handleInput);
    };
  }, [text]);

  const handleChange = (event) => {
    setText(event.target.value);
    const newHistory = [
      ...history.slice(0, currentStep + 1),
      event.target.value,
    ];
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  return (
    <Container className="code-editor-container">
      <div id="line-numbers" className="code-lines"></div>
      <RichTextarea
        ref={textareaRef}
        id="textarea"
        value={text}
        onChange={handleChange}
        className="code-editor"
      ></RichTextarea>
    </Container>
  );
}
