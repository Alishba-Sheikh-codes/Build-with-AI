import pyttsx3
import threading
import tkinter as tk
from PIL import Image, ImageTk
import time

import os
from PIL import Image, ImageTk
import tkinter as tk
import pyttsx3
import threading
import time

class TalkingAvatar:
    def __init__(self, root, avatar_path='avatar.png'):
        # Resolve full path to the avatar image
        script_dir = os.path.dirname(os.path.abspath(__file__))
        full_path = os.path.join(script_dir, avatar_path)

        if not os.path.exists(full_path):
            raise FileNotFoundError(f"❌ Avatar image not found at: {full_path}")

        self.root = root
        self.root.title("AI News Avatar")
        self.root.geometry("450x500")

        # Load and display avatar
        self.image = Image.open(full_path)
        self.avatar = ImageTk.PhotoImage(self.image)
        self.label = tk.Label(root, image=self.avatar)
        self.label.pack(pady=10)
        # Resize the avatar image
        self.image = Image.open(full_path)
        self.image = self.image.resize((200, 200))  # Resize to 200x200 pixels
        self.avatar = ImageTk.PhotoImage(self.image)


        self.text_label = tk.Label(root, text="", font=("Arial", 14), wraplength=400, justify="center")
        self.text_label.pack(pady=10)

        self.engine = pyttsx3.init()



    def speak(self, text):
        def run():
            self.text_label.config(text=text)
            self.simulate_speaking()
            self.engine.say(text)
            self.engine.runAndWait()

        threading.Thread(target=run).start()

    def simulate_speaking(self):
        def animate():
            for _ in range(15):  # Simulate 15 mouth movements
                self.label.config(image='')  # Blank to simulate mouth open
                time.sleep(0.2)
                self.label.config(image=self.avatar)  # Mouth closed
                time.sleep(0.2)

        threading.Thread(target=animate).start()

