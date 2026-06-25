import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'public/images/settlements')

mkdirSync(outDir, { recursive: true })

const motifs = {
  chat: `
    <rect x="188" y="118" width="392" height="184" rx="34" fill="#fdf8ee" stroke="#5d5048" stroke-width="12"/>
    <rect x="246" y="164" width="188" height="24" rx="12" fill="#8fb8a2"/>
    <rect x="246" y="214" width="264" height="24" rx="12" fill="#c99a83"/>
    <path d="M278 302l-42 52 92-42z" fill="#fdf8ee" stroke="#5d5048" stroke-width="12" stroke-linejoin="round"/>`,
  document: `
    <path d="M254 86h200l72 72v214H254z" fill="#fff8ea" stroke="#5d5048" stroke-width="12"/>
    <path d="M454 86v78h72" fill="#ead7c6" stroke="#5d5048" stroke-width="12"/>
    <rect x="298" y="190" width="178" height="20" rx="10" fill="#95b5a3"/>
    <rect x="298" y="242" width="136" height="20" rx="10" fill="#ce8f86"/>
    <rect x="298" y="294" width="198" height="20" rx="10" fill="#d6bd7c"/>`,
  phoneBill: `
    <rect x="262" y="74" width="244" height="300" rx="34" fill="#efe9f5" stroke="#5d5048" stroke-width="12"/>
    <rect x="304" y="118" width="160" height="160" rx="22" fill="#f7f1e6"/>
    <rect x="322" y="152" width="124" height="18" rx="9" fill="#8fb8a2"/>
    <rect x="322" y="198" width="94" height="18" rx="9" fill="#d09082"/>
    <path d="M326 304h116" stroke="#bf4d49" stroke-width="18" stroke-linecap="round"/>
    <path d="M354 286l-28 18 28 18" fill="none" stroke="#bf4d49" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,
  meme: `
    <rect x="218" y="96" width="332" height="240" rx="30" fill="#fff7df" stroke="#5d5048" stroke-width="12"/>
    <circle cx="330" cy="202" r="54" fill="#f4cf73" stroke="#5d5048" stroke-width="10"/>
    <path d="M300 212q30 30 62 0" fill="none" stroke="#5d5048" stroke-width="10" stroke-linecap="round"/>
    <rect x="404" y="164" width="88" height="24" rx="12" fill="#8fb8a2"/>
    <rect x="404" y="220" width="68" height="24" rx="12" fill="#c98b83"/>`,
  elevator: `
    <rect x="244" y="72" width="280" height="310" rx="24" fill="#e8e5ef" stroke="#5d5048" stroke-width="12"/>
    <path d="M384 96v262" stroke="#9b9298" stroke-width="10"/>
    <rect x="306" y="156" width="48" height="48" rx="10" fill="#9fc0a8"/>
    <rect x="414" y="156" width="48" height="48" rx="10" fill="#d3a07f"/>
    <path d="M330 284l54-54 54 54" fill="none" stroke="#5d5048" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`,
  armor: `
    <path d="M284 92h200l48 94-42 178H278l-42-178z" fill="#d7d1c7" stroke="#5d5048" stroke-width="12" stroke-linejoin="round"/>
    <path d="M330 164h108l-30 118h-48z" fill="#f5efe2" stroke="#5d5048" stroke-width="10" stroke-linejoin="round"/>
    <rect x="232" y="188" width="72" height="34" rx="12" fill="#b79a85"/>
    <rect x="464" y="188" width="72" height="34" rx="12" fill="#b79a85"/>`,
  calendar: `
    <rect x="232" y="102" width="304" height="246" rx="28" fill="#fff8ea" stroke="#5d5048" stroke-width="12"/>
    <rect x="232" y="102" width="304" height="64" rx="28" fill="#d58b87" stroke="#5d5048" stroke-width="12"/>
    <path d="M306 226l156 68M462 226l-156 68" stroke="#bf4d49" stroke-width="18" stroke-linecap="round"/>
    <rect x="292" y="184" width="38" height="28" rx="6" fill="#a8c4ad"/>
    <rect x="438" y="184" width="38" height="28" rx="6" fill="#d6bd7c"/>`,
  folder: `
    <path d="M196 144h188l34 40h154v154H196z" fill="#f1c67b" stroke="#5d5048" stroke-width="12" stroke-linejoin="round"/>
    <rect x="238" y="218" width="292" height="92" rx="18" fill="#fff3d2" stroke="#5d5048" stroke-width="10"/>
    <path d="M514 190l70-46 24 38-72 48z" fill="#d58b87" stroke="#5d5048" stroke-width="10" stroke-linejoin="round"/>`,
  resume: `
    <rect x="250" y="86" width="268" height="294" rx="22" fill="#fff8ea" stroke="#5d5048" stroke-width="12"/>
    <circle cx="330" cy="164" r="38" fill="#a8c4ad" stroke="#5d5048" stroke-width="10"/>
    <rect x="302" y="230" width="164" height="18" rx="9" fill="#9b9298"/>
    <rect x="302" y="276" width="122" height="18" rx="9" fill="#c98b83"/>
    <path d="M468 320l48 48M516 320l-48 48" stroke="#bf4d49" stroke-width="14" stroke-linecap="round"/>`,
  tea: `
    <path d="M270 188h188v86q0 70-94 70t-94-70z" fill="#f7f1e6" stroke="#5d5048" stroke-width="12"/>
    <path d="M458 214h46q38 0 38 38t-38 38h-46" fill="none" stroke="#5d5048" stroke-width="12"/>
    <path d="M312 140q-24-36 16-58M382 140q-24-36 16-58" fill="none" stroke="#9fbba8" stroke-width="12" stroke-linecap="round"/>
    <rect x="238" y="340" width="272" height="18" rx="9" fill="#d6bd7c"/>`,
  mask: `
    <path d="M224 154q160-96 320 0v92q0 92-160 118-160-26-160-118z" fill="#fff4df" stroke="#5d5048" stroke-width="12"/>
    <circle cx="330" cy="220" r="24" fill="#5d5048"/>
    <circle cx="438" cy="220" r="24" fill="#5d5048"/>
    <path d="M340 286q44 28 88 0" fill="none" stroke="#c65f63" stroke-width="14" stroke-linecap="round"/>`,
  form: `
    <rect x="222" y="88" width="324" height="280" rx="24" fill="#fff8ea" stroke="#5d5048" stroke-width="12"/>
    <rect x="278" y="146" width="182" height="18" rx="9" fill="#9b9298"/>
    <rect x="278" y="200" width="214" height="18" rx="9" fill="#9b9298"/>
    <rect x="278" y="254" width="136" height="18" rx="9" fill="#9b9298"/>
    <circle cx="468" cy="294" r="42" fill="#d58b87" stroke="#5d5048" stroke-width="10"/>`,
  muteBubble: `
    <rect x="206" y="130" width="356" height="156" rx="38" fill="#eef3f4" stroke="#5d5048" stroke-width="12"/>
    <path d="M300 286l-48 52 98-44z" fill="#eef3f4" stroke="#5d5048" stroke-width="12" stroke-linejoin="round"/>
    <path d="M322 204h118M342 238l78-72" stroke="#bf4d49" stroke-width="16" stroke-linecap="round"/>`,
  tissue: `
    <rect x="224" y="182" width="320" height="142" rx="28" fill="#e7f2f0" stroke="#5d5048" stroke-width="12"/>
    <path d="M314 192q34-108 126 0z" fill="#fffdf8" stroke="#5d5048" stroke-width="10" stroke-linejoin="round"/>
    <rect x="276" y="238" width="216" height="28" rx="14" fill="#a9c8c2"/>
    <rect x="300" y="284" width="168" height="18" rx="9" fill="#d6bd7c"/>`,
  meeting: `
    <rect x="212" y="154" width="344" height="170" rx="30" fill="#dfe4ed" stroke="#5d5048" stroke-width="12"/>
    <rect x="264" y="228" width="240" height="32" rx="14" fill="#bca08c"/>
    <circle cx="314" cy="196" r="26" fill="#f4cf73" stroke="#5d5048" stroke-width="9"/>
    <path d="M450 190q42 24 0 74 70-8 72-70z" fill="#b7bdd5" stroke="#5d5048" stroke-width="9"/>`,
  door: `
    <rect x="268" y="76" width="232" height="306" rx="18" fill="#c9a17f" stroke="#5d5048" stroke-width="12"/>
    <rect x="312" y="116" width="90" height="214" rx="8" fill="#e0bd91" stroke="#8c6b5b" stroke-width="8"/>
    <circle cx="456" cy="228" r="14" fill="#f4cf73" stroke="#5d5048" stroke-width="8"/>
    <path d="M504 118q52 72 0 194" fill="none" stroke="#9b9298" stroke-width="12" stroke-linecap="round"/>`,
  newspaper: `
    <rect x="206" y="112" width="356" height="224" rx="22" fill="#f7f1e6" stroke="#5d5048" stroke-width="12"/>
    <rect x="246" y="154" width="126" height="126" rx="16" fill="#a8c4ad" stroke="#5d5048" stroke-width="8"/>
    <rect x="400" y="158" width="108" height="18" rx="9" fill="#9b9298"/>
    <rect x="400" y="206" width="92" height="18" rx="9" fill="#c98b83"/>
    <rect x="400" y="254" width="118" height="18" rx="9" fill="#d6bd7c"/>`,
  medal: `
    <path d="M330 88h108l-28 100h-52z" fill="#d58b87" stroke="#5d5048" stroke-width="10" stroke-linejoin="round"/>
    <circle cx="384" cy="252" r="92" fill="#f4cf73" stroke="#5d5048" stroke-width="12"/>
    <path d="M384 188l20 42 46 6-34 32 8 46-40-22-40 22 8-46-34-32 46-6z" fill="#fff4bf" stroke="#5d5048" stroke-width="8" stroke-linejoin="round"/>`,
  gift: `
    <rect x="238" y="178" width="292" height="168" rx="22" fill="#f3d0d6" stroke="#5d5048" stroke-width="12"/>
    <rect x="364" y="178" width="40" height="168" fill="#d58b87" stroke="#5d5048" stroke-width="8"/>
    <rect x="214" y="142" width="340" height="62" rx="18" fill="#f7e2e2" stroke="#5d5048" stroke-width="12"/>
    <path d="M384 142q-72-58-104 0M384 142q72-58 104 0" fill="none" stroke="#5d5048" stroke-width="12" stroke-linecap="round"/>`,
  ticket: `
    <path d="M194 154h380v62q-36 0-36 32t36 32v62H194v-62q36 0 36-32t-36-32z" fill="#fff1c9" stroke="#5d5048" stroke-width="12" stroke-linejoin="round"/>
    <path d="M328 248h118M406 210l40 38-40 38" fill="none" stroke="#8fb8a2" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M286 172v152" stroke="#d6bd7c" stroke-width="10" stroke-dasharray="14 16"/>`,
  iceCream: `
    <path d="M300 116q84-68 168 0 20 104-84 220-104-116-84-220z" fill="#f7dd9c" stroke="#5d5048" stroke-width="12" stroke-linejoin="round"/>
    <path d="M336 144q48-34 96 0" fill="none" stroke="#c98b83" stroke-width="14" stroke-linecap="round"/>
    <rect x="366" y="286" width="36" height="92" rx="14" fill="#c9a17f" stroke="#5d5048" stroke-width="10"/>
    <circle cx="330" cy="206" r="14" fill="#8fb8a2"/><circle cx="436" cy="206" r="14" fill="#8fb8a2"/>`,
  phoneComments: `
    <rect x="274" y="72" width="220" height="310" rx="34" fill="#e9e8f2" stroke="#5d5048" stroke-width="12"/>
    <rect x="306" y="118" width="156" height="210" rx="20" fill="#fff8ea"/>
    <rect x="326" y="150" width="94" height="20" rx="10" fill="#8fb8a2"/>
    <rect x="326" y="204" width="116" height="20" rx="10" fill="#d58b87"/>
    <rect x="326" y="258" width="74" height="20" rx="10" fill="#d6bd7c"/>
    <path d="M472 146l58-38M472 250l62 36" stroke="#bf4d49" stroke-width="12" stroke-linecap="round"/>`,
}

