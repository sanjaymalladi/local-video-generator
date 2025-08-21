```python
from manim import *

class IntroductionToML(Scene):
    def construct(self):
        # SCENE 1: INTRODUCTION
        title = Tex("Introduction to Machine Learning", color=BLUE).scale(1.5)
        self.play(Write(title), run_time=2)
        self.wait(1)

        robot = ImageMobject("lexi_robot.png")  # Replace with your robot image file
        robot.scale(0.5).to_edge(DOWN)
        lexi_text = Tex("Hey everyone! I'm Lexi!", color=GREEN).next_to(robot, UP)

        self.play(FadeIn(robot), Write(lexi_text), run_time=1.5)
        self.wait(1.5)

        self.play(FadeOut(title), FadeOut(lexi_text), robot.animate.scale(0.8).to_edge(LEFT))  # Prepare for next scene


        # SCENE 2: WHAT IS MACHINE LEARNING?
        what_is_ml = Tex("What is Machine Learning?", color=YELLOW).scale(1.2)
        self.play(Write(what_is_ml), run_time=1)
        self.wait(0.5)


        definition = Tex(
            "Machine Learning is...",
            r" the art of teaching computers to learn from data",
            r" without being explicitly programmed."
        ).scale(0.7).arrange(DOWN)

        self.play(Write(definition), run_time=3)
        self.wait(1.5)


        # Add an example visualization of data fitting
        x_values = np.linspace(-5, 5, 100)
        y_values = x_values**2 + np.random.normal(0, 3, 100) # Quadratic data with noise

        axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-5, 30, 5],
            axis_config={"include_numbers": True},
        )

        points = VGroup(*[Dot(axes.coords_to_point(x, y), color=RED, radius=0.04) for x, y in zip(x_values, y_values)])

        quadratic_curve = axes.plot(lambda x: x**2, color=GREEN)


        self.play(Create(axes), run_time=1.5)
        self.play(Create(points), run_time=2)
        self.play(Create(quadratic_curve), run_time=2) # Fitting the curve


        self.wait(1)
        self.play(FadeOut(what_is_ml), FadeOut(definition), FadeOut(axes), FadeOut(points), FadeOut(quadratic_curve), run_time=1)



        # SCENE 3: TYPES OF MACHINE LEARNING
        types_title = Tex("Types of Machine Learning", color=ORANGE).scale(1.2)
        self.play(Write(types_title), run_time=1)
        self.wait(0.5)

        supervised = Tex("1. Supervised Learning", color=BLUE).shift(UP * 2)
        unsupervised = Tex("2. Unsupervised Learning", color=GREEN).shift(UP * 0.5)
        reinforcement = Tex("3. Reinforcement Learning", color=YELLOW).shift(DOWN * 1)

        self.play(Write(supervised), run_time=1)
        self.play(Write(unsupervised), run_time=1)
        self.play(Write(reinforcement), run_time=1)

        self.wait(2)

        # SUPERVISED LEARNING EXAMPLE
        supervised_example = MathTex("y = f(x)", color=BLUE).next_to(supervised, DOWN)
        supervised_description = Tex("Learn a mapping from input x to output y").scale(0.5).next_to(supervised_example, DOWN)
        self.play(Write(supervised_example), Write(supervised_description), run_time=2)
        self.wait(0.5)

        #UNSUPERVISED LEARNING EXAMPLE
        unsupervised_example = Tex("Discover hidden patterns in data.").scale(0.5).next_to(unsupervised, DOWN)
        self.play(Write(unsupervised_example), run_time=2)
        self.wait(0.5)

        #REINFORCEMENT LEARNING EXAMPLE
        reinforcement_example = Tex("Learn through trial and error.").scale(0.5).next_to(reinforcement, DOWN)
        self.play(Write(reinforcement_example), run_time=2)
        self.wait(2)


        # SCENE 4: APPLICATIONS AND CONCLUSION
        self.play(FadeOut(types_title), FadeOut(supervised), FadeOut(unsupervised), FadeOut(reinforcement), FadeOut(supervised_example), FadeOut(supervised_description), FadeOut(unsupervised_example), FadeOut(reinforcement_example), run_time=1)
        applications_title = Tex("Applications of Machine Learning", color=PURPLE).scale(1.2)
        self.play(Write(applications_title), run_time=1)
        self.wait(0.5)

        applications = VGroup(
            Tex("Image Recognition"),
            Tex("Natural Language Processing"),
            Tex("Recommendation Systems"),
            Tex("Medical Diagnosis")
        ).scale(0.6).arrange(DOWN, aligned_edge=LEFT)

        self.play(Write(applications), run_time=3)
        self.wait(1.5)


        conclusion = Tex("Machine Learning is transforming the world!", color=GREEN).scale(0.9).shift(DOWN * 3)
        self.play(Write(conclusion), run_time=2)

        self.wait(2)

        self.play(FadeOut(applications_title), FadeOut(applications), FadeOut(conclusion), run_time=1)
        self.play(robot.animate.scale(1.2).to_edge(DOWN).shift(RIGHT * 5), run_time=1)
        goodbye = Tex("Thanks for watching!", color=BLUE).next_to(robot, UP)
        self.play(Write(goodbye), run_time=1.5)
        self.wait(2)
```