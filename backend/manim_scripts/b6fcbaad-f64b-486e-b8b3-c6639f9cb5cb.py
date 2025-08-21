from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.coqui import CoquiService

class ExplainMeAboutLlmsScene(VoiceoverScene):
    def construct(self):
        self.camera.background_color = WHITE
        self.set_speech_service(CoquiService(model_name="tts_models/en/ljspeech/tacotron2-DDC"))

        # Intro (0:00-0:15)
        with self.voiceover(text="Hey everyone, and welcome! Ever heard of LLMs? Sounds a bit like a secret code, right? Well, it stands for Large Language Model, and these clever bits of tech are powering some pretty amazing AI applications these days, from chatbots to creative writing tools. We're going to break down exactly what they are, how they work, and why they're such a big deal. Buckle up!") as tracker:
            title = Text("LLMs Explained!", font_size=60, color=BLUE).move_to(UP)
            self.play(Write(title), run_time=tracker.duration/3)

            nodes = VGroup(*[Dot(radius=0.1, color=BLUE).move_to(np.random.rand(3)) for _ in range(50)])
            connections = VGroup(*[Line(nodes[i].get_center(), nodes[j].get_center(), color=GRAY, stroke_opacity=0.5) for i in range(len(nodes)) for j in range(i + 1, len(nodes)) if np.random.rand() < 0.1])
            brain = VGroup(nodes, connections).scale(1.5).move_to(DOWN)
            self.play(Create(brain), run_time=tracker.duration/3)

            self.play(FadeOut(title), FadeOut(brain), run_time=tracker.duration/3)

        # What are LLMs? (0:15-0:45)
        with self.voiceover(text="So, what *is* a Large Language Model? Simply put, it's a type of artificial intelligence that can understand, generate, and even translate human language. Think of it like a super-smart parrot that's read millions of books, websites, and articles. But instead of just mimicking, it learns patterns and relationships within the text, allowing it to create new and original content.") as tracker:
            book = SVGMobject("book.svg", color=BLUE).scale(2).move_to(LEFT*3) # Replace "book.svg" with a path to an actual SVG file.
            globe = Sphere(radius=1, color=GREEN).move_to(RIGHT*3)
            self.play(Create(book), Create(globe), run_time=tracker.duration/4)

            text_example = Text("Example Text", color=BLACK).move_to(globe.get_center())
            self.play(Write(text_example), Rotate(text_example, angle=TAU, about_point=globe.get_center()), run_time=tracker.duration/2)

            self.play(FadeOut(book), FadeOut(globe), FadeOut(text_example), run_time=tracker.duration/4)

        # How do they work? (0:45-1:30)
        with self.voiceover(text="Now, for the slightly geeky part: how do they *work*? LLMs are based on neural networks, which are inspired by the structure of the human brain. These networks are trained on massive amounts of text data, learning to predict the next word in a sequence. The \"large\" in LLM refers to the sheer size of these networks and the enormous datasets they're trained on. The more data, the better they get at understanding context, nuance, and even humor. Imagine feeding a computer the entire internet – that's the scale we're talking about! They learn probabilities – What word is most likely to follow this other word? They find patterns and connections by analyzing text.") as tracker:
            #Simplified Neural Network Representation
            input_nodes = VGroup(*[Dot(color=BLUE) for _ in range(5)]).arrange(DOWN).to_edge(LEFT)
            hidden_nodes = VGroup(*[Dot(color=GREEN) for _ in range(7)]).arrange(DOWN).move_to(ORIGIN)
            output_nodes = VGroup(*[Dot(color=RED) for _ in range(3)]).arrange(DOWN).to_edge(RIGHT)

            connections1 = VGroup(*[Line(input_nodes[i].get_center(), hidden_nodes[j].get_center(), color=GRAY, stroke_opacity=0.3) for i in range(len(input_nodes)) for j in range(len(hidden_nodes))])
            connections2 = VGroup(*[Line(hidden_nodes[i].get_center(), output_nodes[j].get_center(), color=GRAY, stroke_opacity=0.3) for i in range(len(hidden_nodes)) for j in range(len(output_nodes))])

            network = VGroup(input_nodes, hidden_nodes, output_nodes, connections1, connections2)

            self.play(Create(network), run_time=tracker.duration/3)

            # Numbers flowing
            numbers = VGroup(*[DecimalNumber(value=np.random.rand(), color=YELLOW, num_decimal_places=2).scale(0.5).move_to(node.get_center()) for node in hidden_nodes])
            self.play(Create(numbers), run_time=tracker.duration/3)
            self.play(FadeOut(numbers), run_time=tracker.duration/3)

        # What can they do? (1:30-2:00)
        with self.voiceover(text="Okay, so they're trained on lots of text... big deal, right? Wrong! This training enables LLMs to do some incredible things. They can write different kinds of creative content, answer your questions in an informative way, translate languages fluently, summarize long documents, even write computer code! The possibilities are really endless and constantly evolving. It's like having a digital assistant that can help you with almost any language-based task.") as tracker:
            chatbot = SVGMobject("chatbot.svg", color=BLUE).scale(0.5).move_to(LEFT*3+UP) # Replace "chatbot.svg" with an actual SVG
            translate = SVGMobject("translate.svg", color=GREEN).scale(0.5).move_to(LEFT*3+DOWN) # Replace "translate.svg" with an actual SVG
            code = SVGMobject("code.svg", color=RED).scale(0.5).move_to(RIGHT*3+UP) # Replace "code.svg" with an actual SVG
            poem = SVGMobject("poem.svg", color=PURPLE).scale(0.5).move_to(RIGHT*3+DOWN) # Replace "poem.svg" with an actual SVG

            self.play(Create(chatbot), Create(translate), Create(code), Create(poem), run_time=tracker.duration)

        # Why are they important? (2:00-2:30)
        with self.voiceover(text="So, why should you care about LLMs? Well, they're revolutionizing the way we interact with technology. They're making AI more accessible and user-friendly. They can help us automate tasks, improve communication, and even unlock new discoveries. They're not just about fancy tech; they're about making our lives easier and more efficient.") as tracker:
            people = SVGMobject("people.svg", color=BLUE).scale(0.8).move_to(LEFT*3) # Replace "people.svg" with an actual SVG
            productivity = SVGMobject("productivity.svg", color=GREEN).scale(0.8).move_to(RIGHT*3) # Replace "productivity.svg" with an actual SVG
            discovery = SVGMobject("discovery.svg", color=YELLOW).scale(0.8).move_to(DOWN) # Replace "discovery.svg" with an actual SVG

            self.play(Create(people), Create(productivity), Create(discovery), run_time=tracker.duration)

        # Outro (2:30-3:00)
        with self.voiceover(text="That's LLMs in a nutshell! They are a powerful and evolving technology, and we're just beginning to scratch the surface of their potential. If you found this video helpful, give it a like and subscribe for more explanations of cool tech concepts. Let us know in the comments what AI topics you'd like us to cover next. Thanks for watching!") as tracker:
            nodes = VGroup(*[Dot(radius=0.1, color=BLUE).move_to(np.random.rand(3)) for _ in range(50)])
            connections = VGroup(*[Line(nodes[i].get_center(), nodes[j].get_center(), color=GRAY, stroke_opacity=0.5) for i in range(len(nodes)) for j in range(i + 1, len(nodes)) if np.random.rand() < 0.1])
            brain = VGroup(nodes, connections).scale(1.5).move_to(UP)
            self.play(Create(brain), run_time=tracker.duration/3)

            like_subscribe = Text("Like and Subscribe!", font_size=48, color=GREEN).move_to(DOWN)
            self.play(Write(like_subscribe), run_time=tracker.duration/3)
            self.play(FadeOut(brain), FadeOut(like_subscribe), run_time=tracker.duration/3)