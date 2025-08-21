from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.coqui import CoquiService

class ExplainMeAboutQuatumnComputersScene(VoiceoverScene):
    def construct(self):
        self.camera.background_color = WHITE
        self.set_speech_service(CoquiService(model_name="tts_models/en/ljspeech/tacotron2-DDC"))

        # Intro Music with visually engaging animation of electrons swirling and forming a stylized "Q" symbol
        q_symbol = Text("Q", color=BLUE).scale(5)
        electrons = VGroup(*[Dot(point=np.random.uniform([-5, -3, 0], [5, 3, 0]), color=YELLOW) for _ in range(50)])
        self.play(Create(electrons), Write(q_symbol), run_time=2)
        self.wait(1)
        self.play(FadeOut(electrons), FadeOut(q_symbol), run_time=1)


        # (0:00-0:10) Paragraph 1: The Problem with Regular Computers
        with self.voiceover(text="Hey everyone, and welcome! Imagine trying to solve a puzzle with a million pieces. A regular computer tackles it one piece at a time, meticulously checking each connection. This works, but for really HUGE puzzles – like designing new drugs or cracking complex codes – it can take… well, forever! These are problems classical computers just can't handle efficiently.") as tracker:

            puzzle_pieces = VGroup(*[Rectangle(width=0.5, height=0.5, color=BLUE) for _ in range(5)])
            puzzle = VGroup(*puzzle_pieces).arrange_in_grid(rows=1).scale(0.5).to_edge(UP)
            computer = Rectangle(width=1, height=1.5, color=GRAY).to_edge(DOWN)
            text_computer = Text("Computer", color=BLACK).scale(0.3).move_to(computer.get_center())
            computer_group = VGroup(computer, text_computer)

            self.play(Create(puzzle), Create(computer_group), run_time=tracker.duration/4)

            for i in range(len(puzzle_pieces)):
                 self.play(puzzle_pieces[i].animate.shift(DOWN*2), run_time=tracker.duration/8)

            large_puzzle = VGroup(*[Rectangle(width=0.2, height=0.2, color=BLUE) for _ in range(500)])
            large_puzzle = VGroup(*large_puzzle).arrange_in_grid(rows=20).scale(0.5).to_edge(UP)
            self.play(Transform(puzzle, large_puzzle), run_time=tracker.duration/4)
            self.play(computer.animate.set_color(RED), run_time=tracker.duration/4)

        self.play(FadeOut(puzzle, computer_group), run_time=1)



        # (0:10-0:30) Paragraph 2: Enter Quantum Computers - The Magic of Qubits
        with self.voiceover(text="That's where quantum computers come in. Instead of using bits that are either a 0 or a 1, like regular computers, they use *qubits*. Think of a regular bit as a light switch that's either on *or* off. A qubit, on the other hand, is like a dimmer switch that can be on, off, *or* somewhere in between, thanks to a mind-bending concept called *superposition*.") as tracker:
            light_switch = VGroup(Rectangle(width=1, height=1, color=GRAY), Text("0/1", color=BLACK).scale(0.5))
            qubit = Sphere(radius=0.7, color=BLUE, fill_opacity=0.5).to_edge(RIGHT)

            self.play(Create(light_switch), run_time=tracker.duration/4)
            self.play(light_switch.animate.shift(LEFT*3), run_time=tracker.duration/4)
            self.play(Create(qubit), run_time=tracker.duration/4)
            self.play(Rotate(qubit, angle=PI/2, axis=OUT), run_time=tracker.duration/4)


        self.play(FadeOut(light_switch, qubit), run_time=1)

        # (0:30-0:50) Paragraph 3: Superposition and Entanglement - Quantum Powers!
        with self.voiceover(text="Superposition allows a qubit to represent multiple possibilities *simultaneously*. But the real magic happens with *entanglement*. Imagine two of our dimmer switches linked together. When you change the setting on one, the other instantly changes too, *no matter how far apart they are!* Entanglement allows qubits to work together, exploring countless possibilities at the same time.") as tracker:
            qubit1 = Sphere(radius=0.7, color=BLUE, fill_opacity=0.5).shift(LEFT*2)
            qubit2 = Sphere(radius=0.7, color=RED, fill_opacity=0.5).shift(RIGHT*2)

            self.play(Create(qubit1), Create(qubit2), run_time=tracker.duration/4)
            self.play(Rotate(qubit1, angle=PI/3, axis=OUT), Rotate(qubit2, angle=PI/3, axis=OUT), run_time=tracker.duration/4)
            self.play(qubit1.animate.shift(LEFT*5), qubit2.animate.shift(RIGHT*5), run_time=tracker.duration/4)
            self.play(Rotate(qubit1, angle=-PI/3, axis=OUT), Rotate(qubit2, angle=-PI/3, axis=OUT), run_time=tracker.duration/4)

        self.play(FadeOut(qubit1, qubit2), run_time=1)

        # (0:50-1:10) Paragraph 4: How Quantum Computers Solve Problems
        with self.voiceover(text="Because qubits can exist in multiple states and are interconnected, quantum computers can explore a vast number of solutions simultaneously. Think of our puzzle again. Instead of trying one piece at a time, a quantum computer explores *all* the pieces and their potential connections *at once*, finding the solution much, much faster.") as tracker:
            puzzle_pieces = VGroup(*[Rectangle(width=0.3, height=0.3, color=BLUE) for _ in range(20)])
            puzzle = VGroup(*puzzle_pieces).arrange_in_grid(rows=4).scale(1).to_edge(UP)
            self.play(Create(puzzle), run_time=tracker.duration/4)

            for i in range(len(puzzle_pieces)):
                self.play(puzzle_pieces[i].animate.set_color(GREEN), run_time=tracker.duration/(len(puzzle_pieces)*2))
                self.play(puzzle_pieces[i].animate.set_color(BLUE), run_time=tracker.duration/(len(puzzle_pieces)*2))

            self.wait(tracker.duration/2)

        self.play(FadeOut(puzzle), run_time=1)

        # (1:10-1:30) Paragraph 5: Quantum Computer Applications
        with self.voiceover(text="This ability opens doors to incredible possibilities! Quantum computers could revolutionize medicine by designing new drugs and therapies. They could optimize logistics and supply chains, creating more efficient systems. They could even break current encryption methods, leading to new ways to secure our data.") as tracker:
            drug_molecule = MathTex(r"C_{8}H_{10}N_{4}O_{2}", color=GREEN).shift(LEFT*3)
            logistics_map = Rectangle(width=2, height=2, color=YELLOW).shift(UP*1.5)
            encryption_code = Text("<Encrypted>", color=RED).shift(RIGHT*3)

            self.play(Write(drug_molecule), run_time=tracker.duration/4)
            self.play(Create(logistics_map), run_time=tracker.duration/4)
            self.play(Write(encryption_code), run_time=tracker.duration/4)

            arrow1 = Arrow(drug_molecule.get_right(), logistics_map.get_left(), color=GRAY, stroke_opacity=0.5)
            arrow2 = Arrow(logistics_map.get_right(), encryption_code.get_left(), color=GRAY, stroke_opacity=0.5)
            self.play(Create(arrow1), Create(arrow2), run_time=tracker.duration/4)

        self.play(FadeOut(drug_molecule, logistics_map, encryption_code, arrow1, arrow2), run_time=1)

        # (1:30-1:50) Paragraph 6: Challenges and the Future
        with self.voiceover(text="Now, quantum computers aren't perfect. They are extremely sensitive and prone to errors. Building and maintaining them is incredibly complex and expensive. We're still in the early stages of development, but the potential impact of quantum computing is enormous.") as tracker:
            qubit_sensitivity = Circle(radius=1, color=RED).shift(LEFT*3)
            noise = VGroup(*[Dot(point=np.random.uniform([-4, -4, 0], [4, 4, 0]), color=GRAY, radius=0.05) for _ in range(20)])
            future_lab = Rectangle(width=3, height=2, color=BLUE).shift(RIGHT*3)

            self.play(Create(qubit_sensitivity), run_time=tracker.duration/4)
            self.play(Create(noise), run_time=tracker.duration/4)
            self.play(Create(future_lab), run_time=tracker.duration/4)
            arrow_up = Arrow(DOWN, UP, color=GREEN)
            self.play(Create(arrow_up), run_time=tracker.duration/4)

        self.play(FadeOut(qubit_sensitivity, noise, future_lab, arrow_up), run_time=1)

        # (1:50-2:00) Paragraph 7: Conclusion
        with self.voiceover(text="Quantum computers represent a fundamental shift in how we process information. They won't replace our laptops or phones anytime soon, but they promise to solve some of the world's most challenging problems. They are truly an amazing innovation of our time!") as tracker:
            q_symbol = Text("Q", color=BLUE).scale(3)
            cityscape = Rectangle(width=4, height=2, color=GRAY)
            self.play(Create(q_symbol), run_time=tracker.duration/2)
            self.play(Transform(q_symbol, cityscape), run_time=tracker.duration/2)

        self.play(FadeOut(cityscape), run_time=1)

        # (2:00-2:10) Paragraph 8: CTA
        with self.voiceover(text="Thanks for watching! If you liked this video, give it a thumbs up and subscribe for more mind-blowing science explanations. What are your thoughts on quantum computing? Let us know in the comments below!") as tracker:
            thumbs_up = Text("👍", color=BLUE).shift(LEFT*3)
            subscribe = Text("Subscribe", color=GREEN).shift(RIGHT*3)
            comment = Text("💬", color=GRAY)
            self.play(Write(thumbs_up), run_time=tracker.duration/3)
            self.play(Write(subscribe), run_time=tracker.duration/3)
            self.play(Write(comment), run_time=tracker.duration/3)