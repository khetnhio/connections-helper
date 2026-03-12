# Words — NYT Connections Helper

A web app to help solve [NYT Connections](https://www.nytimes.com/games/connections) puzzles.

## What It Does

Connections gives you 16 words to group into 4 categories of 4. This helper lets you:

- **Enter the 16 words** (one per line or comma-separated)
- **Assign colors** to group words into 4 categories
- **Drag and drop** to rearrange words
- **Take notes** for each category to track what connects the words

## Running the App

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate   # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   python app.py
   ```

4. Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

## Usage

1. Paste or type the 16 words from a Connections puzzle.
2. Click **Start Game** (or **Begin Analysis** in Professional mode).
3. Pick a color, then click words to assign them to that category.
4. Use the sidebar to add notes about what connects each group.
5. Use drag and drop to rearrange words on the grid.
6. Click **Reset Game** when you want to start a new puzzle.

## Modes

- **Professional mode** — Category labels like "Category A, B, C, D".
- **Game mode** — Color-based labels (Yellow, Green, Blue, Purple).

Notes are saved in your browser and persist between sessions.
