import tkinter as tk
from script_generator import get_script_from_latest_article
from avatar import TalkingAvatar

if __name__ == "__main__":
    root = tk.Tk()
    avatar = TalkingAvatar(root, "avatar.png")
    script = get_script_from_latest_article()
    avatar.speak(script)
    root.mainloop()
