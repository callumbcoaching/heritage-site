"""Shared page chrome: the phone menu button and the full-screen menu panel."""

BURGER = '<button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span><span></span></button>'

ITEMS = [
    ("/", "Home", "The promise"),
    ("/coaching", "Coaching", "Plans and what's included"),
    ("/results", "Results", "Client transformations"),
    ("/about", "About", "My story"),
    ("/terms-coaching", "Terms", "In plain English"),
]


def mobile_menu(active):
    cur = ' aria-current="page"'
    li = "".join(
        f'<li style="--d:{i}"><a href="{h}"{cur if n == active else ""}>'
        f'<span class="mnav__n">{i + 1:02d}</span><span class="mnav__t">{n}</span><span class="mnav__s">{s}</span></a></li>'
        for i, (h, n, s) in enumerate(ITEMS)
    )
    return f'''<div class="mnav" id="mnav" hidden>
  <div class="mnav__bg" aria-hidden="true"><img src="brand_assets/lion-crest.png" alt=""></div>
  <nav aria-label="Menu"><ol class="mnav__list">{li}</ol></nav>
  <div class="mnav__foot"><a class="btn" href="/apply">Apply for 1:1 coaching <span class="arr">→</span></a><p class="label">Structure over motivation</p></div>
</div>
'''
