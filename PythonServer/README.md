# Simple Python Web Server

This is a basic web server implemented in Python. It serves static files and includes a custom 404 error page.

## Prerequisites

- Python 3.x installed on your system

## File Structure

```
PYTHONSERVER/
│
├── templates/
│   ├── 404.html
│   └── other_html_files.html
│
├── index.html
├── README.md
├── requirements.txt
└── server.py
```

## How to Run the Server

1. Open a terminal or command prompt.

2. Navigate to the directory containing `server.py`:
   ```
   cd path/to/PYTHONSERVER
   ```

3. Run the server:
   ```
   python server.py
   ```

4. You should see a message: "Server is listening on port 8080..."

5. Open a web browser and go to:
   ```
   http://localhost:8080
   ```

6. You should see the contents of `index.html`. To test the 404 page, try accessing a non-existent page like:
   ```
   http://localhost:8080/nonexistent.html
   ```

## Stopping the Server

To stop the server, press `Ctrl + C` in the terminal where the server is running.

## Troubleshooting

- If you see a "Address already in use" error, make sure no other application is using port 8080, or modify the port number in `server.py`.
- Ensure all HTML files are in the correct directories as shown in the file structure above.

For any other issues, please check the console output for error messages.