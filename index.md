---
layout: default
---

I connect wet-lab experimentation with computational analysis to deliver rigorous, data-driven science. My current work bridges metallomics, genomics and statistics to study **gallbladder cancer**.

## Affiliations

- Institut de Cancérologie Strasbourg Europe (ICANS) / Institut Strauss, Strasbourg, France
- [Institute of Medical Biometry (IMBI), Heidelberg University](https://klinikum.uni-heidelberg.de/en/kliniken-institute/institute/medizinische-biometrie), Germany

## About

- **Biotechnology Engineer.** Rational drug design, cell culture, organic synthesis and purification. Cellular and molecular biology, cell viability assays, and scientific documentation in LaTeX.
- **Master in Medical Sciences.** Cellular and molecular biology: PCR and RT-PCR, protein expression and purification. Data analysis and visualization in R and Python.
- **Doctoral researcher.** Dr. sc. hum. at Heidelberg University, focused on metallomics and genomics for gallbladder cancer prediction, combining laboratory work with statistical analysis.

## Projects

A selection of ongoing and past initiatives where I applied biology, statistics and reproducible tooling.

**Gallbladder cancer metallomics** (Research, Statistics)
Integrative analysis of trace-metal and genomic data to predict gallbladder cancer risk in patients with gallstone disease. Doctoral project in progress.

**[Code Summary](https://github.com/DotStefano/Code_summary)** (R, RMarkdown)
RMarkdown template with light and dark themes for clear, reproducible code documentation.

**[Dose-Response Animations](https://github.com/DotStefano/Gif-your-dose-response)** (Python)
Python tool that generates animated Hill-equation dose-response curves, showing the shift in EC50 after treatment.

**[Boxplots in R](https://github.com/DotStefano/Boxplot-in-R)** (R)
Examples of boxplot construction and styling in R for clear comparisons between groups.

## Presentation templates

Two Madrid-theme Beamer templates for academic presentations, built with Fira Sans and optimized for XeLaTeX on Overleaf.

### Palette 1: Navy and Gold

High-contrast navy with golden accents. Includes a design reference slide and sections for Introduction, Methods, Results and Discussion.
[GitHub](https://github.com/DotStefano/Beamer-template/tree/main/Paleta-1-Navy-Gold) · [Open in Overleaf](https://www.overleaf.com/docs?snip_uri=https://raw.githubusercontent.com/DotStefano/Beamer-template/main/Paleta-1-Navy-Gold/Paleta_1_Navy_Gold.tex)

<figure class="preview">
  <a href="{{ '/assets/pdf/Paleta_1_Navy_Gold.pdf' | relative_url }}" target="_blank" rel="noopener">
    <img src="{{ '/images/previews/palette1-01.jpg' | relative_url }}" alt="Palette 1, Navy and Gold: title slide" loading="lazy">
    <img src="{{ '/images/previews/palette1-02.jpg' | relative_url }}" alt="Palette 1, Navy and Gold: design reference slide" loading="lazy">
  </a>
  <figcaption>Preview of the first slides. Click to open the full PDF.</figcaption>
</figure>

### Palette 2: Blue and Red

Classic academic blue tones with a red accent, following the same structure as Palette 1.
[GitHub](https://github.com/DotStefano/Beamer-template/tree/main/Paleta-2-Blue-Red) · [Open in Overleaf](https://www.overleaf.com/docs?snip_uri=https://raw.githubusercontent.com/DotStefano/Beamer-template/main/Paleta-2-Blue-Red/template_beamer_alt.tex)

<figure class="preview">
  <a href="{{ '/assets/pdf/Paleta_2_Blue_Red.pdf' | relative_url }}" target="_blank" rel="noopener">
    <img src="{{ '/images/previews/palette2-01.jpg' | relative_url }}" alt="Palette 2, Blue and Red: title slide" loading="lazy">
    <img src="{{ '/images/previews/palette2-02.jpg' | relative_url }}" alt="Palette 2, Blue and Red: design reference slide" loading="lazy">
  </a>
  <figcaption>Preview of the first slides. Click to open the full PDF.</figcaption>
</figure>

## CV LaTeX template

A minimalist, black-and-white, ATS-friendly CV template with modular sections and FontAwesome icons. Easy to adapt for academic, research or industry profiles.
[View on GitHub](https://github.com/DotStefano/Simple-CV) · [Read in Overleaf](https://www.overleaf.com/read/ngrzswrvzptb#987500)

<figure class="preview">
  <a href="{{ '/assets/pdf/Simple_CV.pdf' | relative_url }}" target="_blank" rel="noopener">
    <img src="{{ '/images/previews/cv-1.jpg' | relative_url }}" alt="CV LaTeX template: first page" loading="lazy">
  </a>
  <figcaption>Preview of the example CV. Click to open the full PDF.</figcaption>
</figure>

## Contact

Send me a message and I will reply as soon as possible.

<form id="contact-form" class="contact" method="POST" action="https://formspree.io/f/xovpbpzk">
  <label for="name">Name</label>
  <input type="text" name="name" id="name" required autocomplete="name">

  <label for="email">Email</label>
  <input type="email" name="_replyto" id="email" required autocomplete="email">

  <label for="subject">Subject</label>
  <input type="text" name="subject" id="subject">

  <label for="message">Message</label>
  <textarea name="message" id="message" rows="6" required></textarea>

  <button type="submit">Send message</button>
  <button type="reset">Clear</button>
</form>
<p id="status" role="status" aria-live="polite"></p>

<script>
  const form = document.getElementById("contact-form");
  const status = document.getElementById("status");
  if (form && status) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          status.textContent = "Message sent. Thank you!";
          form.reset();
        } else {
          status.textContent = "There was a problem sending the message. Please try again.";
        }
      } catch (error) {
        status.textContent = "Network error. Please try again.";
      }
    });
  }
</script>
