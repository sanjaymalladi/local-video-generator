from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.coqui import CoquiService

class ExplainMeAboutLlmsScene(VoiceoverScene):
    def construct(self):
        self.camera.background_color = WHITE
        self.set_speech_service(CoquiService(model_name="tts_models/en/ljspeech/tacotron2-DDC"))

        # Scene 1
        with self.voiceover(text="Ever wondered how your phone can predict what you're going to type, or how a chatbot can answer your questions in complete sentences? The secret lies in something called a Large Language Model, or LLM. But what exactly *is* an LLM? In this video, we'll break it down and see why these AI word wizards are changing the world.") as tracker:
            brain = SVGMobject("assets/brain.svg").scale(0.8).set_color(BLUE)
            gears = VGroup(*[Gear(radius=0.3, teeth=20).rotate(i*PI/3) for i in range(6)]).arrange(RIGHT).scale(0.5).move_to(brain.get_center())

            self.play(Create(brain), Create(gears), run_time=tracker.duration/3)

            text_box = Rectangle(width=5, height=3).set_fill(color=YELLOW, opacity=0.5).move_to(brain.get_center()+DOWN*2)
            words = VGroup(*[Text(word, font_size=24) for word in ["Understanding", "Generating", "Translating", "Predicting"]]).arrange(DOWN).move_to(text_box.get_center())

            self.play(Create(text_box), run_time=tracker.duration/3)
            self.play(Write(words), run_time=tracker.duration/3)
            self.wait(0.5)
            self.play(FadeOut(brain,gears,text_box,words))


        # Scene 2
        with self.voiceover(text="At its core, an LLM is a type of artificial intelligence. It's built on a complex network of algorithms inspired by the way our brains work, called a neural network. Imagine a giant web of interconnected nodes, each making small calculations. These networks are designed to learn patterns and relationships within data.") as tracker:

            nodes = []
            for i in range(10):
                for j in range(6):
                    node = Dot(point=[i-4.5,j-2.5,0], radius=0.1, color=GREEN)
                    nodes.append(node)

            edges = []
            for i in range(len(nodes)-1):
                line = Line(nodes[i].get_center(),nodes[i+1].get_center(), color=GREY, stroke_width = 0.5)
                edges.append(line)

            net = VGroup(*nodes, *edges)
            self.play(Create(net), run_time=tracker.duration)
            self.wait(0.5)
            self.play(FadeOut(net))


        # Scene 3
        with self.voiceover(text="What makes LLMs 'large' is the sheer amount of data they're trained on. We're talking about massive datasets consisting of text and code scraped from across the internet – millions of books, articles, websites, and lines of code. The more data an LLM is exposed to, the better it becomes at recognizing patterns and understanding language.") as tracker:
            library = VGroup(*[Prism(dimensions=[0.5, 1, 1]) for i in range(100)]).arrange_in_grid(rows=10, buff=0.1).scale(0.8).set_color(YELLOW).move_to(ORIGIN)
            self.play(Create(library), run_time=tracker.duration)
            self.wait(0.5)
            self.play(FadeOut(library))

        # Scene 4
        with self.voiceover(text="So, what can LLMs actually *do*? They can generate human-quality text, translate languages, write different kinds of creative content, and answer your questions in an informative way. Think of them as incredibly sophisticated predictive text tools, capable of generating responses that are relevant, coherent, and even creative.") as tracker:
            chat = SVGMobject("assets/chat.svg").scale(0.5).set_color(GREEN).move_to(LEFT*3)
            translate = SVGMobject("assets/translate.svg").scale(0.5).set_color(BLUE).move_to(UP)
            write = SVGMobject("assets/write.svg").scale(0.5).set_color(ORANGE).move_to(RIGHT*3)
            self.play(Create(chat), Create(translate), Create(write), run_time=tracker.duration)
            self.wait(0.5)
            self.play(FadeOut(chat, translate, write))

        # Scene 5
        with self.voiceover(text="The potential applications of LLMs are huge. From assisting doctors in diagnosing diseases to creating personalized learning experiences to accelerating scientific discoveries, LLMs are poised to revolutionize numerous industries.") as tracker:
            doctor = SVGMobject("assets/doctor.svg").scale(0.5).set_color(GREEN).move_to(LEFT*3)
            education = SVGMobject("assets/education.svg").scale(0.5).set_color(BLUE).move_to(UP)
            science = SVGMobject("assets/science.svg").scale(0.5).set_color(ORANGE).move_to(RIGHT*3)

            self.play(Create(doctor), Create(education), Create(science), run_time=tracker.duration)
            self.wait(0.5)
            self.play(FadeOut(doctor, education, science))

        # Scene 6
        with self.voiceover(text="Of course, LLMs are still under development, and they're not perfect. They can sometimes make mistakes, and it's important to use them responsibly. But with continued research and development, Large Language Models promise a future where AI empowers us to communicate, create, and innovate like never before.") as tracker:
            brain = SVGMobject("assets/brain.svg").scale(0.8).set_color(BLUE)
            lightbulb = SVGMobject("assets/lightbulb.svg").scale(0.4).set_color(YELLOW).move_to(brain.get_center()+UP*1.5)
            self.play(Create(brain), run_time=tracker.duration/2)
            self.play(Create(lightbulb), run_time=tracker.duration/2)
            self.wait(0.5)
            self.play(FadeOut(brain, lightbulb))

        # Scene 7
        with self.voiceover(text="Now that you understand LLMs, check out these other videos to learn more about artificial intelligence! And don't forget to subscribe for more insightful explanations on complex topics!") as tracker:
            end_screen_text = Text("Thanks for watching!").scale(1.2)
            subscribe_button = Rectangle(width=2, height=0.7).set_fill(color=RED, opacity=1).move_to(DOWN*2)
            subscribe_text = Text("Subscribe", color=WHITE).scale(0.6).move_to(subscribe_button.get_center())

            self.play(Write(end_screen_text), Create(subscribe_button), Write(subscribe_text), run_time=tracker.duration)
            self.wait(0.5)