use std::fs;
use serde_json::json;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![create_file, save_file, theme_change, setting_change])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Збереження файлу
#[tauri::command]
fn save_file(path: String, contents: String) {
    if let Err(err) = fs::write(&path, contents) {
        eprintln!("Error writing to file: {}", err);
    }
}

// Створення нового файлу
#[tauri::command]
fn create_file(path: String) {
    match fs::File::create(&path) {
        Ok(_) => println!("File created successfully at path: {}", path),
        Err(err) => eprintln!("Error creating file: {}", err),
    }
}

// Змінення теми
#[tauri::command]
fn theme_change(theme_name: String) {
    let css_content = format!("@import url(\"./{}.css\");", theme_name);

    // Отримання поточної робочої директорії
    let mut file_path = match std::env::current_dir() {
        Ok(dir) => dir,
        Err(err) => {
            eprintln!("Error: Cannot get the current working directory: {}", err);
            return;
        }
    };

    // Додаємо шлях до файлу theme_styles.css
    file_path.push("..");
    file_path.push("src");
    file_path.push("Themes");
    file_path.push("theme_styles.css");

    println!("file path: {}", file_path.display());

    if let Err(err) = fs::write(&file_path, css_content) {
        eprintln!("Error writing to file: {}", err);
    } else {
        println!("File {} has been updated with theme: {}", file_path.display(), theme_name);
    }
}

// Змінення налаштувань додатку
#[tauri::command]
fn setting_change(lang: String, theme: String, autosave: i32) {
    let json_data = serde_json::to_string(&json!({
        "language": lang,
        "theme": theme,
        "autosaveInterval": autosave
    })).unwrap();

    // Отримання поточної робочої директорії
    let mut file_path = match std::env::current_dir() {
        Ok(dir) => dir,
        Err(err) => {
            eprintln!("Error: Cannot get the current working directory: {}", err);
            return;
        }
    };

    // Додаємо шлях до файлу Settings.json
    file_path.push("..");
    file_path.push("src");
    file_path.push("Settings");
    file_path.push("Settings.json");

    println!("file path: {}", file_path.display());

    // Записуємо JSON у файл
    if let Err(err) = fs::write(&file_path, json_data) {
        eprintln!("Error writing to file: {}", err);
    } else {
        println!("File {} has been updated with theme: {}, {}, {}", file_path.display(), lang, theme, autosave);
    }
}