from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.coqui import CoquiService

class ExplainMeAboutLlmsInShortScene(VoiceoverScene):
    def construct(self):
        self.camera.background_color = WHITE
        self.set_speech_service(CoquiService(model_name="tts_models/en/ljspeech/tacotron2-DDC"))

        # Intro (5 seconds)
        with self.voiceover(text="Ever heard the term LLM thrown around and wondered what it actually means? Don't worry, you're not alone! In the next two minutes, we'll break down Large Language Models in a way that's easy to understand. Let's dive in!") as tracker:
            logo = Square(side_length=2, color=BLUE)
            llms_text = Text("LLMs", color=BLACK).move_to(UP)
            chat_bubble = Circle(radius=1, color=GREEN).move_to(DOWN)

            self.play(Create(logo), Write(llms_text), run_time=tracker.duration/4)
            self.play(Transform(logo, chat_bubble), run_time=tracker.duration/4)
            self.play(FadeOut(logo, llms_text, chat_bubble), run_time=tracker.duration/2)

        # What are LLMs? (25 seconds)
        with self.voiceover(text="At their core, LLMs are powerful Artificial Intelligence systems. Think of them as really, really smart computers that have been trained on massive amounts of text data from the internet – books, articles, websites, you name it! This training allows them to understand and generate human-like text. They learn patterns, relationships between words, and even different writing styles.") as tracker:
            brain = Circle(radius=1.5, color=BLUE).move_to(UP)
            data_lines = VGroup(*[Line(start=brain.get_center() + 0.5*LEFT + i*0.2*DOWN, end=brain.get_center() + 0.5*RIGHT + i*0.2*DOWN, color=GRAY, stroke_opacity=0.5) for i in range(5)])

            self.play(Create(brain), run_time=tracker.duration/5)
            self.play(Create(data_lines), run_time=tracker.duration/5)

            brain_light = Circle(radius=1.5, color=YELLOW, fill_opacity=0.5).move_to(UP)
            self.play(ReplacementTransform(brain.copy(), brain_light), run_time=tracker.duration/5)

            text_data = Text("📚 Articles 🌐 Websites", color=BLACK).scale(0.6).move_to(DOWN)
            self.play(Write(text_data), run_time=tracker.duration/5)
            self.play(FadeOut(brain, brain_light, data_lines, text_data), run_time=tracker.duration/5)

        # How do they Work? (30 seconds)
        with self.voiceover(text="So how do they actually work? LLMs use something called neural networks. Imagine a complex web of interconnected nodes. When you give an LLM a prompt, like a question or a sentence, it analyzes the words, predicts the next word based on its training, and then the next, and the next. This prediction continues until it forms a coherent and relevant response. It's all about probability and learning from vast datasets.") as tracker:
            node1 = Dot(point=LEFT + UP, color=BLUE)
            node2 = Dot(point=RIGHT + UP, color=BLUE)
            node3 = Dot(point=LEFT + DOWN, color=BLUE)
            node4 = Dot(point=RIGHT + DOWN, color=BLUE)

            connection1 = Line(node1.get_center(), node2.get_center(), color=GRAY, stroke_opacity=0.5)
            connection2 = Line(node1.get_center(), node3.get_center(), color=GRAY, stroke_opacity=0.5)
            connection3 = Line(node2.get_center(), node4.get_center(), color=GRAY, stroke_opacity=0.5)
            connection4 = Line(node3.get_center(), node4.get_center(), color=GRAY, stroke_opacity=0.5)

            network = VGroup(node1, node2, node3, node4, connection1, connection2, connection3, connection4)
            self.play(Create(network), run_time=tracker.duration/4)

            arrow = Arrow(LEFT*3, RIGHT*3, color=RED)
            self.play(Create(arrow), run_time=tracker.duration/4)

            prompt = Text("Prompt -> Response", color=BLACK).scale(0.7)
            self.play(Write(prompt), run_time=tracker.duration/4)

            self.play(FadeOut(network, arrow, prompt), run_time=tracker.duration/4)

        # What can they do? (30 seconds)
        with self.voiceover(text="The amazing thing is what these LLMs can do. They can generate text, translate languages, write different kinds of creative content, and answer your questions in an informative way. You've probably already interacted with them through chatbots, writing assistants, or even code generation tools. They're becoming increasingly integrated into our digital lives!") as tracker:

            chatbot = Circle(radius=0.5, color=GREEN).shift(LEFT*3 + UP)
            chatbot_text = Text("🤖", color=BLACK).move_to(chatbot.get_center())
            translate = Arrow(start=LEFT*1, end=RIGHT*1, color=BLUE).shift(UP)
            translate_text = Text("🌐 Translate", color=BLACK).scale(0.5).move_to(translate.get_center()+DOWN*0.5)
            code = Rectangle(width=1, height=0.7, color=PURPLE).shift(RIGHT*3 + UP)
            code_text = Text("<Code>", color=BLACK).scale(0.5).move_to(code.get_center())

            self.play(Create(chatbot), Write(chatbot_text), run_time=tracker.duration/4)
            self.play(Create(translate), Write(translate_text), run_time=tracker.duration/4)
            self.play(Create(code), Write(code_text), run_time=tracker.duration/4)

            self.play(FadeOut(chatbot, chatbot_text, translate, translate_text, code, code_text), run_time=tracker.duration/4)

        # Limitations (20 seconds)
        with self.voiceover(text="It's important to remember that LLMs aren't perfect. They can sometimes generate inaccurate or biased information. They don't truly understand the world, they just predict word sequences. Always double-check information and be aware of their limitations. They are tools, and like any tool, they need to be used responsibly.") as tracker:
            robot_head = Circle(radius=0.7, color=GRAY).shift(UP)
            robot_eyes = VGroup(Dot(point=robot_head.get_center() + 0.3*LEFT*0.5 + 0.2*UP*0.5, color=BLACK), Dot(point=robot_head.get_center() + 0.3*RIGHT*0.5 + 0.2*UP*0.5, color=BLACK))

            self.play(Create(robot_head), Create(robot_eyes), run_time=tracker.duration/4)
            self.play(robot_eyes.animate.shift(DOWN*0.2), run_time=tracker.duration/4) # Make robot look confused

            fake_news = Text("Fake News!", color=RED).scale(1.2)
            self.play(Write(fake_news), run_time=tracker.duration/4)

            disclaimer = Text("Check facts!", color=YELLOW, background_stroke_width=1, stroke_color=BLACK).scale(0.6)
            self.play(Write(disclaimer), run_time=tracker.duration/4)
            self.play(FadeOut(robot_head, robot_eyes, fake_news, disclaimer), run_time=tracker.duration/10)

        # Conclusion (10 seconds)
        with self.voiceover(text="And that's LLMs in a nutshell! Powerful tools with incredible potential, but also with limitations to be aware of. Hopefully, this short video has demystified Large Language Models for you. Thanks for watching!") as tracker:
            chat_bubble = Circle(radius=1, color=GREEN)
            llms_text = Text("LLMs", color=BLACK).move_to(chat_bubble.get_center())
            checkmark = MathTex(r"\checkmark", color=BLUE).next_to(llms_text, RIGHT)

            self.play(Create(chat_bubble), Write(llms_text), run_time=tracker.duration/3)
            self.play(Create(checkmark), run_time=tracker.duration/3)
            self.play(FadeOut(chat_bubble, llms_text, checkmark), run_time=tracker.duration/3)