const events = [
  ['team-message', 'chat'],
  ['late-feedback', 'document'],
  ['operator-hidden-charge', 'phoneBill'],
  ['this-is-good-meme', 'meme'],
  ['elevator-plan-in-fandou-garden', 'elevator'],
  ['armor-hole-trivia', 'armor'],
  ['friend-last-minute-cancel', 'calendar'],
  ['work-credit-taken', 'folder'],
  ['interview-vague-rejection', 'resume'],
  ['family-caring-denial', 'tea'],
  ['group-joke-belittle', 'mask'],
  ['opaque-rule-extra-work', 'form'],
  ['need-expression-silence', 'muteBubble'],
  ['tissue-from-stranger', 'tissue'],
  ['translucent-meeting-room', 'meeting'],
  ['gossip-door-jumpscare', 'door'],
  ['genius-teacher-in-news', 'newspaper'],
  ['old-praise-still-counts', 'medal'],
  ['ex-sent-that-gift', 'gift'],
  ['come-again-next-time', 'ticket'],
  ['ice-cream-truce', 'iceCream'],
  ['comments-rewrite-fatigue', 'phoneComments'],
]

for (const [id, motif] of events) {
  writeFileSync(join(outDir, `${id}.svg`), buildSvg(motif))
}

function buildSvg(motif) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 432" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7eee4"/>
      <stop offset="0.62" stop-color="#eadfda"/>
      <stop offset="1" stop-color="#d8d1da"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="8" flood-color="#6b5360" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="768" height="432" rx="42" fill="url(#bg)"/>
  <g opacity="0.18">
    <rect x="64" y="56" width="24" height="24" rx="5" fill="#fff"/>
    <rect x="680" y="68" width="18" height="18" rx="4" fill="#fff"/>
    <rect x="118" y="338" width="18" height="18" rx="4" fill="#fff"/>
    <rect x="612" y="326" width="26" height="26" rx="6" fill="#fff"/>
  </g>
  <g filter="url(#shadow)">
    ${motifs[motif] ?? motifs.chat}
  </g>
</svg>`
}
