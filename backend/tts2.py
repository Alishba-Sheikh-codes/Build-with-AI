import pyttsx3
import threading
import tkinter as tk
from PIL import Image, ImageTk
import time

class TalkingAvatar:
    def _init_(self, master, avatar_path='avatar.png'):
        self.master = master
        self.master.title("AI News Assistant")

        # Load avatar image
        self.image = Image.open(avatar_path)
        self.avatar = ImageTk.PhotoImage(self.image)
        self.label = tk.Label(master, image=self.avatar)
        self.label.pack()

        self.text_label = tk.Label(master, text="", font=("Arial", 14), wraplength=400)
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
            for _ in range(10):
                self.label.config(image='')  # Simulate mouth open
                time.sleep(0.2)
                self.label.config(image=self.avatar)  # Simulate mouth closed
                time.sleep(0.2)

        threading.Thread(target=animate).start()

# Example usage
if __name__ == "_main_":
    root = tk.Tk()
    app = TalkingAvatar(root, "avatar.png")  # Use your own image path
    app.speak("Hello! I'm your AI assistant, here with today's top news.")
    root.mainloop()