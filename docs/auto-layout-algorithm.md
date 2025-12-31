# Auto-Layout Algorithm Analysis & Improvements

> Document created: 2024-12-30
> Status: Implementing improvements

## Problem Statement

The puzzle creator frequently fails with the error:

> "Could not find a valid layout after multiple attempts. Try different words or shuffle again."

This occurs because placing words on an 8×6 grid (48 cells) where words must form connected paths without overlapping is a constraint satisfaction problem that the current greedy algorithm handles poorly.

---

## Current Algorithm Analysis

The implementation in `lib/utils/auto-layout.ts` uses a **greedy sequential placement with randomized DFS**:

### How It Works

1. **Places the spangram first** (must span opposite edges - top↔bottom or left↔right)
2. **Places theme words one-by-one** in their original order
3. Uses **backtracking within each word** (DFS) but **not across words**
4. Retries the entire process up to **20 times** with different random seeds

### Why It Fails Frequently

| Issue                      | Description                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **No global backtracking** | Once a word is placed, the algorithm never reconsiders that placement. If word 5 can't fit, it doesn't try re-placing words 1-4.     |
| **Order sensitivity**      | Placing words in a different order can dramatically affect success rate. Longer words placed late may have no valid paths remaining. |
| **Fragmentation**          | Random DFS creates "winding" paths that fragment remaining space into disconnected regions.                                          |
| **No look-ahead**          | The algorithm doesn't check if a placement leaves enough connected space for remaining words.                                        |

---

## Improvements Implemented

### Improvement #1: Sort Words by Length (Longest First)

**Rationale**: Longer words have fewer valid placements because they require more contiguous cells. By placing them first (when more space is available), we reduce the chance of getting "stuck" with no valid path for a long word.

**Implementation**:

```typescript
// Sort theme words by length (longest first)
const sortedThemeWords = [...themeWords].sort((a, b) => b.length - a.length);
```

### Improvement #4: Word-Level Backtracking

**Rationale**: Instead of committing to each word placement and only retrying the entire puzzle, we implement recursive backtracking across words. If word N can't be placed, we backtrack to word N-1 and try a different placement for it.

**Implementation**:

- Convert sequential word placement to recursive function
- Track all valid starting positions for each word
- When a word fails, backtrack and try next position for previous word
- Only fail when all combinations have been exhausted

---

## Alternative Algorithms for Future Consideration

### Quick Wins (Low Effort)

- **Try multiple word orderings**: Generate permutations of theme word order
- **Prefer compact paths**: Modify DFS direction priority to avoid fragmentation

### Medium Effort

- **Minimum Remaining Values (MRV)**: At each step, place the word with fewest valid positions

### Full Rewrite Options

- **CSP Solver**: Implement constraint satisfaction with arc consistency
- **Dancing Links / Algorithm X**: Exact cover solver (Knuth)
- **SAT Solver**: Encode as boolean satisfiability problem

---

## Research Resources

| Topic                  | Resource                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Crossword generation   | Academic papers on computational linguistics                                                                  |
| Word search generators | GitHub: search "word search generator"                                                                        |
| CSP for puzzles        | "AI: A Modern Approach" (Russell & Norvig), Ch. 6                                                             |
| Dancing Links          | [Knuth's paper](https://arxiv.org/abs/cs/0011047)                                                             |
| JS SAT solvers         | [sat-js](https://github.com/niclaswue/minisat-js), [logic-solver](https://www.npmjs.com/package/logic-solver) |

---

## Expected Impact

With improvements #1 and #4, we expect:

- **Higher success rate**: Backtracking explores more of the solution space
- **Better layouts**: Longest words placed first have more freedom for natural paths
- **Possible performance trade-off**: More thorough search may take longer (mitigated by early termination on success)
