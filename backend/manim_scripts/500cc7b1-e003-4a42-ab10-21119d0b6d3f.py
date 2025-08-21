```python
from manim import *

class IntroAI(Scene):
    def construct(self):
        # Colors
        primary_color = BLUE_D
        secondary_color = GREEN_D
        tertiary_color = YELLOW_D
        accent_color = RED_D

        # Scene 1: Introduction

        # Create a friendly robot (simple geometric shapes)
        robot_body = Rectangle(width=2, height=3, color=primary_color, fill_opacity=1)
        robot_head = Circle(radius=1, color=primary_color, fill_opacity=1).move_to(UP * 2.5)
        robot_eye1 = Circle(radius=0.15, color=WHITE, fill_opacity=1).move_to(UP * 2.7 + LEFT * 0.4)
        robot_eye2 = Circle(radius=0.15, color=WHITE, fill_opacity=1).move_to(UP * 2.7 + RIGHT * 0.4)
        robot_mouth = Arc(radius=0.5, angle=PI).move_to(UP * 2).shift(DOWN*0.15)

        robot = VGroup(robot_body, robot_head, robot_eye1, robot_eye2, robot_mouth).scale(0.75)

        # Title
        title = Tex("What is Artificial Intelligence?", color=secondary_color).scale(1.2)

        self.play(Write(title), Create(robot))
        self.wait(2)

        # Robot speaks
        speech_bubble = SpeechBubble(direction=LEFT, width=3, height=2)
        speech_bubble.pin_to(robot.get_top())
        intro_text = Tex("Hi! I'm Byte!").scale(0.7).move_to(speech_bubble.get_center())

        self.play(Create(speech_bubble), Write(intro_text))
        self.wait(1.5)

        self.play(FadeOut(title, speech_bubble, intro_text))
        self.play(robot.animate.to_corner(UL))
        self.wait(0.5)


        # Scene 2: Defining AI

        definition_title = Tex("AI: Making Machines Smart", color=tertiary_color).scale(1.1).to_edge(UP)
        definition_text = Paragraph(
            "AI enables machines to think,",
            "learn, and solve problems",
            "like humans.",
            color=WHITE,
            alignment="left"
        ).scale(0.7).next_to(definition_title, DOWN, buff=0.5)


        self.play(Write(definition_title), Write(definition_text))
        self.wait(2)

        # Example Equation
        equation = MathTex(r"f(x) = wx + b", color=secondary_color).scale(1.2).next_to(definition_text, DOWN, buff=0.7)
        equation_explanation = Tex(r"Example: Linear Regression", color=WHITE).scale(0.6).next_to(equation, DOWN, buff=0.3)


        self.play(Write(equation), Write(equation_explanation))
        self.wait(2)
        self.play(FadeOut(definition_title, definition_text, equation, equation_explanation))

        #Scene 3: AI in Action

        applications_title = Tex("AI in Action!", color=tertiary_color).scale(1.1).to_edge(UP)
        self.play(Write(applications_title))
        self.wait(0.5)

        # Examples
        example1 = Tex("Self-Driving Cars", color=WHITE).scale(0.7)
        example2 = Tex("Virtual Assistants", color=WHITE).scale(0.7)
        example3 = Tex("Medical Diagnosis", color=WHITE).scale(0.7)
        example4 = Tex("Fraud Detection", color=WHITE).scale(0.7)

        example1.move_to(LEFT * 3 + DOWN*0.5)
        example2.move_to(RIGHT * 3 + DOWN*0.5)
        example3.move_to(LEFT * 3 + DOWN*2)
        example4.move_to(RIGHT * 3 + DOWN*2)

        self.play(Write(example1), Write(example2), Write(example3), Write(example4))
        self.wait(2)

        # Highlight one example
        highlight_rect = SurroundingRectangle(example1, color=accent_color, buff=0.2)
        self.play(Create(highlight_rect))
        self.wait(1)

        self.play(FadeOut(applications_title, example1, example2, example3, example4, highlight_rect))

        #Scene 4: Conclusion

        conclusion_text = Tex("AI is changing the world!", color=secondary_color).scale(1.2).move_to(UP*1.5)
        future_text = Tex("The future is exciting!", color=WHITE).scale(0.8).next_to(conclusion_text, DOWN, buff=0.5)

        self.play(Write(conclusion_text), Write(future_text))
        self.wait(2)
        self.play(robot.animate.move_to(DOWN*2).scale(0.5))

        closing_speech = SpeechBubble(direction=RIGHT, width=3, height=2)
        closing_speech.pin_to(robot.get_top())
        closing_text = Tex("Keep learning!", color=WHITE).scale(0.7).move_to(closing_speech.get_center())

        self.play(Create(closing_speech), Write(closing_text))

        self.wait(3)
        self.play(FadeOut(robot, closing_speech, closing_text, conclusion_text, future_text))

        self.wait(1) # end screen
```