
from manim import *

class explainmeaboutllmsScene(Scene):
    def construct(self):
        # Title
        title = Text("explain me about llms", font_size=48)
        self.play(Write(title))
        self.wait(1)
        self.play(title.animate.to_edge(UP))

        # Content sections
        sections = [
            "Introduction",
            "Key Concepts",
            "Examples",
            "Conclusion"
        ]

        for i, section in enumerate(sections):
            section_text = Text(section, font_size=32, color=BLUE)
            section_text.next_to(title, DOWN, buff=1)
            section_text.shift(DOWN * i * 0.8)

            self.play(Write(section_text))
            self.wait(0.5)

        self.wait(2)
