```python
from manim import *

class IntroductionToAI(Scene):
    def construct(self):
        # Set up colors
        title_color = BLUE
        definition_color = GREEN
        example_color = YELLOW
        robot_color = RED
        math_color = PURPLE

        # --- Scene 1: What is AI? ---
        title = Text("Introduction to Artificial Intelligence", color=title_color).scale(0.8)
        self.play(Write(title), run_time=2)
        self.wait(1)

        robot = SVGMobject("Robot.svg").scale(0.8).to_edge(DOWN + LEFT) #Requires Robot.svg. You can find/create this
        self.play(FadeIn(robot))
        self.wait(0.5)

        definition = Text("AI: Making machines think like humans.", color=definition_color).next_to(title, DOWN)
        self.play(Write(definition), run_time=2)
        self.wait(1)

        # --- Scene 2: Examples of AI ---
        self.play(FadeOut(title), FadeOut(definition), FadeOut(robot))

        examples_title = Text("Examples of AI", color=title_color).to_edge(UP)
        self.play(Write(examples_title))

        examples = VGroup(
            Text("1. Self-Driving Cars", color=example_color),
            Text("2. Chatbots", color=example_color),
            Text("3. Recommender Systems", color=example_color)
        ).arrange(DOWN, aligned_edge=LEFT).next_to(examples_title, DOWN)

        self.play(Write(examples[0]))
        car = SVGMobject("Car.svg").scale(0.4).next_to(examples[0], RIGHT)  #Requires Car.svg. You can find/create this
        self.play(FadeIn(car))
        self.wait(0.5)
        self.play(FadeOut(car))

        self.play(Write(examples[1]))
        chatbot = SVGMobject("Chatbot.svg").scale(0.4).next_to(examples[1], RIGHT)  #Requires Chatbot.svg. You can find/create this
        self.play(FadeIn(chatbot))
        self.wait(0.5)
        self.play(FadeOut(chatbot))

        self.play(Write(examples[2]))
        recommender = SVGMobject("Recommender.svg").scale(0.4).next_to(examples[2], RIGHT) #Requires Recommender.svg. You can find/create this
        self.play(FadeIn(recommender))
        self.wait(0.5)
        self.play(FadeOut(recommender))


        self.wait(2)
        self.play(FadeOut(examples_title), FadeOut(examples))

        # --- Scene 3: AI and Math ---

        math_title = Text("AI and Math", color=title_color).to_edge(UP)
        self.play(Write(math_title))

        math_expression = MathTex(
            r"y = f(x; \theta)",
            tex_template=TexTemplateLibrary.simple
        ).set_color(math_color).next_to(math_title, DOWN)
        self.play(Write(math_expression))
        self.wait(1)

        explanation = Text("Learning optimal parameters θ", color=definition_color).next_to(math_expression, DOWN)
        self.play(Write(explanation), run_time=2)

        self.wait(2)

        # --- Scene 4: The Future of AI ---
        self.play(FadeOut(math_title), FadeOut(math_expression), FadeOut(explanation))

        future_title = Text("The Future of AI", color=title_color).to_edge(UP)
        self.play(Write(future_title))

        future_text = Text("Limitless Possibilities!", color=definition_color).next_to(future_title, DOWN)
        self.play(Write(future_text))
        self.wait(1)

        # Add a final flourish with a rotating cube or something.
        cube = Cube(side_length=2, fill_color=BLUE, fill_opacity=0.5).rotate(PI/4)
        self.play(Rotating(cube, axis=OUT, about_point=ORIGIN, run_time=3))
        self.wait(1)

        self.play(FadeOut(future_title), FadeOut(future_text), FadeOut(cube))

        end_text = Text("Thanks for watching!", color=GREEN).scale(1.2)
        self.play(Write(end_text))
        self.wait(2)
```
