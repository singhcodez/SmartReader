# 📚 Smart Reader Pro

A modern, high-performance web-based PDF Reader with a built-in "Smart Dictionary." 

**Smart Reader Pro** is designed to fix the biggest annoyance of reading technical or academic PDFs: *having to switch tabs to look up words.* With this app, you simply select a word, and the definition pops up instantly—without ever leaving the document.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-stable-green.svg)

## ✨ Features

* **📖 Built-in Dictionary:** Select any word to instantly see its definition and hear its pronunciation.
* **⚡ High-Performance Rendering:** Uses "Super-Sampling" technology to render crisp, retina-quality text (powered by PDF.js).
* **📱 Fully Responsive:** Works perfectly on Desktop, Tablets, and Mobile.
    * *Desktop:* Floating popup near the cursor.
    * *Mobile:* Modern "Bottom Sheet" slide-up dictionary.
* **🧠 Smart Memory:** Remembers exactly which page you were on, even if you close the browser.
* **👆 Touch Friendly:** Includes a "Hand Tool" for smooth panning and dragging on touch screens.
* **🔒 Privacy Focused:** All processing happens in the browser. Your PDF files are **never** uploaded to a server.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Glassmorphism UI), Vanilla JavaScript (ES6+)
* **PDF Engine:** [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) (v3.11)
* **Dictionary API:** [Free Dictionary API](https://dictionaryapi.dev/)

## 🚀 Getting Started

You don't need to install anything complex to run this project. It runs directly in the browser.

### Option 1: Live Demo (Fastest)
*(If you host this on GitHub Pages, put the link here, e.g., https://yourusername.github.io/smart-reader)*

### Option 2: Run Locally
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/smart-reader-pro.git](https://github.com/yourusername/smart-reader-pro.git)
    ```
2.  **Open the project:**
    Navigate to the folder and open `index.html` in your browser.
    * *Note: For the best experience (and to avoid CORS issues with some browsers), it is recommended to run it using a local server like VS Code's "Live Server".*

## 🎮 How to Use

1.  Click **"Open"** to upload a PDF file from your device.
2.  **Read:** Use the arrows or scroll to navigate.
3.  **Dictionary:**
    * *Desktop:* Double-click or highlight any word.
    * *Mobile:* Long-press a word to select it.
4.  **Tools:**
    * Use the **Hand Icon** ✋ to drag the document around.
    * Use the **Zoom Buttons** 🔍 to adjust readability.
5.  Click **"Close"** to clear the current file and open a new one.

## 🤝 Contributing

Contributions are welcome! If you have an idea for a feature , feel free to fork the repo and submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by [Your Name]
</p>
