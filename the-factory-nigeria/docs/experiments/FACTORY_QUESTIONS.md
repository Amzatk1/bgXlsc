# Four questions for The Factory

_Send this as it is. Each answer is one line, and each one changes what a customer is told._

Everything else in Studio has been settled — either from your feedback, or from research into how the
processes physically work. These four are the only things left that **nobody but you can answer**, because
they are facts about your workshop: what you buy, what your machines do, and what you will accept as an
order. Studio does not guess at any of them. Until you answer, it tells the customer "the team confirms
this" — which is honest, but it means they can't self-serve.

---

### 1. The towel-back fabric

We describe the custom-made T-shirt as *"usually sewn using The Factory's towel-back fabric option"* — your
words, kept exactly.

- Is "towel-back" what the rest of the trade calls **loopback / French terry** (smooth on the outside, small
  towel-like loops on the inside)? Or is it something else?
- What **weight** is it?
- Which **colours** can you reliably get hold of?

*Right now Studio says "Availability to confirm" and claims no composition or weight.*

---

### 2. What do you sublimate?

Studio treats the **sports jersey** and the **basketball jersey** as sublimated — printed as flat panels
before they're sewn, which is what lets a design cover the whole garment.

- Is that right?
- Is there anything **else** you sublimate?

*One thing is already settled, whatever the answer: sublimation ink only bonds with polyester, so a 100%
cotton T-shirt can never be sublimated. That's chemistry, not a choice.*

---

### 3. The ready-made T-shirt

- Is it genuinely **100% cotton**?
- How do you print it — **screen printing, DTG, or heat transfer**?

*Studio deliberately does not name a printing method you didn't choose. The customer can say what they'd
prefer, and you confirm.*

---

### 4. Minimum order, per method

Studio currently accepts a request for **a single item** for everything, and tells the customer you confirm
the minimum before any order is accepted.

- Sublimated jersey: minimum \_\_\_\_
- Custom-made (cut and sewn): minimum \_\_\_\_
- Printing onto a ready-made garment: minimum \_\_\_\_
- Caps: minimum \_\_\_\_

*If a sublimated jersey really needs 10 or 20, the customer should hear that from you **before** they spend
half an hour designing one.*

---

## Two things you may want to check, but we've made a sensible call on

**Print sizes.** Guides were cross-checked against standard industry print areas (full front/back up to
about 12″ × 16″, left chest 3–4″, sleeve 2–4″, cap front ~4.5″ × 2.5″). They're advisory — a customer can
place a design anywhere — but tell us if any are off for the garments you actually source.

**Awkward areas.** We warn (never block) when a design crosses a collar, placket, kangaroo pocket, hood
drawstring, side seam, hem or cap peak, using the usual 1″ clearance from seams. Seam and hem warnings are
switched **off** for sublimated garments, because those panels are printed flat before they're sewn. Anything
we're missing, or anything we're nagging about that you can actually produce fine?

---

**Where the answers go:** `src/studio/factoryFacts.ts`. Set the question's `status` to `"answered"`, write
the answer in, and put any minimum into `METHOD_MINIMUM`. The product cards, review screen, production
reference and WhatsApp enquiry all read from that one file — nothing else needs touching.
