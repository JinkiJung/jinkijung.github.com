// src/resources/data.js

export const icons = {
  Java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  Spring: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
  Docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  JavaScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  PostgreSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  Go: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
  React: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  TypeScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  AngularJS: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
  Markdown: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg',
  Unity: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg',
  CSharp: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
  Electron: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg',
  C: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
  'C++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  OpenCV: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',
  CMake: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cmake/cmake-original.svg',
  Swift: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg'
};

const commonData = {
  icons: icons
};

export const i18nData = {
  en: {
    playData: {
      title: 'A random fun fact about Jinki',
      subtitle: 'Click anywhere to draw',
      funFacts: [
        { id: 1, text: "I lived in Denmark for about 6 years and worked with great colleagues.", image: "https://placehold.co/1920x1080/2E8B57/FFFFFF?text=Denmark", rarity: 'common' },
        { id: 2, text: "My favorite season is autumn.", image: "https://placehold.co/1920x1080/D2691E/FFFFFF?text=Autumn", rarity: 'common' },
        { id: 3, text: "My favorite music genre while coding is Lo-fi hip hop.", image: "https://placehold.co/1920x1080/4682B4/FFFFFF?text=Lo-fi", rarity: 'common' },
        { id: 4, text: "My MBTI is INTJ.", image: "https://placehold.co/1920x1080/6A5ACD/FFFFFF?text=INTJ", rarity: 'common' },
        { id: 5, text: "The longest I've ever coded at one time is 14 hours.", image: "https://placehold.co/1920x1080/36454F/FFFFFF?text=Coding", rarity: 'common' },
        { id: 6, text: "My most confident programming language is TypeScript.", image: "https://placehold.co/1920x1080/007ACC/FFFFFF?text=TypeScript", rarity: 'common' },
        { id: 7, text: "I prefer dogs over cats.", image: "https://placehold.co/1920x1080/DEB887/FFFFFF?text=Dog", rarity: 'common' },
        { id: 8, text: "The last book I read was 'Clean Architecture'.", image: "https://placehold.co/1920x1080/8B4513/FFFFFF?text=Book", rarity: 'common' },
        { id: 9, text: "I use a mechanical keyboard with silent red switches.", image: "https://placehold.co/1920x1080/2F4F4F/FFFFFF?text=Keyboard", rarity: 'common' },
        { id: 10, text: "My favorite summer food is Naengmyeon (cold noodles).", image: "https://placehold.co/1920x1080/778899/FFFFFF?text=Food", rarity: 'common' },
        { id: 11, text: "My favorite film director is Christopher Nolan.", image: "https://placehold.co/1920x1080/191970/FFFFFF?text=Movie", rarity: 'common' },
        { id: 12, text: "I only use dark mode for my IDE.", image: "https://placehold.co/1920x1080/000000/FFFFFF?text=Dark+Mode", rarity: 'common' },
        { id: 13, text: "My childhood dream was to be a scientist.", image: "https://placehold.co/1920x1080/483D8B/FFFFFF?text=Dream", rarity: 'common' },
        { id: 14, text: "I like mint chocolate.", image: "https://placehold.co/1920x1080/98FF98/000000?text=Mint+Choco", rarity: 'common' },
        { id: 15, text: "I have experience building a 3D rendering engine from scratch with C++ during my undergraduate studies.", image: "https://placehold.co/1920x1080/00008B/FFFFFF?text=3D+Engine", rarity: 'rare' },
        { id: 16, text: "I have contributed code to open-source projects more than 5 times.", image: "https://placehold.co/1920x1080/B22222/FFFFFF?text=Open+Source", rarity: 'rare' },
        { id: 17, text: "I have tried bungee jumping.", image: "https://placehold.co/1920x1080/87CEEB/FFFFFF?text=Bungee", rarity: 'rare' },
        { id: 18, text: "I have achieved 1000 downloads on the App Store with an application I made myself.", image: "https://placehold.co/1920x1080/FFD700/000000?text=App+Store", rarity: 'super_rare' },
        { id: 19, text: "I have won an award in an algorithm competition.", image: "https://placehold.co/1920x1080/C0C0C0/000000?text=Award", rarity: 'super_rare' },
        { id: 20, text: "Actually, I designed the background graphic effects on this page myself.", image: "https://placehold.co/1920x1080/DA70D6/FFFFFF?text=Secret", rarity: 'super_rare' }
      ]
    },
    homePageData: {
      onePager: {
        title: "About Jinki Jung",
        headline: "Beyond the boundaries of technology, a developer who solves the essence of problems",
        bio: "Hello, I'm Jinki Jung. I'm a developer with 'End-to-End capabilities' who isn't confined to specific technologies to solve problems, and can take responsibility for the entire product lifecycle from front-end to deployment/operation. In my previous career chapter, I contributed to the standardization and implementation of open-source projects (Maritime Connectivity Platform), and currently, I'm focusing on the actual productization and realization of open-source.",
        competencies: [
          { title: "Affiliation", text: "Technical director at AIVeNautics" },
          { title: "Current location", text: "Daejeon, South Korea" },
          { title: "Also known as", text: "Open-source contributor, Augmented Reality researcher, Blogger" }
        ]
      },
      questionGrid: {
        initialTitle: "Sea of Questions",
        initialSubtitle: "Move your mouse to explore clues to the answers.",
        foundTitle: "You've found it!",
        foundSubtitle: "Some questions hold value simply by being asked."
      },
      spectrum: {
        title: "Jinki Jung",
        subtitle: "A spectrum of skills, centered on a diamond core.",
        scrollText: "Scroll down for more"
      }
    },
    portfolioData: {
      pageHeader: {
        title: 'Developer Career',
        links: [
            { name: 'GitHub', url: 'https://github.com/jinkijung' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/jinkijung/' }
        ],
        description: 'A showcase of my professional journey, highlighting key projects in maritime digitalization, data-driven AI solutions, and immersive technologies. This page chronicles my hands-on experience in building and deploying robust, open-source systems from concept to production.'
      },
      sections: [
        {
          chapter: 'Chapter 1: Maritime Digitalization',
          title: 'Leading Maritime Digital Transformation',
          description: "During my tenure at DMC, I was a core developer on open-source projects centered around the Maritime Connectivity Platform. I took charge of the entire process of turning ideas into operational open-source systems, from PKI/OIDC-based authentication and service discovery to real-time messaging protocols and admin portals.",
          projects: [
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MIR',
              title: 'MCP Identity Registry (MIR) development',
              description: 'A distributed PKI/OIDC-based authentication system for maritime organizations.',
              contribution: 'Maintained source code, deployed and operated based on HSM',
              tech: ['Java', 'Spring', 'Docker'],
              links: [{ name: 'GitHub', url: 'https://github.com/MaritimeCloud/IdentityRegistry' }]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MSR',
              title: 'MCP Service Registry (MSR) development',
              description: 'A service discovery platform for maritime and vessel-related technical services.',
              contribution: 'Maintained source code, testing',
              tech: ['Java', 'Spring', 'JavaScript', 'PostgreSQL'],
              links: [{ name: 'GitHub', url: 'https://github.com/MaritimeCloud/ServiceRegistry' }]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MMS',
              title: 'Maritime Messaging Service (MMS) development',
              description: 'MMTP protocol for real-time maritime messaging and a React-based web interface for demonstration.',
              contribution: 'Worked on standard documents, implemented MMS Agent, testing',
              tech: ['Go', 'React', 'TypeScript'],
              links: [
                { name: 'GitHub (Front-end)', url: 'https://github.com/mc-mms/mms-frontend' },
                { name: 'GitHub (Agent)', url: 'https://github.com/mc-mms/mms-agent' },
                { name: 'Live Demo', url: 'http://mms.openbridge.no/' }
              ]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Portal',
              title: 'MCP Management Portal development',
              description: 'Led front-end development and automated deployment for the MCP resource management admin portal.',
              contribution: 'Lead Developer, GitHub Actions deployment',
              tech: ['TypeScript', 'AngularJS'],
              links: [
                { name: 'GitHub', url: 'https://github.com/MaritimeCloud/ManagementPortal' },
                { name: 'Web Page', url: 'https://maritimecloud.github.io/ManagementPortal/' }
              ]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Docs',
              title: 'MCP online documentation',
              description: 'An online technical documentation page for MCP components.',
              contribution: 'Lead Developer, GitHub Actions and Readthedocs deployment',
              tech: ['Markdown'],
              links: [
                { name: 'GitHub', url: 'https://github.com/MaritimeCloud/docs.maritimecloud.net' },
                { name: 'Web Page', url: 'https://docs.maritimecloud.net/' }
              ]
            },
             {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MRR',
              title: 'Maritime Resource Registry (MRR) development',
              description: 'A maritime resource discovery service using MRN and versioning.',
              contribution: 'Interface development',
              tech: ['TypeScript', 'React'],
              links: [
                { name: 'GitHub', url: 'https://github.com/mc-mms/mrr-frontend' },
                { name: 'Web Page', url: 'https://maritimecloud.github.io/MRR-frontend/' }
              ]
            }
          ]
        },
        {
          chapter: 'Chapter 2: Data & AI',
          title: 'Driving Efficiency with Data',
          description: "Data is key to making better decisions. I've undertaken projects to maximize the efficiency of data collection and processing pipelines, from developing annotation tools for machine learning datasets to creating semi-automated annotation services linked with ML servers.",
          projects: [
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MOAD',
              title: 'Annotation tool development for MOAD project',
              description: 'Built a maritime dataset by adding Super-pixel based annotation features to the open-source VoTT.',
              contribution: 'Lead developer',
              tech: ['TypeScript', 'React', 'Electron'],
              links: [
                { name: 'GitHub', url: 'https://github.com/jinkijung/vott' },
                { name: 'Public Dataset', url: 'https://moad.kr/' }
              ]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Annotation',
              title: 'Semi-automatic annotation service',
              description: 'An efficient semi-automatic annotation service that works with an ML server to recognize objects with minimal user input.',
              contribution: 'Lead front-end developer, Lead back-end developer',
              tech: ['TypeScript', 'React', 'Electron', 'Java', 'Spring'],
              links: [
                { name: 'GitHub (Front-end)', url: 'https://github.com/jinkijung/iil-annotation-frontend' },
                { name: 'GitHub (Back-end)', url: 'https://github.com/jinkijung/iil-annotation-backend' }
              ]
            }
          ]
        },
        {
          chapter: 'Chapter 3: Immersive Tech & Research',
          title: 'Exploring the Boundary Between Reality and Virtuality',
          description: "My developer career began with research connecting the real and virtual worlds. At KAIST, I optimized the performance of a real-time AR engine, and at KRISO, I developed 'Tasc,' a script engine for easily implementing virtual training scenarios. These experiences form a solid foundation for my understanding of complex systems and my exploration of new technologies.",
          projects: [
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Tasc',
              title: 'Virtual Training applications and script engine (Tasc)',
              description: 'Developed the \'Tasc\' script engine for virtual training scenarios on the Unity engine, along with three training application examples.',
              contribution: 'Lead developer',
              tech: ['Unity', 'CSharp'],
              links: [
                { name: 'Paper', url: 'https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE09325988' },
                { name: 'GitHub (Engine)', url: 'https://github.com/jinkijung/Tasc' },
                { name: 'GitHub (Example: Crane)', url: 'https://github.com/jinkijung/Tasc-example-crane' },
                { name: 'GitHub (Example: Maze)', url: 'https://github.com/jinkijung/Tasc-example-maze' },
                { name: 'GitHub (Example: Stretching)', url: 'https://github.com/jinkijung/Tasc-example-stretching' }
              ]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=VR/AR+Safety',
              title: 'VR/AR for safety',
              description: 'Researched and developed a visual safety alert system for AR users using a simulated VR environment and deep learning.',
              contribution: 'Lead researcher, Lead Unity developer',
              tech: ['Unity', 'CSharp'],
              links: [
                { name: 'Paper', url: 'https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE07590815' },
                { name: 'GitHub', url: 'https://github.com/jinkijung/Context-aware-AR' }
              ]
            },
            {
                image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Mobile+AR',
                title: 'Efficient mobile AR platform with real-time tracking',
                description: 'Integrated and optimized a mobile AR platform engine based on real-time 6-DOF feature point tracking at a KAIST lab.',
                contribution: 'AR engine integration, performance optimization',
                tech: ['C++', 'OpenCV'],
                links: [
                  { name: 'Paper 1', url: 'https://dl.acm.org/doi/abs/10.1145/2497947.2497968' },
                  { name: 'Paper 2', url: 'https://dl.acm.org/doi/abs/10.1145/2407736.2407759' }
                ]
              }
          ]
        },
        {
          chapter: 'Chapter 4: Personal Works',
          title: 'The Joy of Turning Ideas into Reality',
          description: "The greatest joy as a developer is planning, designing, and coding ideas from my head into existence. These projects started from my curiosity and are valuable outcomes that allowed me to grow by experiencing every stage of product development, from front-end to deployment.",
          projects: [
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=iil',
              title: 'iil',
              description: "A high-level script 'iil' for expressing work and its outcomes, a spin-off of the previous project 'Tasc'.",
              contribution: 'Founder, lead developer',
              tech: ['Markdown'],
              links: [{ name: 'Web Page', url: 'https://jinkijung.github.io/iil/' }]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=iil-todo',
              title: 'iil-todo',
              description: "'iil' 스크립트 기반의 할 일 목록 애플리케이션으로, 풀스택으로 직접 개발하고 있습니다.",
              contribution: 'Lead developer',
              tech: ['Java', 'Spring', 'React', 'TypeScript', 'PostgreSQL'],
              links: [{ name: 'GitHub', url: 'https://github.com/jinkijung/iil-todo' }]
            }
          ]
        }
      ],
      ...commonData
    },
    researchData: {
      pageHeader: {
        title: 'Research Career',
        links: [
            { name: 'Google Scholar', url: 'https://scholar.google.com/citations?user=...YOUR_ID...' },
            { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org/author/YOUR_NAME/...' }
        ],
        description: 'An overview of my academic research focused on making immersive technologies more realistic, useful, and safe. This page details my work on skill-transfer in VR, authoring tools for AR, and balancing immersion with situational awareness.'
      },
      sections: [
        {
          chapter: '1. Virtual Training That Transfers',
          title: 'Virtual Training That Transfers',
          description: 'I design VR simulators that prove their value in the real world. By measuring skill-transfer on tasks such as lifeboat launching, my work turns “VR looks cool” into “VR saves lives and money.”',
          videoId: 'fDDUtc3cxls'
        },
        {
          chapter: '2. Authoring Tools for Everyone',
          title: 'Authoring Tools for Everyone',
          description: 'I build interaction techniques that let anyone craft 3-D AR content on a phone or tablet. Multi-touch editing and real-time feedback turn non-experts into creators, widening the AR ecosystem.',
          videoId: 'LqB7HlW707o'
        },
        {
          chapter: '3. Balancing Immersion with Safety',
          title: 'Balancing Immersion with Safety',
          description: 'Head-worn AR can blind us to real-world hazards. I quantify that trade-off and propose design principles that keep users situationally aware without breaking their sense of presence.',
          videoId: '3yKQtVem9bc'
        }
      ],
      closing: 'Together, these threads form a single narrative: making virtual experiences believable, accessible, and responsible. That perspective now guides my transition from lab to industry—as a developer who still thinks like a scientist.'
    },
    writeData: {
      pageHeader: {
        title: 'Writing Portfolio',
        links: [
            { name: 'Medium', url: 'https://medium.com/@YOUR_USERNAME' },
            { name: 'Blog', url: 'https://...YOUR_BLOG...' }
        ],
        description: 'A collection of my technical writings, including documentation, blog posts, and articles. This portfolio showcases my ability to communicate complex technical concepts clearly and effectively to diverse audiences.'
      },
      sections: [
        // Add your writing sections here
      ]
    }
  },
  ko: {
    playData: {
      title: '정진기에 대한 랜덤한 사실',
      subtitle: '아무 곳이나 클릭하여 뽑아보세요',
      funFacts: [
        { id: 1, text: "덴마크에서 6년 정도 산 적이 있으며, 좋은 동료들과 일했었습니다.", image: "https://placehold.co/1920x1080/2E8B57/FFFFFF?text=Denmark", rarity: 'common' },
        { id: 2, text: "가장 좋아하는 계절은 가을입니다.", image: "https://placehold.co/1920x1080/D2691E/FFFFFF?text=Autumn", rarity: 'common' },
        { id: 3, text: "코딩할 때 가장 좋아하는 음악 장르는 Lo-fi hip hop입니다.", image: "https://placehold.co/1920x1080/4682B4/FFFFFF?text=Lo-fi", rarity: 'common' },
        { id: 4, text: "MBTI는 INTJ입니다.", image: "https://placehold.co/1920x1080/6A5ACD/FFFFFF?text=INTJ", rarity: 'common' },
        { id: 5, text: "한 번에 가장 오래 코딩해 본 시간은 14시간입니다.", image: "https://placehold.co/1920x1080/36454F/FFFFFF?text=Coding", rarity: 'common' },
        { id: 6, text: "가장 자신 있는 프로그래밍 언어는 TypeScript입니다.", image: "https://placehold.co/1920x1080/007ACC/FFFFFF?text=TypeScript", rarity: 'common' },
        { id: 7, text: "고양이보다 강아지를 더 좋아합니다.", image: "https://placehold.co/1920x1080/DEB887/FFFFFF?text=Dog", rarity: 'common' },
        { id: 8, text: "가장 최근에 읽은 책은 '클린 아키텍처'입니다.", image: "https://placehold.co/1920x1080/8B4513/FFFFFF?text=Book", rarity: 'common' },
        { id: 9, text: "키보드는 기계식 저소음 적축을 사용합니다.", image: "https://placehold.co/1920x1080/2F4F4F/FFFFFF?text=Keyboard", rarity: 'common' },
        { id: 10, text: "여름에 가장 좋아하는 음식은 냉면입니다.", image: "https://placehold.co/1920x1080/778899/FFFFFF?text=Food", rarity: 'common' },
        { id: 11, text: "가장 좋아하는 영화 감독은 크리스토퍼 놀란입니다.", image: "https://placehold.co/1920x1080/191970/FFFFFF?text=Movie", rarity: 'common' },
        { id: 12, text: "IDE는 다크 모드만 사용합니다.", image: "https://placehold.co/1920x1080/000000/FFFFFF?text=Dark+Mode", rarity: 'common' },
        { id: 13, text: "어렸을 때 꿈은 과학자였습니다.", image: "https://placehold.co/1920x1080/483D8B/FFFFFF?text=Dream", rarity: 'common' },
        { id: 14, text: "민트초코를 좋아합니다.", image: "https://placehold.co/1920x1080/98FF98/000000?text=Mint+Choco", rarity: 'common' },
        { id: 15, text: "학부 시절, C++로 직접 3D 렌더링 엔진을 만든 경험이 있습니다.", image: "https://placehold.co/1920x1080/00008B/FFFFFF?text=3D+Engine", rarity: 'rare' },
        { id: 16, text: "오픈소스 프로젝트에 5번 이상 코드를 기여했습니다.", image: "https://placehold.co/1920x1080/B22222/FFFFFF?text=Open+Source", rarity: 'rare' },
        { id: 17, text: "번지점프를 해 본 적이 있습니다.", image: "https://placehold.co/1920x1080/87CEEB/FFFFFF?text=Bungee", rarity: 'rare' },
        { id: 18, text: "직접 만든 애플리케이션으로 앱스토어에 출시하여 1000 다운로드를 달성한 적이 있습니다.", image: "https://placehold.co/1920x1080/FFD700/000000?text=App+Store", rarity: 'super_rare' },
        { id: 19, text: "알고리즘 대회에서 입상한 경력이 있습니다.", image: "https://placehold.co/1920x1080/C0C0C0/000000?text=Award", rarity: 'super_rare' },
        { id: 20, text: "사실 이 페이지의 배경 그래픽 효과는 제가 직접 디자인했습니다.", image: "https://placehold.co/1920x1080/DA70D6/FFFFFF?text=Secret", rarity: 'super_rare' }
      ]
    },
    homePageData: {
      onePager: {
        title: "정진기 소개",
        headline: "기술의 경계를 넘어, <br />문제의 본질을 해결하는 개발자",
        bio: "안녕하세요, 정진기입니다. 저는 문제를 해결하기 위해 특정 기술에 얽매이지 않고, 프론트엔드부터 배포/운영까지 제품의 전체 생명주기를 책임질 수 있는 '엔드투엔드(End-to-End) 역량'을 가진 개발자입니다. 이 전의 커리어 챕터에서는 오픈소스 프로젝트(Maritime Connectivity Platform)의 표준화 및 구현에 기여를 했고, 현재는 오픈소스의 실제 제품화 및 현실화에 집중하고 있습니다.",
        competencies: [
          { title: "소속", text: "AIVeNautics 기술 이사" },
          { title: "현재 위치", text: "대한민국 대전" },
          { title: "별명", text: "오픈소스 기여자, 증강현실 연구원, 블로거" }
        ]
      },
      questionGrid: {
        initialTitle: "질문의 바다",
        initialSubtitle: "마우스를 움직여 해답의 실마리를 탐색해보세요.",
        foundTitle: "찾았습니다!",
        foundSubtitle: "어떤 질문들은 그저 질문하는 것만으로도 가치가 있습니다."
      },
      spectrum: {
        title: "정진기",
        subtitle: "다이아몬드 코어를 중심으로 한 다양한 스펙트럼.",
        scrollText: "더 보려면 아래로 스크롤하세요."
      }
    },
    portfolioData: {
      pageHeader: {
        title: '개발자 경력',
        links: [
            { name: 'GitHub', url: 'https://github.com/jinkijung' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/jinkijung/' }
        ],
        description: '해양 디지털화, 데이터 기반 AI 솔루션, 몰입형 기술 분야의 주요 프로젝트를 중심으로 저의 전문적인 여정을 소개합니다. 이 페이지는 컨셉부터 운영까지 강력한 오픈소스 시스템을 구축하고 배포한 저의 실무 경험을 기록합니다.'
      },
      sections: [
        {
          chapter: '챕터 1: 해양 디지털화',
          title: '해양 디지털 전환을 이끌다',
          description: "DMC 재직 기간 동안 저는 Maritime Connectivity Platform을 중심으로 한 오픈소스 프로젝트의 핵심 개발자 중 하나로 참여했습니다. PKI/OIDC 기반 인증 시스템부터 서비스 검색, 실시간 메시징 프로토콜, 그리고 관리자 포털에 이르기까지, 아이디어를 실제 운영되는 오픈소스 시스템으로 구현하는 전 과정을 책임졌습니다.",
          projects: [
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MIR',
              title: 'MCP Identity Registry (MIR) 개발',
              description: '해양 조직을 위한 PKI/OIDC 기반 분산 인증 시스템입니다.',
              contribution: '소스코드 유지보수, HSM 기반 배포 및 운영',
              tech: ['Java', 'Spring', 'Docker'],
              links: [{ name: 'GitHub', url: 'https://github.com/MaritimeCloud/IdentityRegistry' }]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MSR',
              title: 'MCP Service Registry (MSR) 개발',
              description: '선박 및 해양 관련 기술 서비스를 위한 서비스 디스커버리 플랫폼입니다.',
              contribution: '소스코드 유지보수, 테스트',
              tech: ['Java', 'Spring', 'JavaScript', 'PostgreSQL'],
              links: [{ name: 'GitHub', url: 'https://github.com/MaritimeCloud/ServiceRegistry' }]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MMS',
              title: 'Maritime Messaging Service (MMS) 개발',
              description: '실시간 해양 메시지 전송을 위한 MMTP 프로토콜 및 React 기반 시연용 웹 인터페이스입니다.',
              contribution: '표준 문서 작업, MMS Agent 구현, 테스트',
              tech: ['Go', 'React', 'TypeScript'],
              links: [
                { name: 'GitHub (프론트엔드)', url: 'https://github.com/mc-mms/mms-frontend' },
                { name: 'GitHub (에이전트)', url: 'https://github.com/mc-mms/mms-agent' },
                { name: '라이브 데모', url: 'http://mms.openbridge.no/' }
              ]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Portal',
              title: 'MCP Management Portal 개발',
              description: 'MCP 자원 관리를 위한 어드민 포털의 프론트엔드 개발을 리드하고 배포를 자동화했습니다.',
              contribution: '리드 개발자, GitHub Actions 배포',
              tech: ['TypeScript', 'AngularJS'],
              links: [
                { name: 'GitHub', url: 'https://github.com/MaritimeCloud/ManagementPortal' },
                { name: '웹 페이지', url: 'https://maritimecloud.github.io/ManagementPortal/' }
              ]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Docs',
              title: 'MCP 온라인 문서',
              description: 'MCP 컴포넌트에 대한 온라인 기술 문서 페이지입니다.',
              contribution: '리드 개발자, GitHub Actions 및 Readthedocs 배포',
              tech: ['Markdown'],
              links: [
                { name: 'GitHub', url: 'https://github.com/MaritimeCloud/docs.maritimecloud.net' },
                { name: '웹 페이지', url: 'https://docs.maritimecloud.net/' }
              ]
            },
             {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MRR',
              title: 'Maritime Resource Registry (MRR) 개발',
              description: 'MRN과 버전을 사용한 해양 자원 디스커버리 서비스입니다.',
              contribution: '인터페이스 개발',
              tech: ['TypeScript', 'React'],
              links: [
                { name: 'GitHub', url: 'https://github.com/mc-mms/mrr-frontend' },
                { name: '웹 페이지', url: 'https://maritimecloud.github.io/MRR-frontend/' }
              ]
            }
          ]
        },
        {
          chapter: '챕터 2: 데이터 & AI',
          title: '데이터 기반의 효율성 혁신',
          description: "데이터는 더 나은 결정을 내리는 핵심입니다. 저는 머신러닝 모델의 학습 데이터셋 구축을 위한 어노테이션 툴 개발부터, ML 서버와 연동되는 반자동화 어노테이션 서비스까지, 데이터 수집 및 가공 파이프라인의 효율성을 극대화하는 프로젝트를 수행했습니다.",
          projects: [
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=MOAD',
              title: 'MOAD 프로젝트를 위한 어노테이션 툴 개발',
              description: '오픈소스인 VoTT에 Super-pixel 기반 어노테이션 기능을 추가하여 해양 데이터셋을 구축했습니다.',
              contribution: '리드 개발자',
              tech: ['TypeScript', 'React', 'Electron'],
              links: [
                { name: 'GitHub', url: 'https://github.com/jinkijung/vott' },
                { name: '공개 데이터셋', url: 'https://moad.kr/' }
              ]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Annotation',
              title: '반자동 어노테이션 서비스',
              description: 'ML 서버와 연동하여, 사용자가 최소한의 포인트만 찍으면 객체를 자동으로 인식하는 효율적인 반자동 어노테이션 서비스입니다.',
              contribution: '리드 프론트엔드 개발자, 리드 백엔드 개발자',
              tech: ['TypeScript', 'React', 'Electron', 'Java', 'Spring'],
              links: [
                { name: 'GitHub (프론트엔드)', url: 'https://github.com/jinkijung/iil-annotation-frontend' },
                { name: 'GitHub (백엔드)', url: 'https://github.com/jinkijung/iil-annotation-backend' }
              ]
            }
          ]
        },
        {
          chapter: '챕터 3: 몰입형 기술 & 연구',
          title: '현실과 가상의 경계를 탐구하다',
          description: "저의 개발자 커리어는 현실과 가상을 잇는 연구에서 시작되었습니다. KAIST에서 실시간 AR 엔진의 성능을 최적화했고, KRISO에서는 가상 훈련 시나리오를 쉽게 구현할 수 있는 스크립트 엔진 'Tasc'을 개발했습니다. 이 경험들은 복잡한 시스템의 근본 원리를 이해하고 새로운 기술을 탐구하는 저의 단단한 기반이 되었습니다.",
          projects: [
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Tasc',
              title: '가상 훈련 애플리케이션 및 스크립트 엔진 (Tasc)',
              description: "Unity 엔진 위에서 작동하는 가상 훈련 시나리오 스크립트 엔진 'Tasc'과 3종의 훈련 예제 애플리케이션을 개발했습니다.",
              contribution: '리드 개발자',
              tech: ['Unity', 'CSharp'],
              links: [
                { name: '논문', url: 'https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE09325988' },
                { name: 'GitHub (엔진)', url: 'https://github.com/jinkijung/Tasc' },
                { name: 'GitHub (예제: 크레인)', url: 'https://github.com/jinkijung/Tasc-example-crane' },
                { name: 'GitHub (예제: 미로)', url: 'https://github.com/jinkijung/Tasc-example-maze' },
                { name: 'GitHub (예제: 스트레칭)', url: 'https://github.com/jinkijung/Tasc-example-stretching' }
              ]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=VR/AR+Safety',
              title: '안전을 위한 VR/AR',
              description: 'AR 사용자의 안전을 위해 시뮬레이션된 VR 환경과 딥러닝을 활용한 시각적 안전 경보 시스템을 연구 및 개발했습니다.',
              contribution: '리드 연구원, 리드 Unity 개발자',
              tech: ['Unity', 'CSharp'],
              links: [
                { name: '논문', url: 'https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE07590815' },
                { name: 'GitHub', url: 'https://github.com/jinkijung/Context-aware-AR' }
              ]
            },
            {
                image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Mobile+AR',
                title: '실시간 추적을 통한 효율적인 모바일 AR 플랫폼',
                description: 'KAIST 연구실에서 실시간 6-DOF 특징점 추적 기반의 모바일 AR 플랫폼 엔진 통합 및 성능 최적화를 수행했습니다.',
                contribution: 'AR 엔진 통합, 성능 최적화',
                tech: ['C++', 'OpenCV'],
                links: [
                  { name: '논문 1', url: 'https://dl.acm.org/doi/abs/10.1145/2497947.2497968' },
                  { name: '논문 2', url: 'https://dl.acm.org/doi/abs/10.1145/2407736.2407759' }
                ]
              }
          ]
        },
        {
          chapter: '챕터 4: 개인 작업',
          title: '아이디어를 현실로 만드는 즐거움',
          description: "머릿속에 떠오른 아이디어를 직접 기획하고, 설계하며, 코드로 완성하는 과정은 개발자로서 가장 큰 즐거움입니다. 이 프로젝트들은 저의 호기심에서 출발했으며, 프론트엔드부터 배포까지 제품 개발의 모든 단계를 스스로 경험하며 성장할 수 있었던 소중한 결과물입니다.",
          projects: [
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=iil',
              title: 'iil',
              description: "업무와 그 결과물을 표현하기 위한 고수준 스크립트 'iil', 이전 프로젝트 'Tasc'의 스핀오프입니다.",
              contribution: '창립자, 리드 개발자',
              tech: ['Markdown'],
              links: [{ name: '웹 페이지', url: 'https://jinkijung.github.io/iil/' }]
            },
            {
              image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=iil-todo',
              title: 'iil-todo',
              description: "'iil' 스크립트 기반의 할 일 목록 애플리케이션으로, 풀스택으로 직접 개발하고 있습니다.",
              contribution: '리드 개발자',
              tech: ['Java', 'Spring', 'React', 'TypeScript', 'PostgreSQL'],
              links: [{ name: 'GitHub', url: 'https://github.com/jinkijung/iil-todo' }]
            }
          ]
        }
      ],
      ...commonData
    },
    researchData: {
      pageHeader: {
        title: '연구 경력',
        links: [
            { name: 'Google Scholar', url: 'https://scholar.google.com/citations?user=...YOUR_ID...' },
            { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org/author/YOUR_NAME/...' }
        ],
        description: '몰입형 기술을 더 현실적이고 유용하며 안전하게 만들기 위한 저의 학술 연구 개요입니다. 이 페이지는 VR에서의 기술 이전, AR을 위한 저작 도구, 몰입과 상황 인식의 균형에 대한 저의 작업을 자세히 설명합니다.'
      },
      sections: [
        {
          chapter: '1. 실용적인 가상 훈련',
          title: '실제 세계로 이어지는 가상 훈련',
          description: '저는 실제 세계에서 그 가치를 증명하는 VR 시뮬레이터를 설계합니다. 구명정 진수와 같은 작업에 대한 기술 이전 효과를 측정함으로써, 제 연구는 "VR은 멋져 보인다"에서 "VR은 생명과 비용을 절약한다"로 바꿉니다.',
          videoId: 'fDDUtc3cxls'
        },
        {
          chapter: '2. 모두를 위한 저작 도구',
          title: '모두를 위한 저작 도구',
          description: '저는 누구나 휴대폰이나 태블릿에서 3D AR 콘텐츠를 제작할 수 있는 상호작용 기술을 만듭니다. 멀티터치 편집과 실시간 피드백은 비전문가를 창작자로 만들어 AR 생태계를 넓힙니다.',
          videoId: 'LqB7HlW707o'
        },
        {
          chapter: '3. 몰입과 안전의 균형',
          title: '몰입과 안전의 균형',
          description: '머리에 쓰는 AR은 현실 세계의 위험에 눈을 멀게 할 수 있습니다. 저는 그 상충 관계를 정량화하고, 사용자의 현존감을 해치지 않으면서 상황 인지를 유지하는 디자인 원칙을 제안합니다.',
          videoId: '3yKQtVem9bc'
        }
      ],
      closing: '이러한 연구들은 가상 경험을 믿을 수 있고, 접근 가능하며, 책임감 있게 만든다는 하나의 이야기를 형성합니다. 그 관점은 이제 실험실에서 산업계로 전환하는 저를 안내합니다—여전히 과학자처럼 생각하는 개발자로서.'
    },
    writeData: {
      pageHeader: {
        title: '글쓰기 포트폴리오',
        links: [
            { name: '미디엄', url: 'https://medium.com/@YOUR_USERNAME' },
            { name: '블로그', url: 'https://...YOUR_BLOG...' }
        ],
        description: '기술 문서, 블로그 게시물, 기사를 포함한 저의 기술 글 모음입니다. 이 포트폴리오는 복잡한 기술 개념을 다양한 청중에게 명확하고 효과적으로 전달하는 저의 능력을 보여줍니다.'
      },
      sections: [
        // 여기에 글쓰기 섹션을 추가하세요.
      ]
    }
  }
};