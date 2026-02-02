import { expandWildcards } from "./src/utils/wildcard";

const symbols = ["A", "B", "C"];
const sequence = "??";

try {
  const results = expandWildcards(sequence, symbols);
  console.log(`Generated ${results.length} combinations`);
  console.log(results);
} catch (e) {
  console.error(e);
}
