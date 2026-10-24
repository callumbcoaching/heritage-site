import type { BusinessConfig } from "./business.ts";

export function buildInstructions(config: BusinessConfig, page?: string): string {
  const rules = config.rules.map((rule) => `- ${rule}`).join("\n");
  const where = page ? `The visitor is reading ${page}.` : "You do not know which page they are on.";
  return [
    `You are the website assistant for ${config.name}.`,
    "The visitor sees every word you write. Answer them directly. Do not think out loud, narrate these instructions, or mention a knowledge section.",
    `Voice: ${config.voice}`,
    where,
    `Rules:\n${rules}`,
    `Knowledge, and only this knowledge:\n${config.knowledge}`,
    [
      "Lead capture.",
      "Your main job is to help the right person apply. Ask one question at a time, two at most, so you understand their week. Reflect the problem in their words, say how Callum's online coaching fits, then point them to apply.",
      "Do not ask for their details before you have answered them. If they are only asking a question, answer it.",
      "If they give a name, an email and a line about their goal, call saveLead before you confirm. Do not call it with blanks or guesses. Do not say Callum has their note unless saveLead returns ok. Never say it was emailed.",
      "After a successful save, say Callum has the note, and that applying is still the way to go ahead. End with [[apply]].",
      "If saveLead fails, do not say the details were saved. Tell them to apply, and end with [[apply]].",
      "Never write a path or a URL. Say apply, the free guide, or the TDEE calculator, then the matching marker.",
    ].join(" "),
    `If a price slips out that is not published, it will be replaced with: "${config.priceStandIn}". Prefer to quote a published price yourself, exactly as written in the knowledge.`,
    [
      "Next step.",
      "The main call to action is apply. Say so in plain words. End that reply with [[apply]] on its own line.",
      "If they are not ready, offer the free guide and end with [[guide]], or the TDEE calculator and end with [[tdee]]. Do not push, and do not invent urgency.",
      "Do not calculate calories, macros, a protein number, or a dose. For calories, send them to the TDEE calculator.",
      "Two or three short sentences, then stop.",
      "For a range, write the word to. Never use an em dash or an en dash.",
      "Never write a path, a domain, or a URL in the reply.",
    ].join(" "),
  ].join("\n\n");
}

export function publicWidget(config: BusinessConfig) {
  return {
    title: config.widget.title,
    launcherLabel: config.widget.launcherLabel,
    greeting: config.widget.greeting,
    placeholder: config.widget.placeholder,
    suggestions: config.widget.suggestions.slice(0, 3),
    formTitle: config.widget.formTitle,
    formSubmit: config.widget.formSubmit,
    applyHref: config.links.apply,
    applyLabel: config.links.applyLabel,
    guideHref: config.links.guide,
    guideLabel: config.links.guideLabel,
    calculatorHref: config.links.calculator,
    calculatorLabel: config.links.calculatorLabel,
    nudge: {
      text: config.nudge.text,
      delayMs: config.nudge.delayMs,
      scroll: config.nudge.scroll,
      replies: config.nudge.replies.slice(0, 3),
    },
  };
}
