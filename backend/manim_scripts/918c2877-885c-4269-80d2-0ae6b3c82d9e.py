from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.coqui import CoquiService

class ExplainMeAboutLlmsScene(VoiceoverScene):
    def construct(self):
        self.camera.background_color = WHITE
        self.set_speech_service(CoquiService(model_name="tts_models/en/ljspeech/tacotron2-DDC"))

        # Scene 1: Opening
        with self.voiceover(text="Hey everyone, ever heard someone casually mention LLMs and felt completely lost? Don't worry, you're not alone! LLMs, or Large Language Models, are the buzz of the AI world right now. They're powering everything from chatbots to writing assistants, and in this video, we'll break down exactly what they are in simple terms.") as tracker:
            character = Circle(radius=0.5, color=BLUE, fill_opacity=1).shift(DOWN * 1.5)
            character_eyes = VGroup(
                Dot(character.get_center() + LEFT * 0.2 + UP * 0.1, color=BLACK),
                Dot(character.get_center() + RIGHT * 0.2 + UP * 0.1, color=BLACK)
            )
            brain_icon = Circle(radius=0.7, color=YELLOW, fill_opacity=0.8).shift(UP * 1)
            brain_text = Text("🧠", color=BLACK).move_to(brain_icon.get_center())
            glowing_effect = Circle(radius=0.8, color=YELLOW, fill_opacity=0.3).move_to(brain_icon.get_center())
            brain = VGroup(brain_icon, brain_text, glowing_effect)

            self.play(Create(character), Create(character_eyes), Create(brain), run_time=tracker.duration/3)
            self.play(character.animate.rotate(PI/6), character_eyes.animate.rotate(PI/6), run_time=tracker.duration/3)
            self.play(brain_icon.animate.scale(1.1).set_color(ORANGE),brain_text.animate.set_color(RED), run_time=tracker.duration/3)

        # Scene 2: What is an LLM?
        with self.voiceover(text="At their core, LLMs are super-smart computer programs trained on enormous amounts of text data – think the entire internet, books, articles, code… you name it! They learn to recognize patterns and relationships between words, allowing them to predict what word comes next in a sentence, or even generate entire paragraphs of text.") as tracker:
            dataset = Rectangle(width=6, height=4, color=GREEN, fill_opacity=0.2)
            text_stream = VGroup(*[Text(word, font_size=12, color=DARK_GRAY) for word in ["the", "cat", "sat", "on", "the", "mat", "LLMs", "are", "awesome"]]).arrange(RIGHT, buff=0.2)
            text_stream.move_to(dataset.get_center())

            self.play(Create(dataset), run_time=tracker.duration/4)
            self.play(Create(text_stream), run_time=tracker.duration/4)
            self.play(text_stream.animate.shift(RIGHT*2), run_time=tracker.duration/4)
            self.play(dataset.animate.set_color(BLUE), run_time=tracker.duration/4)

        # Scene 3: How They Work
        with self.voiceover(text="Imagine teaching a dog tricks by giving it treats every time it does something right. LLMs learn in a similar way, but instead of treats, they're constantly refining their understanding of language based on the massive amount of data they've been fed. When you give them a prompt, they use this knowledge to generate a response that *statistically* makes sense. They're essentially predicting the most likely sequence of words to follow your input.") as tracker:
            sentence_prefix = Text("The cat sat on the...", color=BLACK).to_edge(UP)
            options = VGroup(
                Text("mat", color=GREEN),
                Text("sofa", color=BLUE),
                Text("roof", color=RED)
            ).arrange(RIGHT, buff=1).next_to(sentence_prefix, DOWN, buff=1)

            self.play(Write(sentence_prefix), run_time=tracker.duration/3)
            self.play(Create(options), run_time=tracker.duration/3)
            self.play(options[0].animate.scale(1.2).set_color(GOLD), run_time=tracker.duration/3)


        # Scene 4: What Can They Do?
        with self.voiceover(text="So, what can LLMs actually *do*? Well, quite a lot! They can write emails, answer your questions, translate languages, generate computer code, and even create stories. They're powerful tools for automating tasks and generating content, but it's important to remember they're based on patterns, not true understanding.") as tracker:
            email_icon = Rectangle(width=1, height=0.7, color=BLUE, fill_opacity=0.5).shift(UP * 1.5)
            email_text = Text("📧 Email", color=BLACK).move_to(email_icon.get_center())

            question_icon = Circle(radius=0.5, color=GREEN, fill_opacity=0.5).shift(UP * 1.5 + LEFT * 2)
            question_text = Text("❓ Q&A", color=BLACK).move_to(question_icon.get_center())

            translate_icon = Arrow(start=LEFT, end=RIGHT, color=PURPLE, stroke_opacity=1).shift(DOWN * 1.5 + LEFT * 2)
            translate_text = Text("🌐 Translate", color=BLACK).next_to(translate_icon, UP)

            code_icon = Rectangle(width=1, height=0.7, color=YELLOW, fill_opacity=0.5).shift(DOWN * 1.5)
            code_text = Text("<Code>", color=BLACK).move_to(code_icon.get_center())

            story_icon = Rectangle(width=1, height=0.7, color=RED, fill_opacity=0.5).shift(RIGHT * 2)
            story_text = Text("📝 Story", color=BLACK).move_to(story_icon.get_center())

            self.play(Create(email_icon), Write(email_text), run_time=tracker.duration/5)
            self.play(Create(question_icon), Write(question_text), run_time=tracker.duration/5)
            self.play(Create(translate_icon), Write(translate_text), run_time=tracker.duration/5)
            self.play(Create(code_icon), Write(code_text), run_time=tracker.duration/5)
            self.play(Create(story_icon), Write(story_text), run_time=tracker.duration/5)

        # Scene 5: Limitations & Ethical Considerations
        with self.voiceover(text="Now, LLMs aren't perfect. They can sometimes generate incorrect information, called hallucinations, or reflect biases present in the data they were trained on. This raises important ethical considerations about responsible development and usage. It's crucial to treat them as tools that require human oversight and critical thinking.") as tracker:
            question_mark = Text("?", color=RED, font_size=72).move_to(ORIGIN)
            brain_icon_small = Circle(radius=0.7, color=YELLOW, fill_opacity=0.8).shift(DOWN * 1)
            brain_text_small = Text("🧠", color=BLACK).move_to(brain_icon_small.get_center())
            brain_small = VGroup(brain_icon_small, brain_text_small)

            self.play(Create(brain_small), run_time=tracker.duration/2)
            self.play(Transform(brain_small.copy().shift(UP),question_mark), run_time=tracker.duration/2)


        # Scene 6: Future of LLMs
        with self.voiceover(text="Despite these challenges, LLMs are rapidly evolving. We can expect to see them integrated into even more aspects of our lives, from personalized learning experiences to assisting doctors with diagnoses. The potential is truly transformative.") as tracker:
            learning_icon = Rectangle(width=1, height=0.7, color=BLUE, fill_opacity=0.5).shift(UP * 1.5 + LEFT * 2)
            learning_text = Text("🎓 Learning", color=BLACK).move_to(learning_icon.get_center())

            medical_icon = Circle(radius=0.5, color=GREEN, fill_opacity=0.5).shift(DOWN * 1.5 + RIGHT * 2)
            medical_text = Text("🩺 Medical", color=BLACK).move_to(medical_icon.get_center())

            self.play(Create(learning_icon), Write(learning_text), run_time=tracker.duration/2)
            self.play(Create(medical_icon), Write(medical_text), run_time=tracker.duration/2)

        # Scene 7: Conclusion
        with self.voiceover(text="So, there you have it – a quick and easy explanation of Large Language Models. They're powerful tools with the potential to change the world, but it's important to understand their capabilities and limitations. Thanks for watching!") as tracker:
            thumbs_up = Text("👍", color=GREEN, font_size=72).move_to(ORIGIN)
            self.play(Write(thumbs_up), run_time=tracker.duration)