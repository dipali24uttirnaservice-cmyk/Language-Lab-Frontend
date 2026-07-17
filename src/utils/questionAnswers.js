
export function getMatchPairs(question) {
  if (Array.isArray(question.match_pairs) && question.match_pairs.length) {
    return question.match_pairs;
  }
  if (Array.isArray(question.options) && question.options.length) {
    return question.options.map((entry) => {
      const [left, right] = String(entry).split(":");
      return { left: (left || "").trim(), right: (right || "").trim() };
    });
  }
  return [];
}

export function hasAnswer(question, answer) {
  if (!answer) return false;
  switch (question.question_type) {
    case "mcq":
    case "true_false":
    case "fill_blank":
    // Authored "spell_word" content gives whole candidate spellings as
    // options, not individual letters, so it's a plain choice like mcq.
    case "spell_word":
      return !!answer.value;
    case "short_answer":
      return !!(answer.text && answer.text.trim().length);
    // "recorder" content is authored as an arrange-the-words task (options
    // are discrete words/phrases, correct_answer is them joined in order),
    // not an audio recording — same shape as reorder.
    case "reorder":
    case "recorder":
      return (
        (answer.order || []).length === (question.options || []).length &&
        (question.options || []).length > 0
      );
    case "match":
      return Object.keys(answer.pairs || {}).length === getMatchPairs(question).length;
    default:
      return false;
  }
}

// Serializes a structured answer back into the plain string the backend
// compares against `correct_answer` (see exerciseAttemptController.js).
export function answerToString(question, answer) {
  if (!answer) return "";
  switch (question.question_type) {
    case "mcq":
    case "true_false":
    case "fill_blank":
    case "spell_word":
      return answer.value || "";
    case "short_answer":
      return answer.text || "";
    case "reorder":
    case "recorder":
      return (answer.order || []).map((id) => question.options[id]).join(",");
    case "match": {
      const pairs = answer.pairs || {};
      return getMatchPairs(question)
        .map((p) => `${p.left}:${pairs[p.left] || ""}`)
        .join("|");
    }
    default:
      return "";
  }
}

// For surfaces that grade locally (e.g. the embedded Knowledge Check, which
// receives the full module including correct_answer) rather than deferring
// to the backend submit endpoint.
export function checkAnswerLocally(question, answer) {
  if (!answer) return false;
  // Strip everything but letters/digits rather than just trimming — authored
  // correct_answer strings for "reorder"/"recorder" mix separators ("a, b, c"
  // vs "a b c"), so a punctuation/whitespace-insensitive compare is needed.
  const normalize = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalize(answerToString(question, answer)) === normalize(question.correct_answer);
}

export function shuffledPool(values) {
  return values
    .map((value, id) => ({ id, value }))
    .sort(() => Math.random() - 0.5);
}
