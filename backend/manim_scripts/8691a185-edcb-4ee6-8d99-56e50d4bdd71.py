from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.gtts import GTTSService

class ExplainAboutLlmsScene(VoiceoverScene):
    def construct(self):
        self.camera.background_color = WHITE
        self.set_speech_service(GTTSService())

        # Initial Scene: Dynamic Data Swirl
        data_swirl = VGroup(*[Dot(point=np.random.randn(3), color=BLUE) for _ in range(100)])
        node_network = VGroup(*[Dot(point=np.random.rand(3), color=GREEN) for _ in range(20)],
                              *[Line(Dot().get_center(), Dot().get_center(), color=GREY, opacity=0.5) for _ in range(30)])
        data_swirl.scale(2)
        node_network.scale(2)

        self.play(Create(data_swirl), Create(node_network))

        with self.voiceover(text="Hey everyone, ever wondered what's behind those super-smart chatbots and AI writing tools that seem to understand exactly what you’re saying? The secret ingredient is called an LLM, or Large Language Model. Get ready, because we’re about to unravel this tech magic!") as tracker:
            self.play(FadeOut(data_swirl), FadeOut(node_network), run_time=tracker.duration)

        # Transition to LLM Graphic
        llm_text = Tex("LLM", color=BLACK).scale(3)
        full_name_text = Tex("Large Language Model", color=GREY).next_to(llm_text, DOWN)
        group = VGroup(llm_text, full_name_text)

        self.play(Write(llm_text), Write(full_name_text))

        with self.voiceover(text="So, what *is* an LLM? Simply put, it's a computer program trained on a HUGE amount of text data. Think of it like reading almost the entire internet! This massive training allows it to understand, predict, and generate human-like text.") as tracker:
            self.play(group.animate.to_edge(UP), run_time=tracker.duration * 0.5)

            internet = ImageMobject("internet.png").scale(1.5).to_edge(DOWN) #Replace with your image
            self.play(FadeIn(internet), run_time=tracker.duration * 0.5)
            self.play(FadeOut(internet), run_time=tracker.duration * 0.2)


        # Book Opening Animation
        book = SVGMobject("book_opening.svg", fill_color=BLUE, fill_opacity=0.8, stroke_color=BLUE_E) #Replace with your SVG
        book.scale(1.5).to_edge(LEFT)

        brain_shape = SVGMobject("brain.svg", fill_color=RED, fill_opacity=0.8, stroke_color=RED_E) #Replace with your SVG
        brain_shape.scale(1.5).to_edge(RIGHT)

        pages = VGroup(*[Rectangle(width=0.2, height=0.3, color=YELLOW, fill_opacity=0.7) for _ in range(50)])
        pages.arrange(RIGHT, buff=0.1)
        pages.move_to(book.get_center() + RIGHT * 2)

        with self.voiceover(text="The first key thing is the word “Large.” LLMs are trained on terabytes of text – books, articles, websites, code… you name it. Imagine teaching a dog to fetch by showing it EVERY SINGLE THING that *could* be fetched! That's the scale we're talking about.") as tracker:
            self.play(FadeIn(book), run_time=tracker.duration * 0.3)
            self.play(Create(pages), run_time=tracker.duration * 0.4)
            self.play(Transform(pages, brain_shape), run_time=tracker.duration * 0.3)
            self.play(FadeOut(book), FadeOut(pages), run_time=tracker.duration * 0.1)

        # Network of Interconnected Nodes
        network = VGroup(*[Dot(point=np.random.randn(3), color=BLUE) for _ in range(50)],
                         *[Line(Dot().get_center(), Dot().get_center(), color=GREY, opacity=0.3) for _ in range(100)])
        network.scale(1.5)

        with self.voiceover(text="Next, let’s talk about the “Language” part. LLMs analyze the relationships between words and phrases. They learn grammar, context, and even subtle nuances in language. It's like learning the rules of a game so well, you can predict the next move.") as tracker:
            self.play(FadeIn(network), run_time=tracker.duration * 0.6)
            for dot in network[0:50]:
                self.play(dot.animate.set_color(YELLOW), run_time=tracker.duration * 0.4 / 50)
            self.play(FadeOut(network), run_time=tracker.duration * 0.1)


        # Interface Animation
        interface = Rectangle(width=6, height=3, color=GREY, fill_opacity=0.2)
        input_text = Tex("Ask me a question...", color=BLACK).move_to(interface.get_center() + UP * 0.5)
        output_text = Tex("LLM generated response...", color=BLACK).move_to(interface.get_center() + DOWN * 0.5)
        typing_cursor = Line(UP, DOWN, color=BLACK).set_height(input_text.height).next_to(input_text, RIGHT, buff=0)

        with self.voiceover(text="Finally, the Model part refers to the statistical model that captures all of this learned information. Think of it like a really, really complex formula that predicts which words are most likely to follow a given sequence of words. When you ask it a question, it uses this model to generate the most plausible and relevant answer.") as tracker:
            self.play(Create(interface), Write(input_text), run_time=tracker.duration * 0.5)
            self.play(Create(typing_cursor), run_time = tracker.duration * 0.2)
            self.play(FadeOut(typing_cursor), Write(output_text), run_time=tracker.duration * 0.3)
            self.play(FadeOut(interface), FadeOut(input_text), FadeOut(output_text), run_time=tracker.duration * 0.1)



        # Examples of LLM Applications
        email_icon = SVGMobject("email.svg", color=BLUE).scale(0.5) #Replace with your SVG
        translate_icon = SVGMobject("translate.svg", color=GREEN).scale(0.5) #Replace with your SVG
        summarize_icon = SVGMobject("summarize.svg", color=RED).scale(0.5) #Replace with your SVG
        code_icon = SVGMobject("code.svg", color=YELLOW).scale(0.5) #Replace with your SVG

        email_text = Tex("Writing Emails", color=BLUE).next_to(email_icon, DOWN)
        translate_text = Tex("Translating Languages", color=GREEN).next_to(translate_icon, DOWN)
        summarize_text = Tex("Summarizing Documents", color=RED).next_to(summarize_icon, DOWN)
        code_text = Tex("Generating Code", color=YELLOW).next_to(code_icon, DOWN)

        email_group = VGroup(email_icon, email_text).to_edge(LEFT)
        translate_group = VGroup(translate_icon, translate_text).next_to(email_group, RIGHT)
        summarize_group = VGroup(summarize_icon, summarize_text).next_to(translate_group, RIGHT)
        code_group = VGroup(code_icon, code_text).next_to(summarize_group, RIGHT)

        with self.voiceover(text="LLMs are used for all sorts of cool things! From writing emails and translating languages to answering your questions and even generating creative content like poems or code. They're the power behind a lot of the AI tools you see popping up everywhere.") as tracker:
            self.play(FadeIn(email_group), run_time=tracker.duration * 0.25)
            self.play(FadeIn(translate_group), run_time=tracker.duration * 0.25)
            self.play(FadeIn(summarize_group), run_time=tracker.duration * 0.25)
            self.play(FadeIn(code_group), run_time=tracker.duration * 0.25)

        # Final Recap and Conclusion
        final_llm_representation = SVGMobject("llm_final.svg", color=BLUE).scale(2) #Replace with your SVG

        with self.voiceover(text="So, to recap, LLMs are massive, language-focused, statistical models that learn from huge amounts of text data. They understand and generate human-like text, powering everything from chatbots to code generators.") as tracker:
            self.play(FadeOut(email_group), FadeOut(translate_group), FadeOut(summarize_group), FadeOut(code_group), run_time = tracker.duration * 0.5)
            self.play(FadeIn(final_llm_representation), run_time=tracker.duration * 0.5)

        with self.voiceover(text="Now that you understand the basics of LLMs, go out there and explore! There are tons of amazing applications being developed every day. What are your favorite AI tools powered by LLMs? Let us know in the comments below, and don't forget to subscribe for more tech explainers!") as tracker:
            self.play(FadeOut(final_llm_representation), run_time = tracker.duration)