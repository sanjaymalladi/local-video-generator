from manim import *
class Introduction(Scene):
    def construct(self):
    title = Tex("Simple Math: The Building Blocks of Everything!", color=BLACK)
    title.scale(1.2)
    self.add(title)
    self.wait(2)
    self.play(FadeOut(title))
class Addition(Scene):
    def construct(self):
    numby = Tex("Numby", color=BLUE).move_to(LEFT * 3)
    plussie = Tex("+", color=GREEN).move_to(ORIGIN)
    numby_friend = Tex("Friend", color=BLUE).move_to(RIGHT * 3)
    group1 = VGroup(numby, plussie, numby_friend)
    self.play(Write(group1))
    self.wait(2)
    equals = Tex("=", color=BLACK).move_to(DOWN*2)
    total = Tex("Two Friends!", color=RED).move_to(DOWN*2 + RIGHT*3)
    equation_group = VGroup(equals,total)
    self.play(Write(equation_group))
    self.wait(3)
    equation = MathTex("1 + 1 = 2", color=BLACK).move_to(UP*2)
    self.play(Write(equation))
    self.wait(2)
    self.play(FadeOut(group1),FadeOut(equation_group),FadeOut(equation))
class Subtraction(Scene):
    def construct(self):
    numby = Tex("Numby", color=BLUE).move_to(LEFT * 3)
    minuscule = Tex("-", color=GREEN).move_to(ORIGIN)
    numby_friend = Tex("Friend", color=BLUE).move_to(RIGHT * 3)
    group1 = VGroup(numby, minuscule, numby_friend)
    self.play(Write(group1))
    self.wait(2)
    equals = Tex("=", color=BLACK).move_to(DOWN*2)
    total = Tex("Alone!", color=RED).move_to(DOWN*2 + RIGHT*3)
    equation_group = VGroup(equals,total)
    self.play(Write(equation_group))
    self.wait(3)
    equation = MathTex("2 - 1 = 1", color=BLACK).move_to(UP*2)
    self.play(Write(equation))
    self.wait(2)
    self.play(FadeOut(group1),FadeOut(equation_group),FadeOut(equation))
class Conclusion(Scene):
    def construct(self):
    summary = Tex("Math is everywhere! Keep Exploring!", color=BLACK)
    summary.scale(1.2)
    self.play(Write(summary))
    self.wait(3)
    self.play(FadeOut(summary))