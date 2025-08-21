```python
from manim import *

class IntroductionToAI(Scene):
    def construct(self):
        # --- Scene 1: Title Card ---
        title = Title("What is Artificial Intelligence?")
        self.play(Write(title))
        self.wait(1)

        # Robot character (simple shapes for a cartoonish look)
        body = Rectangle(width=1, height=2, color=BLUE, fill_opacity=1)
        head = Circle(radius=0.7, color=BLUE, fill_opacity=1).move_to(body.get_top() + UP*0.7)
        eye1 = Dot(point=head.get_center() + LEFT * 0.3 + UP * 0.2, color=WHITE, radius=0.15)
        eye2 = Dot(point=head.get_center() + RIGHT * 0.3 + UP * 0.2, color=WHITE, radius=0.15)
        mouth = Arc(radius=0.4, angle=PI, start_angle=-PI/2, color=WHITE).move_to(head.get_center() + DOWN * 0.1)
        bolt = VGroup(body, head, eye1, eye2, mouth)
        bolt.move_to(LEFT * 3)

        self.play(Create(bolt))
        self.play(bolt.animate.shift(RIGHT*1.5))

        text1 = Text("AI is like a super-smart friend!", font_size=24).next_to(bolt, RIGHT)
        self.play(Write(text1))
        self.wait(2)
        self.play(FadeOut(title, text1, bolt))
        self.wait(0.5)



        # --- Scene 2: Explaining AI through examples ---
        title2 = Title("AI Can Do Amazing Things!")
        self.play(Write(title2))

        example1 = Text("Recognize Pictures:", font_size=20, color=GREEN).to_edge(UP + LEFT)
        example2 = Text("Play Games:", font_size=20, color=GREEN).next_to(example1, DOWN, aligned_edge=LEFT)
        example3 = Text("Help Doctors:", font_size=20, color=GREEN).next_to(example2, DOWN, aligned_edge=LEFT)

        self.play(Write(example1))
        self.wait(0.5)
        self.play(Write(example2))
        self.wait(0.5)
        self.play(Write(example3))
        self.wait(1)

        # Picture example: a simplified image of a cat
        cat_image = ImageMobject("cat.png")  # Replace with a real image or create one using shapes. Can also create this with vector graphics!
        cat_image.scale(0.5).move_to(RIGHT * 2 + UP*1)
        cat_label = Text("This is a Cat!", font_size=16).next_to(cat_image, DOWN)

        # Game example: chessboard icon
        chess_icon = SVGMobject("chess_icon.svg")  # Replace with an actual chess icon
        chess_icon.scale(0.4).move_to(RIGHT * 2)

        # Doctor example: simple heart icon
        heart_icon = SVGMobject("heart_icon.svg")  # Replace with an actual heart icon
        heart_icon.scale(0.4).move_to(RIGHT * 2 + DOWN * 1)

        self.play(FadeIn(cat_image, cat_label))
        self.wait(1)
        self.play(FadeOut(cat_image, cat_label))
        self.play(FadeIn(chess_icon))
        self.wait(1)
        self.play(FadeOut(chess_icon))
        self.play(FadeIn(heart_icon))
        self.wait(1)
        self.play(FadeOut(heart_icon))

        self.play(FadeOut(title2, example1, example2, example3))
        self.wait(0.5)

        # --- Scene 3: How AI Works (simplified) ---
        title3 = Title("How Does AI Learn?")
        self.play(Write(title3))

        data_text = Text("Lots of Data!", font_size=24, color=YELLOW).to_edge(UP + LEFT)
        algorithm_text = Text("Smart Algorithms!", font_size=24, color=BLUE).next_to(data_text, DOWN, aligned_edge=LEFT)
        learn_text = Text("AI Learns!", font_size=24, color=GREEN).next_to(algorithm_text, DOWN, aligned_edge=LEFT)

        self.play(Write(data_text))
        self.wait(0.5)
        self.play(Write(algorithm_text))
        self.wait(0.5)
        self.play(Write(learn_text))
        self.wait(1)

        # Visual representation of data
        data_circles = VGroup(*[Circle(radius=0.1, color=YELLOW, fill_opacity=1).move_to([random.uniform(1, 4), random.uniform(-1, 1), 0]) for _ in range(20)]) #Random data
        self.play(Create(data_circles))
        self.wait(1)

        # Represent an algorithm with a simple box
        algorithm_box = Rectangle(width=2, height=1, color=BLUE, fill_opacity=0.5).move_to(RIGHT * 2)
        algorithm_arrow = Arrow(data_circles.get_right(), algorithm_box.get_left(), buff=0.2)
        self.play(Create(algorithm_box), Create(algorithm_arrow))
        self.wait(1)

        # The AI learning result (a star)
        learned_star = Star(n=5, outer_radius=0.5, color=GREEN, fill_opacity=1).move_to(RIGHT * 2 + DOWN*2)
        learn_arrow = Arrow(algorithm_box.get_bottom(), learned_star.get_top(), buff=0.2)

        self.play(Create(learned_star), Create(learn_arrow))
        self.wait(1)

        self.play(FadeOut(title3, data_text, algorithm_text, learn_text, data_circles, algorithm_box, algorithm_arrow, learned_star, learn_arrow))

        # --- Scene 4: The Future of AI ---
        title4 = Title("AI is Everywhere!")
        self.play(Write(title4))
        self.wait(1)

        future_text = Text("AI will help us solve big problems!", font_size=24)
        self.play(Write(future_text))
        self.wait(2)


        # Example of solving a big problem (e.g., climate change - a simple earth image)
        earth = SVGMobject("earth.svg")  # Replace with a better earth image if available. Can be vector graphic or raster.
        earth.scale(0.7).move_to(DOWN*2)
        earth_label = Text("Helping the Earth!", font_size=16).next_to(earth, DOWN)
        self.play(FadeIn(earth, earth_label))
        self.wait(2)

        self.play(FadeOut(title4, future_text, earth, earth_label))

        end_text = Text("The End! AI is super cool!", font_size=36, color=GOLD)
        self.play(Write(end_text))
        self.wait(3)
```
