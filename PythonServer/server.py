import socket
import os

def create_socket():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(('', 8080))
    server_socket.listen(1)
    print('Server is listening on port 8080...')
    return server_socket

def get_file_content(filename):
    try:
        with open(filename, 'rb') as f:
            return f.read()
    except FileNotFoundError:
        return None

def handle_request(client_socket):
    request = client_socket.recv(1024).decode()
    print(f"Received request:\n{request}")
    
    # Parse the request to get the file name
    filename = request.split()[1]
    if filename == '/':
        filename = '/index.html'
    
    # Check if file exists in root directory
    content = get_file_content('.' + filename)
    
    if content is None:
        # If not in root, check in templates folder
        template_path = os.path.join('templates', filename.lstrip('/'))
        content = get_file_content(template_path)
    
    if content is None:
        # If still not found, serve 404 page
        content = get_file_content('templates/404.html')
        response = "HTTP/1.1 404 Not Found\r\n\r\n".encode() + content
    else:
        response = "HTTP/1.1 200 OK\r\n\r\n".encode() + content
    
    client_socket.sendall(response)
    client_socket.close()

def run_server():
    server_socket = create_socket()
    while True:
        client_socket, addr = server_socket.accept()
        print(f"Received connection from {addr}")
        handle_request(client_socket)

if __name__ == "__main__":
    run_server()