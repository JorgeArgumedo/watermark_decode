import { expandWildcards } from "./src/utils/wildcard";

const symbols = ["A", "B", "C"];
const sequence = "??";

try {
  const results = expandWildcards(sequence, symbols);
} catch (e) {
  console.error(e);
}
