# Image Mapping

Source: Google Drive folder "Personal Training" (generated PNGs with non-semantic filenames).

| Original filename | New filename | Reason |
|---|---|---|
| Gemini_Generated_Image_43x0e843x0e843x0.png | plate-method.jpg | Plate diagram: 50% protein / 25% veg / 25% carbs |
| Gemini_Generated_Image_3b33u23b33u23b33.png | nutrition-basics.jpg | "Your Simple Start to Nutrition" — protein/veg/carbs/fats/water icons |
| Gemini_Generated_Image_x49hg5x49hg5x49h.png | hidden-calories.jpg | "Hidden Calories: Small Bites, Big Impact" — oil/nuts/mayo/cheese/drink/dressing |
| Gemini_Generated_Image_70ayaq70ayaq70ay.png | food-swaps.jpg | "Your Smart Food Swaps Guide" — mince/bread/drink/mayo/oil comparisons |
| Gemini_Generated_Image_thjhn7thjhn7thjh.png | macro-targets.jpg | "Understanding Your Metabolism & Fat Loss" — BMR/TDEE/fat-loss target |
| Gemini_Generated_Image_2ymt732ymt732ymt.png | training-schedule.jpg | "Beginner Gym Weekly Plan (Push/Pull & Cardio)" — Day 1-6 schedule |
| Gemini_Generated_Image_ou0s6you0s6you0s.png | heart-rate-zones.jpg | "Your Beginner Heart-Rate Zones" — Zone 1-5 BPM chart |
| Gemini_Generated_Image_dl9tn9dl9tn9dl9t.png | progress-trend.jpg | "Your 4-Week Beginner Fat-Loss Roadmap" — Week 1-4 progression |
| Gemini_Generated_Image_gfjy64gfjy64gfjy.png | troubleshooting-flow.jpg | "Weight Loss Stall Troubleshooter" — decision flowchart |

## Flagged deviation from the build prompt

The build prompt and TRD/PRD list expected filenames with a `.png` extension
(e.g. `plate-method.png`). The source PNGs were 5–6MB each (54MB total),
far above the TRD's performance targets (non-hero images ~500KB, total
page load ideally under 5MB).

Resizing to 1200px wide and keeping PNG format only got files down to
~1.3MB each — still too large. Re-encoding as JPEG (quality 80) at the
same width brought every file to 140–256KB with no visible loss of
clarity on the flat, high-contrast infographic artwork.

**Resolution:** all nine images are saved as `.jpg` instead of `.png`,
using the same semantic base filenames from the spec. `index.html`
references the `.jpg` paths. Total image payload is ~1.9MB, well inside
the TRD's 5MB budget. Flagging this per the build prompt's instruction to
surface conflicts between the prompt and the TRD's own performance rules.
