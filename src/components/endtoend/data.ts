// Content for the "End to end" section. Every claim here is checkable
// through the linked repo, store page, or paper — keep it that way.

export interface Link {
  label: string;
  url: string;
}

export interface Work {
  name: string;
  tag: string;
  summary: string;
  links: Link[];
}

export interface Stage {
  id: "research" | "standard" | "product";
  step: string;
  name: string;
  org: string;
  period: string;
  role: string;
  title: string;
  paras: string[];
  works: Work[];
  links: Link[];
}

export const INTRO = {
  eyebrow: "End to end",
  title: "From open-source research, to a standard, to an app at sea.",
  body: "Built in the open at every step: research released as open source, an open maritime standard implemented in code, and that standard shipped as an app people hold in their hands.",
};

export const STAGES: Stage[] = [
  {
    id: "research",
    step: "01",
    name: "Research",
    org: "KRISO",
    period: "2016 – 2019",
    role: "Postdoc researcher",
    title: "Research, released as open source",
    paras: [
      "At KRISO I started Virtuality for Safety, an open research group on VR/AR and safety, working with KAIST, Xi'an Jiaotong-Liverpool University, and Handong Global University. The software behind both of our IEEE ISMAR full papers is public, so anyone can rerun the studies.",
    ],
    works: [
      {
        name: "Safety in augmented reality",
        tag: "IEEE ISMAR 2018 · full paper · first author",
        summary: "How deeper immersion in AR costs awareness of the hazards around you. The test bed is open source: a 3D traffic simulation with city generation, IDM-driven vehicles, and reproducible scenarios.",
        links: [
          { label: "Paper", url: "https://ieeexplore.ieee.org/document/8613752" },
          { label: "RoadTrafficSimulation3D", url: "https://github.com/VirtualityForSafety/RoadTrafficSimulation3D" },
          { label: "Video", url: "https://youtu.be/3yKQtVem9bc" },
        ],
      },
      {
        name: "Visual instructions in VR",
        tag: "IEEE ISMAR 2019 · full paper · corresponding author",
        summary: "Annotation vs. virtual tutor for teaching procedures in immersive VR. Built Tasc, a task-script engine for procedural training, and released it with the three study tasks and the tutor's text-to-speech plugin.",
        links: [
          { label: "Paper", url: "https://ieeexplore.ieee.org/document/8943763" },
          { label: "Tasc-Unity", url: "https://github.com/VirtualityForSafety/Tasc-Unity" },
          { label: "Tasc docs", url: "https://tasc.readthedocs.io/" },
          { label: "UnityWindowsTTS", url: "https://github.com/VirtualityForSafety/UnityWindowsTTS" },
          { label: "Video", url: "https://youtu.be/MYfZyRPoJco" },
        ],
      },
    ],
    links: [
      { label: "github.com/VirtualityForSafety", url: "https://github.com/VirtualityForSafety" },
    ],
  },
  {
    id: "standard",
    step: "02",
    name: "Standard",
    org: "DMC",
    period: "2019 – 2025",
    role: "Senior SW developer",
    title: "A standard is built by organizations that never meet.",
    paras: [
      "The Maritime Connectivity Platform is an open standard — identity (MIR), service discovery (MSR), messaging (MMS) — built and run by maritime authorities, research institutes, and companies across several countries. No single organization owns the whole of it, and work quietly falls into the space between them.",
      "That space is where I spent six years at DMC, working across the whole stack: Java and Spring in the registries, Go for the MMTP agent, TypeScript and Angular for the interfaces people actually touch. Knowing all of it is what let me see which piece was missing, and make the case for building it.",
      "Two pieces belonged to no one. MCP was open source but usable only by someone willing to read the source, so I started docs.maritimeconnectivity.net and had it publish itself through GitHub Actions and Read the Docs. And MIR and MSR kept gaining capability that member organizations could not reach, because the portal in front of them assumed a single super-admin — so I rebuilt it around organizations, with SECOM-standard service search including geographic search, ledger-backed global search, and config for distributed MIR / MSR.",
    ],
    works: [],
    links: [
      { label: "MIR", url: "https://github.com/maritimeconnectivity/IdentityRegistry" },
      { label: "MSR", url: "https://github.com/maritimeconnectivity/ServiceRegistry" },
      { label: "MMS agent", url: "https://github.com/maritimeconnectivity/mms-agent-go" },
      { label: "docs.maritimeconnectivity.net", url: "https://docs.maritimeconnectivity.net/" },
      { label: "Management Portal — 311 of 349 commits", url: "https://github.com/maritimeconnectivity/management-portal-clr" },
      { label: "Portal demo", url: "https://management.maritimeconnectivity.net" },
      { label: "Paper: global service search over decentralized MSR (2022)", url: "https://www.glonav.org/journal/view.php?number=3362" },
    ],
  },
  {
    id: "product",
    step: "03",
    name: "Product",
    org: "AIVeNautics",
    period: "2025 – present",
    role: "Technical director",
    title: "MCP was a standard. Now it's an app.",
    paras: [
      "Ch@tSea runs all three MCP components in one app: an MCP certificate on the phone proves who you are, services found through MSR are drawn as polygons on the map with their S-100 data behind them, and messages travel end-to-end encrypted over MMS. Per our launch post, it is the first commercial application to do so.",
      "Before it, MCP's one live deployment covered identity and service discovery for contracted companies only. Turning the rest into a product meant deciding what a navigator never needs to see — and that call is only safe to make if you built the layers underneath yourself.",
      "On the App Store since January 2026, version 2.2.1 as of September 2026.",
    ],
    works: [],
    links: [
      { label: "Ch@tSea on the App Store", url: "https://apps.apple.com/us/app/chatsea/id6745332004" },
      { label: "chatsea.net", url: "https://chatsea.net/" },
      { label: "Launch post — MCP Was a Standard. Now It's an App.", url: "https://medium.com/aivenautics/mcp-was-a-standard-now-its-an-app-dbd559eb7f46" },
    ],
  },
];

// Short, verifiable one-liners for the footer ticker.
export const PROOF_TICKER: { name: string; msg: string }[] = [
  { name: "IEEE ISMAR",  msg: "full papers in 2018 and 2019, code released" },
  { name: "Tasc",        msg: "open-source task-script engine for VR training" },
  { name: "MCP docs",    msg: "docs.maritimeconnectivity.net, live since 2020" },
  { name: "Portal",      msg: "rebuilt around organizations, 311 commits" },
  { name: "Ch@tSea",     msg: "MIR, MSR, and MMS in one commercial app" },
  { name: "App Store",   msg: "Ch@tSea live since Jan 2026, v2.2.1" },
];
