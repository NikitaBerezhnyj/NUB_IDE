import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./StartScreen.css";

export default function StartScreen({ onNew, onOpen, visible }) {
  const { t, i18n } = useTranslation("global");

  // Створення нового файлу
  const handleNew = () => {
    onNew();
  };

  // Відкрити файл що існує
  const handleOpen = () => {
    onOpen();
  };

  return (
    <Container
      className={`start-screen-container ${visible ? "visible" : "hidden"}`}
    >
      <h1>NUB IDE</h1>
      <p>{t("startScreen.welcome")}</p>
      <div className="main-button-container">
        <button onClick={handleNew}>
          <b>{t("startScreen.new")}</b>
        </button>
        <button onClick={handleOpen}>
          <b>{t("startScreen.open")}</b>
        </button>
      </div>
    </Container>
  );
}
