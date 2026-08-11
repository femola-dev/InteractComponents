import avatar1 from '../assets/images/avatar-1.png'
import avatar2 from '../assets/images/avatar-2.png'
import avatar3 from '../assets/images/avatar-3.png'

export type TagName = 'AI' | 'Tech' | 'Design'

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; intro: string; items: string[] }

export type Section = {
  id: string
  label: string
  /** Lines this section occupies in the left-rail minimap (Figma "Frame 28"). */
  minimapLines: number
  blocks: Block[]
}

export const article = {
  title: 'The Historical Age of AI and Human Collaboration',
  byline: 'by John, Emily, and Ron.',
  published: 'Published 3 days',
  avatars: [
    { src: avatar1, alt: 'John' },
    { src: avatar2, alt: 'Emily' },
    { src: avatar3, alt: 'Ron' },
  ],
  tags: ['AI', 'Tech', 'Design'] as TagName[],
  summary: {
    kicker: 'AI Summary',
    lede: 'The article argues that AI’s real significance is collaborative, not substitutional — people and models are better together than either alone.',
    points: [
      {
        heading: 'Speed and scale, not replacement',
        body: 'AI handles volume — reviewing medical images, spotting patterns, completing repeatable work — while people keep judgment, empathy, and responsibility.',
      },
      {
        heading: 'Roles are reshaped, not removed',
        body: 'Designers explore concepts faster, writers organize research, analysts surface trends in minutes. The questions, fact-checks, and ethical calls stay human.',
      },
      {
        heading: 'Collaboration is a skill',
        body: 'Giving clear instructions, evaluating outputs critically, protecting sensitive data, and recognizing bias are now core competencies.',
      },
      {
        heading: 'Oversight where stakes are high',
        body: 'Hiring, finance, education, law, and healthcare need human review at every important stage, because models learn from imperfect human data.',
      },
    ],
    readingTime: '4 min read',
  },
  sections: [
    {
      id: 'introduction',
      label: 'Introduction',
      minimapLines: 5,
      blocks: [
        {
          kind: 'p',
          text: 'Artificial intelligence is no longer a distant idea from science fiction. It now helps people write, design, diagnose illnesses, analyze large datasets, manage supply chains, and solve everyday problems. Yet the most important story of AI is not about machines replacing humans. It is about humans learning to work alongside intelligent tools.',
        },
        {
          kind: 'p',
          text: 'AI excels at processing information quickly, identifying patterns, and completing repeatable tasks at scale. A healthcare system, for example, can use AI to review medical images and flag possible concerns for a doctor. The AI does not replace the doctor’s judgment, empathy, or responsibility. Instead, it helps the doctor focus attention where it may be needed most. This is the core of human-AI collaboration: technology handles speed and scale, while people provide context, values, creativity, and care.\nIn the workplace, this partnership is reshaping roles rather than simply eliminating them. Designers can use AI to explore early concepts, writers can use it to organize research, and analysts can use it to identify trends that would take hours to find manually. However, humans still need to ask the right questions, check facts, understand users, and make ethical decisions. AI can generate many possible answers, but it cannot independently decide what is fair, meaningful, or appropriate for a specific community.',
        },
        {
          kind: 'p',
          text: 'Collaboration with AI also requires new skills. People must learn how to give clear instructions, evaluate outputs critically, protect sensitive information, and recognize when AI may be wrong or biased. AI systems learn from human-created data, which can contain gaps and unfair assumptions. For this reason, responsible use requires human oversight at every important stage, especially in areas such as hiring, finance, education, law, and healthcare.\nThe future will belong to people who combine technical confidence with distinctly human strengths. Curiosity, communication, empathy, judgment, and imagination will become even more valuable as AI becomes more common. Rather than competing with AI in tasks it performs best, people can use it as a collaborative partner that expands their capacity to learn, create, and contribute.',
        },
      ],
    },
    {
      id: 'workplace',
      label: 'Collaboration in the Workplace',
      minimapLines: 14,
      blocks: [
        { kind: 'h2', text: 'Collaboration in the Workplace' },
        {
          kind: 'p',
          text: 'Human-AI collaboration is already transforming many professions. Rather than waiting for a future in which every workplace is fully automated, organizations are beginning to integrate AI into daily workflows.',
        },
        {
          kind: 'quote',
          text: '“The growth of AI makes lifelong learning increasingly important. Workers, students, and leaders will need opportunities to build both technical and human-centered skills.”',
        },
        {
          kind: 'p',
          text: 'A writer may use AI to generate an initial outline, summarize research, or suggest alternative wording. The writer must still verify facts, develop a clear point of view, protect confidential information, and ensure the final work reflects the intended audience and purpose.\nA product designer may use AI to explore interface ideas, draft user flows, generate placeholder content, or speed up early-stage research synthesis. However, successful product design still depends on speaking with users, identifying unmet needs, testing assumptions, considering accessibility, and making thoughtful trade-offs. AI can accelerate the process, but it cannot replace an understanding of real people and their experiences.',
        },
        {
          kind: 'list',
          intro: 'Responsible AI use includes several practical habits:',
          items: [
            'Clearly define the problem before asking AI for help.',
            'Provide relevant context while avoiding sensitive or confidential information.',
            'Treat AI output as a draft, recommendation, or starting point—not automatic truth.',
            'Verify factual statements, citations, calculations, legal guidance, and high-stakes recommendations.',
            'Check for bias, missing perspectives, or assumptions in the output.',
            'Be transparent when AI has significantly contributed to work that others will rely on.',
            'Keep a human decision-maker accountable for important final choices.',
          ],
        },
      ],
    },
  ] satisfies Section[] as Section[],
}
