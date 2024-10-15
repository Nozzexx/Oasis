import time
from colorama import Fore, Back, Style, init

# Initialize colorama
init(autoreset=True)

def display_ascii_art():
    width = 80  # Adjust this value to change the width of the lines
    header = f"{Fore.GREEN}P.R.I.S.M. Version 0.0.1 | Developed by Team OASIS | Project O.A.S.I.S.{Style.RESET_ALL}"
    header_line = f"{Fore.BLUE}{Style.BRIGHT}{'-' * width}{Style.RESET_ALL}"
    
    ascii_art = f"""{Fore.CYAN}
██████╗ ██████╗    ██╗   ███████╗   ███╗   ███╗   
██╔══██╗██╔══██╗   ██║   ██╔════╝   ████╗ ████║   
██████╔╝██████╔╝   ██║   ███████╗   ██╔████╔██║   
██╔═══╝ ██╔══██╗   ██║   ╚════██║   ██║╚██╔╝██║   
██║██╗  ██║  ██║██╗██║██╗███████║██╗██║ ╚═╝ ██║██╗
╚═╝╚═╝  ╚═╝  ╚═╝╚═╝╚═╝╚═╝╚══════╝╚═╝╚═╝     ╚═╝╚═╝
{Style.RESET_ALL}                                  
{Fore.YELLOW}{Style.BRIGHT}Python Retriever for Integrated Space Metrics{Style.RESET_ALL}

{header_line}
{header.center(width)}
{header_line}
"""
    print(ascii_art)

def animate_loading():
    print(f"{Fore.GREEN}Initializing {Fore.CYAN}P{Fore.GREEN}.{Fore.CYAN}R{Fore.GREEN}.{Fore.CYAN}I{Fore.GREEN}.{Fore.CYAN}S{Fore.GREEN}.{Fore.CYAN}M{Fore.GREEN}.", end="", flush=True)
    for _ in range(5):
        time.sleep(0.5)
        print(f"{Fore.GREEN}.", end="", flush=True)
    print("\n")

def run_start_sequence():
    display_ascii_art()
    animate_loading()
    print(f"{Fore.GREEN}{Style.BRIGHT}P.R.I.S.M. has been Initialized. Beginning fetching process... {Style.RESET_ALL}\n")

if __name__ == "__main__":
    run_start_sequence()