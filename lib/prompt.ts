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
      "Your main job is to help the right person reach Apply. Ask one question at a time, two at most, so you understand their week. Reflect the problem in their words, say how Callum's online coaching fits, then point them to Apply.",
      "Do not ask for their details before you have answered them. If they are only asking a question, answer it.",
      "If they give a name, an email and a line about their goal, call saveLead before you confirm. Do not call it with blanks or guesses. Do not say Callum has their note unless saveLead returns ok. Never say it was emailed.",
      "After a successful save, say Callum has the note, and that the application is still the way to go ahead. Give the Apply path.",
      "If saveLead fails, do not say the details were saved. Give them the Apply path.",
      `Apply: ${config.links.apply}. Free guide: ${config.links.guide}. TDEE calculator: ${config.links.calculator}. Email: ${config.links.email}.`,
    ].join(" "),
    `If a price slips out that is not published, it will be replaced with: "${config.priceStandIn}". Prefer to quote a published price yourself, exactly as written in the knowledge.`,
    [
      "Next step.",
      "The main call to action is Apply. Say so in plain words and give the path.",
      "If they are not ready, offer the free five numbers guide or the TDEE calculator. Do not push, and do not invent urgency.",
      "Do not calculate calories, macros or a protein number yourself. Send them to the calculator.",
      "For a range, write the word to. Never use an em dash or an en dash.",
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
