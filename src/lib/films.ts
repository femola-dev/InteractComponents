/**
 * The library the Move carousel draws its decks from.
 *
 * Every field is TMDB's — artwork, synopsis, runtime, year — and `rating` is
 * their user score carried over to the design's five-point scale (79% → 4.0).
 * The design's own Spider-Man panel already matched their record verbatim, so
 * the rest is sourced the same way rather than invented.
 *
 * Posters are TMDB CDN URLs rather than bundled files. At w780 a poster is
 * ~120KB, and the carousel's window keeps five panels mounted at a time, so
 * only a handful is ever fetched — bundling all of these would have put ~30MB
 * in the repo to the same end. The trade is that artwork needs a network: with
 * none, a panel stays on its `bg-ink` fill and the copy still reads.
 *
 * `genres` is the menu's vocabulary, not TMDB's, since the tray is the design's
 * fixed list and TMDB has no row for two of them. Sci-Fi and Musical are
 * renames of their Science Fiction and Music; Sport is not a TMDB genre in any
 * form and is carried from a curated list of sports films. Genres TMDB lists
 * that the menu has no row for are dropped — the menu is the offer.
 */

export type Detail = {
  /** Panel heading. */
  title: string
  year: string
  runtime: string
  rating: string
  synopsis: string
}

export type Slide = {
  /** Top line of the control pill. */
  name: string
  /** Fills the panel edge to edge; the copy sits in its blurred lower third. */
  poster: string
  /** Menu rows this film belongs to. Decks are built by filtering on these. */
  genres: string[]
  detail: Detail
}

export const FILMS: Slide[] = [
  {
    name: 'Avatar Aang ―  The Last Airbender',
    poster: 'https://image.tmdb.org/t/p/w780/3sgnSfNT27Bx5O5ukr7B26mhEQq.jpg',
    genres: ['Action', 'Animation'],
    detail: {
      title: 'Avatar Aang: The Last Airbender',
      year: '2026',
      runtime: '1h 39m',
      rating: '4.7',
      synopsis:
        "Avatar Aang, the world's last Airbender, learns of an ancient power that could save his culture from extinction. With the help of his friends, he embarks on a global quest to find it before it falls into the wrong hands and threatens to upend the peace they sacrificed everything to achieve.",
    },
  },
  {
    name: 'Accidental Partners',
    poster: 'https://image.tmdb.org/t/p/w780/j0CIVzeR7hRAPBPGR54qDZoOQpp.jpg',
    genres: ['Comedy', 'Romance'],
    detail: {
      title: 'Accidental Partners',
      year: '2026',
      runtime: '1h 50m',
      rating: '4.5',
      synopsis:
        'Two women discover they were both scammed by the same man (who also got them pregnant). They form an alliance to take revenge.',
    },
  },
  {
    name: 'Swapped',
    poster: 'https://image.tmdb.org/t/p/w780/tHhxWxge06goXU6ZQH1hj7vK8Hd.jpg',
    genres: ['Animation'],
    detail: {
      title: 'Swapped',
      year: '2026',
      runtime: '1h 42m',
      rating: '4.5',
      synopsis:
        'A small woodland creature and a majestic bird, two natural sworn enemies of the Valley, magically trade places and set off on an adventure of a lifetime to switch back. Their journey soon uncovers a greater threat—one that could endanger not only their species, but the entire valley they call home.',
    },
  },
  {
    name: 'Michael',
    poster: 'https://image.tmdb.org/t/p/w780/zm0KAbOjlt9eR5y7vDiL2dEOwMl.jpg',
    genres: ['Musical'],
    detail: {
      title: 'Michael',
      year: '2026',
      runtime: '2h 8m',
      rating: '4.3',
      synopsis:
        'The story of Michael Jackson, one of the most influential artists the world has ever known, and his life beyond the music. His journey from the discovery of his extraordinary talent as the lead of the Jackson Five, to the visionary artist whose creative ambition fueled a relentless pursuit to become the biggest entertainer in the world, highlighting both his life off-stage and some of the most iconic performances from his early solo career.',
    },
  },
  {
    name: 'Project Hail Mary',
    poster: 'https://image.tmdb.org/t/p/w780/yihdXomYb5kTeSivtFndMy5iDmf.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'Project Hail Mary',
      year: '2026',
      runtime: '2h 37m',
      rating: '4.3',
      synopsis:
        'Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is or how he got there. As his memory returns, he begins to uncover his mission: solve the riddle of the mysterious substance causing the sun to die out. He must call on his scientific knowledge and unorthodox ideas to save everything on Earth from extinction.',
    },
  },
  {
    name: 'Young Hearts',
    poster: 'https://image.tmdb.org/t/p/w780/iGCtYxfuvXfy0BD5m6p7vKuPOxS.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Young Hearts',
      year: '2024',
      runtime: '1h 39m',
      rating: '4.3',
      synopsis:
        '14-year-old Elias increasingly feels like an outsider in his village. When he meets his new neighbour of the same age, Alexander, Elias is confronted with his burgeoning sexuality.',
    },
  },
  {
    name: 'Forrest Gump',
    poster: 'https://image.tmdb.org/t/p/w780/Cw4hIUIAmSYfK9QfaUW5igp9La.jpg',
    genres: ['Comedy', 'Romance'],
    detail: {
      title: 'Forrest Gump',
      year: '1994',
      runtime: '2h 22m',
      rating: '4.2',
      synopsis:
        'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.',
    },
  },
  {
    name: 'Interstellar',
    poster: 'https://image.tmdb.org/t/p/w780/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'Interstellar',
      year: '2014',
      runtime: '2h 49m',
      rating: '4.2',
      synopsis:
        'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    },
  },
  {
    name: 'Pulp Fiction',
    poster: 'https://image.tmdb.org/t/p/w780/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'Pulp Fiction',
      year: '1994',
      runtime: '2h 34m',
      rating: '4.2',
      synopsis:
        "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
    },
  },
  {
    name: 'The Dark Knight',
    poster: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    genres: ['Action'],
    detail: {
      title: 'The Dark Knight',
      year: '2008',
      runtime: '2h 32m',
      rating: '4.2',
      synopsis:
        'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    },
  },
  {
    name: 'The Lord of the Rings ―  The Return of the King',
    poster: 'https://image.tmdb.org/t/p/w780/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    genres: ['Action'],
    detail: {
      title: 'The Lord of the Rings: The Return of the King',
      year: '2003',
      runtime: '3h 21m',
      rating: '4.2',
      synopsis:
        'As armies mass for a final battle that will decide the fate of the world--and powerful, ancient forces of Light and Dark compete to determine the outcome--one member of the Fellowship of the Ring is revealed as the noble heir to the throne of the Kings of Men. Yet, the sole hope for triumph over evil lies with a brave hobbit, Frodo, who, accompanied by his loyal friend Sam and the hideous, wretched Gollum, ventures deep into the very dark heart of Mordor on his seemingly impossible quest to destroy the Ring of Power.​',
    },
  },
  {
    name: 'Inception',
    poster: 'https://image.tmdb.org/t/p/w780/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Inception',
      year: '2010',
      runtime: '2h 28m',
      rating: '4.2',
      synopsis:
        'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    },
  },
  {
    name: 'Spider-Man ―  Into the Spider-Verse',
    poster: 'https://image.tmdb.org/t/p/w780/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    genres: ['Action', 'Animation', 'Sci-Fi'],
    detail: {
      title: 'Spider-Man: Into the Spider-Verse',
      year: '2018',
      runtime: '1h 57m',
      rating: '4.2',
      synopsis:
        'Struggling to find his place in the world while juggling school and family, Brooklyn teenager Miles Morales is unexpectedly bitten by a radioactive spider and develops unfathomable powers just like the one and only Spider-Man. While wrestling with the implications of his new abilities, Miles discovers a super collider created by the madman Wilson "Kingpin" Fisk, causing others from across the Spider-Verse to be inadvertently transported to his dimension.',
    },
  },
  {
    name: 'The Lord of the Rings ―  The Fellowship of the Ring',
    poster: 'https://image.tmdb.org/t/p/w780/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    genres: ['Action'],
    detail: {
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      year: '2001',
      runtime: '2h 59m',
      rating: '4.2',
      synopsis:
        'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom, the only place where it can be destroyed.',
    },
  },
  {
    name: 'Voicemails for Isabelle',
    poster: 'https://image.tmdb.org/t/p/w780/canZTWSxACSnAluir3dCtMxKpA1.jpg',
    genres: ['Comedy', 'Romance'],
    detail: {
      title: 'Voicemails for Isabelle',
      year: '2026',
      runtime: '1h 59m',
      rating: '4.2',
      synopsis:
        "A young woman's hilariously confessional voicemails to her late sister are unknowingly redirected to a stranger, who begins to fall in love from afar.",
    },
  },
  {
    name: 'Whiplash',
    poster: 'https://image.tmdb.org/t/p/w780/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    genres: ['Musical'],
    detail: {
      title: 'Whiplash',
      year: '2014',
      runtime: '1h 47m',
      rating: '4.2',
      synopsis:
        'Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.',
    },
  },
  {
    name: 'Back to the Future',
    poster: 'https://image.tmdb.org/t/p/w780/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg',
    genres: ['Comedy', 'Sci-Fi'],
    detail: {
      title: 'Back to the Future',
      year: '1985',
      runtime: '1h 56m',
      rating: '4.2',
      synopsis:
        "Eighties teenager Marty McFly is accidentally sent back in time to 1955, inadvertently disrupting his parents' first meeting and attracting his mother's romantic interest. Marty must repair the damage to history by rekindling his parents' romance and - with the help of his eccentric inventor friend Doc Brown - return to 1985.",
    },
  },
  {
    name: 'Léon ―  The Professional',
    poster: 'https://image.tmdb.org/t/p/w780/bxB2q91nKYp8JNzqE7t7TWBVupB.jpg',
    genres: ['Action'],
    detail: {
      title: 'Léon: The Professional',
      year: '1994',
      runtime: '1h 51m',
      rating: '4.2',
      synopsis:
        'Léon, the top hit man in New York, has earned a rep as an effective "cleaner". But when his next-door neighbors are wiped out by a loose-cannon DEA agent, he becomes the unwilling custodian of 12-year-old Mathilda. Before long, Mathilda\'s thoughts turn to revenge, and she considers following in Léon\'s footsteps.',
    },
  },
  {
    name: "Snoopy Presents ―  There's No Place Like Home, Snoopy",
    poster: 'https://image.tmdb.org/t/p/w780/YbC4SlzE030BgxWdKDdlatMh5W.jpg',
    genres: ['Animation'],
    detail: {
      title: "Snoopy Presents: There's No Place Like Home, Snoopy",
      year: '2026',
      runtime: '32m',
      rating: '4.2',
      synopsis:
        "When Snoopy's beloved doghouse goes missing, he tries to track it down, and learns what makes a house feel like home.",
    },
  },
  {
    name: 'Spider-Man ―  Across the Spider-Verse',
    poster: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    genres: ['Action', 'Animation', 'Sci-Fi'],
    detail: {
      title: 'Spider-Man: Across the Spider-Verse',
      year: '2023',
      runtime: '2h 20m',
      rating: '4.2',
      synopsis:
        "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse's very existence. But when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders and must set out on his own to save those he loves most.",
    },
  },
  {
    name: 'The Intouchables',
    poster: 'https://image.tmdb.org/t/p/w780/1QU7HKgsQbGpzsJbJK4pAVQV9F5.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'The Intouchables',
      year: '2011',
      runtime: '1h 53m',
      rating: '4.2',
      synopsis:
        'A true story of two men who should never have met – a quadriplegic aristocrat who was injured in a paragliding accident and a young man from the projects.',
    },
  },
  {
    name: 'The Lion King',
    poster: 'https://image.tmdb.org/t/p/w780/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
    genres: ['Animation'],
    detail: {
      title: 'The Lion King',
      year: '1994',
      runtime: '1h 29m',
      rating: '4.2',
      synopsis:
        'Young lion prince Simba, eager to one day become king of the Pride Lands, grows up under the watchful eye of his father Mufasa; all the while his villainous uncle Scar conspires to take the throne for himself. Amid betrayal and tragedy, Simba must confront his past and find his rightful place in the Circle of Life.',
    },
  },
  {
    name: 'The Punisher ―  One Last Kill',
    poster: 'https://image.tmdb.org/t/p/w780/qQclTgLMDvGBuUBFGHRipxkEwWR.jpg',
    genres: ['Action'],
    detail: {
      title: 'The Punisher: One Last Kill',
      year: '2026',
      runtime: '51m',
      rating: '4.2',
      synopsis:
        'As Frank Castle searches for meaning beyond revenge, an unexpected force pulls him back into the fight.',
    },
  },
  {
    name: 'The Wild Robot',
    poster: 'https://image.tmdb.org/t/p/w780/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg',
    genres: ['Animation', 'Sci-Fi'],
    detail: {
      title: 'The Wild Robot',
      year: '2024',
      runtime: '1h 42m',
      rating: '4.2',
      synopsis:
        "After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
    },
  },
  {
    name: 'Avengers ―  Endgame',
    poster: 'https://image.tmdb.org/t/p/w780/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Avengers: Endgame',
      year: '2019',
      runtime: '3h 1m',
      rating: '4.1',
      synopsis:
        "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
    },
  },
  {
    name: 'Avengers ―  Infinity War',
    poster: 'https://image.tmdb.org/t/p/w780/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Avengers: Infinity War',
      year: '2018',
      runtime: '2h 29m',
      rating: '4.1',
      synopsis:
        'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.',
    },
  },
  {
    name: 'Coco',
    poster: 'https://image.tmdb.org/t/p/w780/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg',
    genres: ['Animation', 'Musical'],
    detail: {
      title: 'Coco',
      year: '2017',
      runtime: '1h 45m',
      rating: '4.1',
      synopsis:
        "Despite his family’s baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead following a mysterious chain of events. Along the way, he meets charming trickster Hector, and together, they set off on an extraordinary journey to unlock the real story behind Miguel's family history.",
    },
  },
  {
    name: 'Hoppers',
    poster: 'https://image.tmdb.org/t/p/w780/xjtWQ2CL1mpmMNwuU5HeS4Iuwuu.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Hoppers',
      year: '2026',
      runtime: '1h 44m',
      rating: '4.1',
      synopsis:
        "Scientists have discovered how to 'hop' human consciousness into lifelike robotic animals, allowing people to communicate with animals as animals. Animal lover Mabel seizes an opportunity to use the technology, uncovering mysteries within the animal world beyond anything she could have imagined.",
    },
  },
  {
    name: 'Puss in Boots ―  The Last Wish',
    poster: 'https://image.tmdb.org/t/p/w780/kuf6dutpsT0vSVehic3EZIqkOBt.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Puss in Boots: The Last Wish',
      year: '2022',
      runtime: '1h 43m',
      rating: '4.1',
      synopsis:
        'Puss in Boots discovers that his passion for adventure has taken its toll: He has burned through eight of his nine lives, leaving him with only one life left. Puss sets out on an epic journey to find the mythical Last Wish and restore his nine lives.',
    },
  },
  {
    name: 'Scarface',
    poster: 'https://image.tmdb.org/t/p/w780/iQ5ztdjvteGeboxtmRdXEChJOHh.jpg',
    genres: ['Action'],
    detail: {
      title: 'Scarface',
      year: '1983',
      runtime: '2h 50m',
      rating: '4.1',
      synopsis:
        'After getting a green card in exchange for assassinating a Cuban government official, Tony Montana stakes a claim on the drug trade in Miami. Viciously murdering anyone who stands in his way, Tony eventually becomes the biggest drug lord in the state, controlling nearly all the cocaine that comes through Miami. But increased pressure from the police, wars with Colombian drug cartels and his own drug-fueled paranoia serve to fuel the flames of his eventual downfall.',
    },
  },
  {
    name: 'Terminator 2 ―  Judgment Day',
    poster: 'https://image.tmdb.org/t/p/w780/jFTVD4XoWQTcg7wdyJKa8PEds5q.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Terminator 2: Judgment Day',
      year: '1991',
      runtime: '2h 17m',
      rating: '4.1',
      synopsis:
        'Ten years after the events of the original, a reprogrammed T-800 is sent back in time to protect young John Connor from the shape-shifting T-1000. Together with his mother Sarah, he fights to stop Skynet from triggering a nuclear apocalypse.',
    },
  },
  {
    name: 'The Prestige',
    poster: 'https://image.tmdb.org/t/p/w780/Ag2B2KHKQPukjH7WutmgnnSNurZ.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'The Prestige',
      year: '2006',
      runtime: '2h 10m',
      rating: '4.1',
      synopsis:
        'A mysterious story of two magicians whose intense rivalry leads them on a life-long battle for supremacy -- full of obsession, deceit and jealousy with dangerous and deadly consequences.',
    },
  },
  {
    name: 'The Super Mario Galaxy Movie',
    poster: 'https://image.tmdb.org/t/p/w780/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'The Super Mario Galaxy Movie',
      year: '2026',
      runtime: '1h 38m',
      rating: '4.1',
      synopsis:
        "Having thwarted Bowser's previous plot to marry Princess Peach, Mario and Luigi now face a fresh threat in Bowser Jr., who is determined to liberate his father from captivity and restore the family legacy. Alongside companions new and old, the brothers travel across the stars to stop the young heir's crusade.",
    },
  },
  {
    name: 'The Truman Show',
    poster: 'https://image.tmdb.org/t/p/w780/vuza0WqY239yBXOadKlGwJsZJFE.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'The Truman Show',
      year: '1998',
      runtime: '1h 43m',
      rating: '4.1',
      synopsis:
        'In a picture-perfect seaside town, an insurance salesman begins to realize that his entire existence may be staged and observed by a vast unseen audience as part of a long-running real-time reality TV show.',
    },
  },
  {
    name: 'Top Gun ―  Maverick',
    poster: 'https://image.tmdb.org/t/p/w780/n0YuM4f5lvGAP6MAW2kBIzugXnc.jpg',
    genres: ['Action'],
    detail: {
      title: 'Top Gun: Maverick',
      year: '2022',
      runtime: '2h 11m',
      rating: '4.1',
      synopsis:
        'After more than thirty years of service as one of the Navy’s top aviators, and dodging the advancement in rank that would ground him, Pete “Maverick” Mitchell finds himself training a detachment of TOP GUN graduates for a specialized mission the likes of which no living pilot has ever seen.',
    },
  },
  {
    name: 'Call Me by Your Name',
    poster: 'https://image.tmdb.org/t/p/w780/mZ4gBdfkhP9tvLH1DO4m4HYtiyi.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Call Me by Your Name',
      year: '2017',
      runtime: '2h 12m',
      rating: '4.0',
      synopsis:
        "In the summer of 1983, a 17-year-old Elio spends his days in his family's villa in Italy. One day Oliver, a graduate student, arrives to assist Elio's father, a professor of Greco-Roman culture. Soon, Elio and Oliver discover a summer that will alter their lives forever.",
    },
  },
  {
    name: 'Dune ―  Part Two',
    poster: 'https://image.tmdb.org/t/p/w780/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'Dune: Part Two',
      year: '2024',
      runtime: '2h 47m',
      rating: '4.0',
      synopsis:
        'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.',
    },
  },
  {
    name: 'Eternal Sunshine of the Spotless Mind',
    poster: 'https://image.tmdb.org/t/p/w780/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg',
    genres: ['Romance', 'Sci-Fi'],
    detail: {
      title: 'Eternal Sunshine of the Spotless Mind',
      year: '2004',
      runtime: '1h 48m',
      rating: '4.0',
      synopsis:
        'Joel Barish, heartbroken that his girlfriend underwent a procedure to erase him from her memory, decides to do the same. However, as he watches his memories of her fade away, he realises that he still loves her, and may be too late to correct his mistake.',
    },
  },
  {
    name: 'Flow',
    poster: 'https://image.tmdb.org/t/p/w780/z2sG41PxfL1hnL1mHbxzSREUtOf.jpg',
    genres: ['Animation'],
    detail: {
      title: 'Flow',
      year: '2024',
      runtime: '1h 25m',
      rating: '4.0',
      synopsis:
        'A solitary cat, displaced by a great flood, finds refuge on a boat with various species and must navigate the challenges of adapting to a transformed world together.',
    },
  },
  {
    name: 'GOAT',
    poster: 'https://image.tmdb.org/t/p/w780/wfuqMlaExcoYiUEvKfVpUTt1v4u.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'GOAT',
      year: '2026',
      runtime: '1h 40m',
      rating: '4.0',
      synopsis:
        'A small goat with big dreams gets a once-in-a-lifetime shot to join the pros and play roarball, a high-intensity, co-ed, full-contact sport dominated by the fastest, fiercest animals in the world.',
    },
  },
  {
    name: 'Pride & Prejudice',
    poster: 'https://image.tmdb.org/t/p/w780/o8UhmEbWPHmTUxP0lMuCoqNkbB3.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Pride & Prejudice',
      year: '2005',
      runtime: '2h 8m',
      rating: '4.0',
      synopsis:
        "A story of love and life among the landed English gentry during the Georgian era. Mr. Bennet is a gentleman living in Hertfordshire with his overbearing wife and five daughters, but if he dies their house will be inherited by a distant cousin whom they have never met, so the family's future happiness and security is dependent on the daughters making good marriages.",
    },
  },
  {
    name: "Singin' in the Rain",
    poster: 'https://image.tmdb.org/t/p/w780/w03EiJVHP8Un77boQeE7hg9DVdU.jpg',
    genres: ['Comedy', 'Musical', 'Romance'],
    detail: {
      title: "Singin' in the Rain",
      year: '1952',
      runtime: '1h 43m',
      rating: '4.0',
      synopsis:
        'In 1927 Hollywood, a silent film star falls for a chorus girl just as he and his paranoid screen partner struggle to make the difficult transition to talking pictures.',
    },
  },
  {
    name: 'The Avengers',
    poster: 'https://image.tmdb.org/t/p/w780/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'The Avengers',
      year: '2012',
      runtime: '2h 23m',
      rating: '4.0',
      synopsis:
        'When an unexpected enemy emerges and threatens global safety and security, Nick Fury, director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster. Spanning the globe, a daring recruitment effort begins!',
    },
  },
  {
    name: 'The Thing',
    poster: 'https://image.tmdb.org/t/p/w780/tzGY49kseSE9QAKk47uuDGwnSCu.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'The Thing',
      year: '1982',
      runtime: '1h 49m',
      rating: '4.0',
      synopsis:
        'A research team in Antarctica is hunted by a shape-shifting alien that assumes the appearance of its victims.',
    },
  },
  {
    name: 'WALL·E',
    poster: 'https://image.tmdb.org/t/p/w780/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg',
    genres: ['Animation', 'Sci-Fi'],
    detail: {
      title: 'WALL·E',
      year: '2008',
      runtime: '1h 38m',
      rating: '4.0',
      synopsis:
        "After hundreds of years doing what he was built for, WALL•E— a robot designed to clean up the earth—discovers a new purpose in life when he meets a sleek search robot named EVE. EVE comes to realize that WALL•E has inadvertently stumbled upon the key to the planet's future, and races back to space to report to the humans. Meanwhile, WALL•E chases EVE across the galaxy and sets into motion one of the most imaginative adventures ever brought to the big screen.",
    },
  },
  {
    name: "Zack Snyder's Justice League",
    poster: 'https://image.tmdb.org/t/p/w780/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg',
    genres: ['Action'],
    detail: {
      title: "Zack Snyder's Justice League",
      year: '2021',
      runtime: '4h 2m',
      rating: '4.0',
      synopsis:
        "Determined to ensure Superman's ultimate sacrifice was not in vain, Bruce Wayne aligns forces with Diana Prince with plans to recruit a team of metahumans to protect the world from an approaching threat of catastrophic proportions.",
    },
  },
  {
    name: 'Aliens',
    poster: 'https://image.tmdb.org/t/p/w780/r1x5JGpyqZU8PYhbs4UcrO1Xb6x.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Aliens',
      year: '1986',
      runtime: '2h 17m',
      rating: '4.0',
      synopsis:
        "Ripley, the sole survivor of the Nostromo's deadly encounter with the monstrous Alien, returns to Earth after drifting through space in hypersleep for 57 years. Although her story is initially met with skepticism, she agrees to accompany a team of Colonial Marines back to LV-426.",
    },
  },
  {
    name: 'KPop Demon Hunters',
    poster: 'https://image.tmdb.org/t/p/w780/zT7Lhw3BhJbMkRqm9Zlx2YGMsY0.jpg',
    genres: ['Animation', 'Comedy', 'Musical'],
    detail: {
      title: 'KPop Demon Hunters',
      year: '2025',
      runtime: '1h 36m',
      rating: '4.0',
      synopsis:
        "When K-pop superstars Rumi, Mira and Zoey aren't selling out stadiums, they're using their secret powers to protect their fans from supernatural threats.",
    },
  },
  {
    name: 'Kill Bill ―  Vol. 1',
    poster: 'https://image.tmdb.org/t/p/w780/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg',
    genres: ['Action'],
    detail: {
      title: 'Kill Bill: Vol. 1',
      year: '2003',
      runtime: '1h 51m',
      rating: '4.0',
      synopsis:
        'An assassin is shot by her ruthless employer, Bill, and other members of their assassination circle – but she lives to plot her vengeance.',
    },
  },
  {
    name: 'The Odyssey',
    poster: 'https://image.tmdb.org/t/p/w780/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg',
    genres: ['Action'],
    detail: {
      title: 'The Odyssey',
      year: '2026',
      runtime: '2h 53m',
      rating: '4.0',
      synopsis:
        'Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.',
    },
  },
  {
    name: 'The Wolf of Wall Street',
    poster: 'https://image.tmdb.org/t/p/w780/kW9LmvYHAaS9iA0tHmZVq8hQYoq.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'The Wolf of Wall Street',
      year: '2013',
      runtime: '3h',
      rating: '4.0',
      synopsis:
        "A New York stockbroker refuses to cooperate in a large securities fraud case involving corruption on Wall Street, corporate banking world and mob infiltration. Based on Jordan Belfort's autobiography.",
    },
  },
  {
    name: 'Toy Story',
    poster: 'https://image.tmdb.org/t/p/w780/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Toy Story',
      year: '1995',
      runtime: '1h 21m',
      rating: '4.0',
      synopsis:
        "Led by Woody, Andy's toys live happily in his room until Andy's birthday brings Buzz Lightyear onto the scene. Afraid of losing his place in Andy's heart, Woody plots against Buzz. But when circumstances separate Buzz and Woody from their owner, the duo eventually learns to put aside their differences.",
    },
  },
  {
    name: 'Up',
    poster: 'https://image.tmdb.org/t/p/w780/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Up',
      year: '2009',
      runtime: '1h 36m',
      rating: '4.0',
      synopsis:
        'Carl Fredricksen spent his entire life dreaming of exploring the globe and experiencing life to its fullest. But at age 78, life seems to have passed him by, until a twist of fate (and a persistent 8-year old Wilderness Explorer named Russell) gives him a new lease on life.',
    },
  },
  {
    name: 'About Time',
    poster: 'https://image.tmdb.org/t/p/w780/ls6zswrOZVhCXQBh96DlbnLBajM.jpg',
    genres: ['Romance'],
    detail: {
      title: 'About Time',
      year: '2013',
      runtime: '2h 3m',
      rating: '4.0',
      synopsis:
        "The night after another unsatisfactory New Year's party, Tim's father reveals to him that the men in their family have the ability to travel through time. They can't change history, but they can change what happens and has happened in their own lives. Thus begins the start of a lesson in learning to appreciate life itself as it is, as it comes, and most importantly, the people living alongside us.",
    },
  },
  {
    name: 'Amélie',
    poster: 'https://image.tmdb.org/t/p/w780/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg',
    genres: ['Comedy', 'Romance'],
    detail: {
      title: 'Amélie',
      year: '2001',
      runtime: '2h 2m',
      rating: '4.0',
      synopsis:
        'At a tiny Parisian café, the adorable yet painfully shy Amélie accidentally discovers a gift for helping others. Soon Amelie is spending her days as a matchmaker, guardian angel, and all-around do-gooder. But when she bumps into a handsome stranger, will she find the courage to become the star of her very own love story?',
    },
  },
  {
    name: 'Blade Runner',
    poster: 'https://image.tmdb.org/t/p/w780/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'Blade Runner',
      year: '1982',
      runtime: '1h 58m',
      rating: '4.0',
      synopsis:
        'In the smog-choked dystopian Los Angeles of 2019, blade runner Rick Deckard is called out of retirement to terminate a quartet of replicants who have escaped to Earth seeking their creator for a way to extend their short life spans.',
    },
  },
  {
    name: 'Coraline',
    poster: 'https://image.tmdb.org/t/p/w780/4jeFXQYytChdZYE9JYO7Un87IlW.jpg',
    genres: ['Animation'],
    detail: {
      title: 'Coraline',
      year: '2009',
      runtime: '1h 40m',
      rating: '4.0',
      synopsis:
        'Wandering her rambling old house in her boring new town, 11-year-old Coraline discovers a hidden door to a strangely idealized version of her life. In order to stay in the fantasy, she must make a frighteningly real sacrifice.',
    },
  },
  {
    name: 'Heat',
    poster: 'https://image.tmdb.org/t/p/w780/umSVjVdbVwtx5ryCA2QXL44Durm.jpg',
    genres: ['Action'],
    detail: {
      title: 'Heat',
      year: '1995',
      runtime: '2h 50m',
      rating: '4.0',
      synopsis:
        'Obsessive master thief Neil McCauley leads a top-notch crew on various daring heists throughout Los Angeles while determined detective Vincent Hanna pursues him without rest. Each man recognizes and respects the ability and the dedication of the other even though they are aware their cat-and-mouse game may end in violence.',
    },
  },
  {
    name: 'How to Train Your Dragon',
    poster: 'https://image.tmdb.org/t/p/w780/53dsJ3oEnBhTBVMigWJ9tkA5bzJ.jpg',
    genres: ['Action'],
    detail: {
      title: 'How to Train Your Dragon',
      year: '2025',
      runtime: '2h 5m',
      rating: '4.0',
      synopsis:
        'On the rugged isle of Berk, where Vikings and dragons have been bitter enemies for generations, Hiccup stands apart, defying centuries of tradition when he befriends Toothless, a feared Night Fury dragon. Their unlikely bond reveals the true nature of dragons, challenging the very foundations of Viking society.',
    },
  },
  {
    name: 'Inside Out',
    poster: 'https://image.tmdb.org/t/p/w780/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg',
    genres: ['Animation'],
    detail: {
      title: 'Inside Out',
      year: '2015',
      runtime: '1h 35m',
      rating: '4.0',
      synopsis:
        'When 11-year-old Riley moves to a new city, her Emotions team up to help her through the transition. Joy, Fear, Anger, Disgust and Sadness work together, but when Joy and Sadness get lost, they must journey through unfamiliar places to get back home.',
    },
  },
  {
    name: 'Kill Bill ―  Vol. 2',
    poster: 'https://image.tmdb.org/t/p/w780/2yhg0mZQMhDyvUQ4rG1IZ4oIA8L.jpg',
    genres: ['Action'],
    detail: {
      title: 'Kill Bill: Vol. 2',
      year: '2004',
      runtime: '2h 16m',
      rating: '4.0',
      synopsis:
        "The Bride unwaveringly continues on her roaring rampage of revenge against the band of assassins who had tried to kill her and her unborn child. She visits each of her former associates one-by-one, checking off the victims on her Death List Five until there's nothing left to do … but kill Bill.",
    },
  },
  {
    name: 'La La Land',
    poster: 'https://image.tmdb.org/t/p/w780/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    genres: ['Comedy', 'Musical', 'Romance'],
    detail: {
      title: 'La La Land',
      year: '2016',
      runtime: '2h 9m',
      rating: '4.0',
      synopsis:
        'Mia, an aspiring actress, serves lattes to movie stars in between auditions and Sebastian, a jazz musician, scrapes by playing cocktail party gigs in dingy bars, but as success mounts they are faced with decisions that begin to fray the fragile fabric of their love affair, and the dreams they worked so hard to maintain in each other threaten to rip them apart.',
    },
  },
  {
    name: 'Me Before You',
    poster: 'https://image.tmdb.org/t/p/w780/Ia3dzj5LnCj1ZBdlVeJrbKJQxG.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Me Before You',
      year: '2016',
      runtime: '1h 50m',
      rating: '4.0',
      synopsis:
        'Lou Clark, a directionless 26-year-old from the English countryside, takes a job at the local castle as a caregiver and companion to a wealthy young banker, Will Traynor. Wheelchair-bound from an accident two years prior, the once adventurous Will has all but given up — that is until Lou determines to show him that life is worth living.',
    },
  },
  {
    name: 'Monsters, Inc.',
    poster: 'https://image.tmdb.org/t/p/w780/wFSpyMsp7H0ttERbxY7Trlv8xry.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Monsters, Inc.',
      year: '2001',
      runtime: '1h 32m',
      rating: '4.0',
      synopsis:
        "Lovable Sulley and his wisecracking sidekick Mike Wazowski are the top scare team at Monsters, Inc., the scream-processing factory in Monstropolis. When a little girl named Boo wanders into their world, it's the monsters who are scared silly, and it's up to Sulley and Mike to keep her out of sight and get her back home.",
    },
  },
  {
    name: 'Mortal Kombat II',
    poster: 'https://image.tmdb.org/t/p/w780/hwRdDFIhaEmpRgoki805YvyyjZf.jpg',
    genres: ['Action'],
    detail: {
      title: 'Mortal Kombat II',
      year: '2026',
      runtime: '1h 56m',
      rating: '4.0',
      synopsis:
        'The fan favorite champions—now joined by Johnny Cage himself—are pitted against one another in the ultimate, no-holds barred, gory battle to defeat the dark rule of Shao Kahn that threatens the very existence of the Earthrealm and its defenders.',
    },
  },
  {
    name: 'Spider-Man ―  Brand New Day',
    poster: 'https://image.tmdb.org/t/p/w780/iPOn6DinuVyLY17YM9mKuPofV08.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Spider-Man: Brand New Day',
      year: '2026',
      runtime: '2h 25m',
      rating: '4.0',
      synopsis:
        "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
    },
  },
  {
    name: 'Spider-Man ―  No Way Home',
    poster: 'https://image.tmdb.org/t/p/w780/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Spider-Man: No Way Home',
      year: '2021',
      runtime: '2h 28m',
      rating: '4.0',
      synopsis:
        'Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man.',
    },
  },
  {
    name: 'The Greatest Showman',
    poster: 'https://image.tmdb.org/t/p/w780/b9CeobiihCx1uG1tpw8hXmpi7nm.jpg',
    genres: ['Musical'],
    detail: {
      title: 'The Greatest Showman',
      year: '2017',
      runtime: '1h 45m',
      rating: '4.0',
      synopsis:
        'The story of American showman P.T. Barnum, founder of the circus that became the famous traveling Ringling Bros. and Barnum & Bailey Circus.',
    },
  },
  {
    name: 'The Notebook',
    poster: 'https://image.tmdb.org/t/p/w780/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg',
    genres: ['Romance'],
    detail: {
      title: 'The Notebook',
      year: '2004',
      runtime: '2h 3m',
      rating: '4.0',
      synopsis:
        "An epic love story centered around an older man who reads aloud to a woman with Alzheimer's. From a faded notebook, the old man's words bring to life the story about a couple who is separated by World War II, and is then passionately reunited, seven years later, after they have taken different paths.",
    },
  },
  {
    name: 'The Sheep Detectives',
    poster: 'https://image.tmdb.org/t/p/w780/mGWOmj2jHFol3kOGNv1EhbSDDE1.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'The Sheep Detectives',
      year: '2026',
      runtime: '1h 49m',
      rating: '4.0',
      synopsis:
        "George Hardy is a shepherd who reads detective novels to his beloved sheep every night, assuming they can't possibly understand. But when a mysterious incident disrupts life on the farm, the sheep realize they must become the detectives. As they follow the clues and investigate human suspects, they prove that even sheep can be brilliant crime-solvers.",
    },
  },
  {
    name: 'Titanic',
    poster: 'https://image.tmdb.org/t/p/w780/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Titanic',
      year: '1997',
      runtime: '3h 14m',
      rating: '4.0',
      synopsis:
        "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later. A young Rose boards the ship with her mother and fiancé. Meanwhile, Jack Dawson and Fabrizio De Rossi win third-class tickets aboard the ship. Rose tells the whole story from Titanic's departure through to its death—on its first and last voyage—on April 15, 1912.",
    },
  },
  {
    name: 'Brokeback Mountain',
    poster: 'https://image.tmdb.org/t/p/w780/aByfQOQBNa4CMFwIgq3QrqY2ZHh.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Brokeback Mountain',
      year: '2005',
      runtime: '2h 14m',
      rating: '3.9',
      synopsis:
        'In 1960s Wyoming, two men develop a strong emotional and sexual relationship that endures as a lifelong connection complicating their lives as they get married and start families of their own.',
    },
  },
  {
    name: 'Die Hard',
    poster: 'https://image.tmdb.org/t/p/w780/7Bjd8kfmDSOzpmhySpEhkUyK2oH.jpg',
    genres: ['Action'],
    detail: {
      title: 'Die Hard',
      year: '1988',
      runtime: '2h 12m',
      rating: '3.9',
      synopsis:
        "High above the city of L.A. a team of terrorists has seized a building, taken hostages, and declared war. One man has manages to escape... An off-duty cop hiding somewhere inside. He's alone, tired... and the only chance anyone has got.",
    },
  },
  {
    name: 'Dune',
    poster: 'https://image.tmdb.org/t/p/w780/v1tRXZ4JtD2Iv6fjkPvT4GiwslV.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'Dune',
      year: '2021',
      runtime: '2h 35m',
      rating: '3.9',
      synopsis:
        "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people. As malevolent forces explode into conflict over the planet's exclusive supply of the most precious resource in existence - a commodity capable of unlocking humanity's greatest potential - only those who can conquer their fear will survive.",
    },
  },
  {
    name: 'Finding Nemo',
    poster: 'https://image.tmdb.org/t/p/w780/5lc6nQc0VhWFYFbNv016xze8Jvy.jpg',
    genres: ['Animation'],
    detail: {
      title: 'Finding Nemo',
      year: '2003',
      runtime: '1h 40m',
      rating: '3.9',
      synopsis:
        "Nemo, an adventurous young clownfish, is unexpectedly taken from his Great Barrier Reef home to a dentist's office aquarium. It's up to his worrisome father Marlin and a friendly but forgetful fish Dory to bring Nemo home -- meeting vegetarian sharks, surfer dude turtles, hypnotic jellyfish, hungry seagulls, and more along the way.",
    },
  },
  {
    name: 'Hamilton',
    poster: 'https://image.tmdb.org/t/p/w780/h1B7tW0t399VDjAcWJh8m87469b.jpg',
    genres: ['Musical'],
    detail: {
      title: 'Hamilton',
      year: '2025',
      runtime: '2h 40m',
      rating: '3.9',
      synopsis:
        'Presenting the tale of American founding father Alexander Hamilton, this filmed version of the original Broadway smash hit is the story of America then, told by America now.',
    },
  },
  {
    name: 'Knives Out',
    poster: 'https://image.tmdb.org/t/p/w780/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'Knives Out',
      year: '2019',
      runtime: '2h 11m',
      rating: '3.9',
      synopsis:
        "When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Benoit Blanc is mysteriously enlisted to investigate. From Harlan's dysfunctional family to his devoted staff, Blanc sifts through a web of red herrings and self-serving lies to uncover the truth behind Harlan's untimely death.",
    },
  },
  {
    name: 'Little Women',
    poster: 'https://image.tmdb.org/t/p/w780/yn5ihODtZ7ofn8pDYfxCmxh8AXI.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Little Women',
      year: '2019',
      runtime: '2h 15m',
      rating: '3.9',
      synopsis:
        'Four sisters come of age in America in the aftermath of the Civil War.',
    },
  },
  {
    name: 'Pirates of the Caribbean ―  The Curse of the Black Pearl',
    poster: 'https://image.tmdb.org/t/p/w780/poHwCZeWzJCShH7tOjg8RIoyjcw.jpg',
    genres: ['Action'],
    detail: {
      title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
      year: '2003',
      runtime: '2h 23m',
      rating: '3.9',
      synopsis:
        'When wily pirate Captain Barbossa seizes Jack Sparrow’s beloved ship, the Black Pearl, and kidnaps the governor’s daughter, Elizabeth Swann, blacksmith Will Turner reluctantly teams up with the unpredictable pirate Jack to rescue her—only to uncover a terrifying curse that turns Barbossa’s crew into the undead.',
    },
  },
  {
    name: 'Ratatouille',
    poster: 'https://image.tmdb.org/t/p/w780/t3vaWRPSf6WjDSamIkKDs1iQWna.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Ratatouille',
      year: '2007',
      runtime: '1h 51m',
      rating: '3.9',
      synopsis:
        "Remy, a rat, possesses a palate far more refined than that of his fellow comrades. He aspires to become a chef, one who creates rather than scavenges. When fate leads him beneath one of Paris's finest restaurants, he forms an unusual alliance with a young kitchen worker to pursue his culinary ambitions. As his double life unfolds, Remy must navigate the suspicions of the calculating Head Chef Skinner, the disapproval of Remy’s own colony, and the foreboding presence of renowned food critic Anton Ego, whose judgment can make or break a chef's legacy.",
    },
  },
  {
    name: 'Shelter',
    poster: 'https://image.tmdb.org/t/p/w780/buPFnHZ3xQy6vZEHxbHgL1Pc6CR.jpg',
    genres: ['Action'],
    detail: {
      title: 'Shelter',
      year: '2026',
      runtime: '1h 47m',
      rating: '3.9',
      synopsis:
        'A man living in self-imposed exile on a remote island rescues a young girl from a violent storm, setting off a chain of events that forces him out of seclusion to protect her from enemies tied to his past.',
    },
  },
  {
    name: 'Shrek',
    poster: 'https://image.tmdb.org/t/p/w780/iB64vpL3dIObOtMZgX3RqdVdQDc.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Shrek',
      year: '2001',
      runtime: '1h 30m',
      rating: '3.9',
      synopsis:
        "It ain't easy bein' green -- especially if you're a likable (albeit smelly) ogre named Shrek. On a mission to retrieve a gorgeous princess from the clutches of a fire-breathing dragon, Shrek teams up with an unlikely compatriot -- a wisecracking donkey.",
    },
  },
  {
    name: 'The Big Lebowski',
    poster: 'https://image.tmdb.org/t/p/w780/3bv6WAp6BSxxYvB5ozKFUYuRA8C.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'The Big Lebowski',
      year: '1998',
      runtime: '1h 57m',
      rating: '3.9',
      synopsis:
        "Jeffrey 'The Dude' Lebowski, a Los Angeles slacker who only wants to bowl and drink White Russians, is mistaken for another Jeffrey Lebowski, a wheelchair-bound millionaire, and finds himself dragged into a strange series of events involving nihilists, adult film producers, ferrets, errant toes, and large sums of money.",
    },
  },
  {
    name: 'The Dark Knight Rises',
    poster: 'https://image.tmdb.org/t/p/w780/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg',
    genres: ['Action'],
    detail: {
      title: 'The Dark Knight Rises',
      year: '2012',
      runtime: '2h 45m',
      rating: '3.9',
      synopsis:
        "Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent's crimes to protect the late attorney's reputation and is subsequently hunted by the Gotham City Police Department. Eight years later, Batman encounters the mysterious Selina Kyle and the villainous Bane, a new terrorist leader who overwhelms Gotham's finest. The Dark Knight resurfaces to protect a city that has branded him an enemy.",
    },
  },
  {
    name: 'The Nightmare Before Christmas',
    poster: 'https://image.tmdb.org/t/p/w780/oQffRNjK8e19rF7xVYEN8ew0j7b.jpg',
    genres: ['Animation'],
    detail: {
      title: 'The Nightmare Before Christmas',
      year: '1993',
      runtime: '1h 16m',
      rating: '3.9',
      synopsis:
        "Tired of scaring humans every October 31 with the same old bag of tricks, Jack Skellington, the spindly king of Halloween Town, kidnaps Santa Claus and plans to deliver shrunken heads and other ghoulish gifts to children on Christmas morning. But as Christmas approaches, Jack's rag-doll girlfriend, Sally, tries to foil his misguided plans.",
    },
  },
  {
    name: 'Toy Story 3',
    poster: 'https://image.tmdb.org/t/p/w780/AbbXspMOwdvwWZgVN0nabZq03Ec.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Toy Story 3',
      year: '2010',
      runtime: '1h 43m',
      rating: '3.9',
      synopsis:
        "Woody, Buzz, and the rest of Andy's toys haven't been played with in years. With Andy about to go to college, the gang find themselves accidentally left at a nefarious day care center. The toys must band together to escape and return home to Andy.",
    },
  },
  {
    name: 'Warrior',
    poster: 'https://image.tmdb.org/t/p/w780/iM8n4nZJPR2abpnyZ36FUgHiRjr.jpg',
    genres: ['Action', 'Sport'],
    detail: {
      title: 'Warrior',
      year: '2011',
      runtime: '2h 20m',
      rating: '3.9',
      synopsis:
        "The youngest son of an alcoholic former boxer returns home, where he's trained by his father for competition in a mixed martial arts tournament – a path that puts the fighter on a collision course with his estranged, older brother.",
    },
  },
  {
    name: 'Zootopia',
    poster: 'https://image.tmdb.org/t/p/w780/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Zootopia',
      year: '2016',
      runtime: '1h 49m',
      rating: '3.9',
      synopsis:
        "Determined to prove herself, Officer Judy Hopps, the first bunny on Zootopia's police force, jumps at the chance to crack her first case - even if it means partnering with scam-artist fox Nick Wilde to solve the mystery.",
    },
  },
  {
    name: 'Aladdin',
    poster: 'https://image.tmdb.org/t/p/w780/eLFfl7vS8dkeG1hKp5mwbm37V83.jpg',
    genres: ['Animation'],
    detail: {
      title: 'Aladdin',
      year: '1992',
      runtime: '1h 31m',
      rating: '3.9',
      synopsis:
        'In the boorish city of Agrabah, kind-hearted street urchin Aladdin and Princess Jasmine fall in love, although she can only marry a prince. He and power-hungry Grand Vizier Jafar vie for a magic lamp that can fulfill their wishes.',
    },
  },
  {
    name: 'Batman Begins',
    poster: 'https://image.tmdb.org/t/p/w780/sPX89Td70IDDjVr85jdSBb4rWGr.jpg',
    genres: ['Action'],
    detail: {
      title: 'Batman Begins',
      year: '2005',
      runtime: '2h 20m',
      rating: '3.9',
      synopsis:
        'Driven by tragedy, billionaire Bruce Wayne dedicates his life to uncovering and defeating the corruption that plagues his home, Gotham City.  Unable to work within the system, he instead creates a new identity, a symbol of fear for the criminal underworld - The Batman.',
    },
  },
  {
    name: 'Beauty and the Beast',
    poster: 'https://image.tmdb.org/t/p/w780/hUJ0UvQ5tgE2Z9WpfuduVSdiCiU.jpg',
    genres: ['Animation', 'Romance'],
    detail: {
      title: 'Beauty and the Beast',
      year: '1991',
      runtime: '1h 24m',
      rating: '3.9',
      synopsis:
        "Follow the adventures of Belle, a bright young woman who finds herself in the castle of a prince who's been turned into a mysterious beast. With the help of the castle's enchanted staff, Belle soon learns the most important lesson of all -- that true beauty comes from within.",
    },
  },
  {
    name: 'Everything Everywhere All at Once',
    poster: 'https://image.tmdb.org/t/p/w780/u68AjlvlutfEIcpmbYpKcdi09ut.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Everything Everywhere All at Once',
      year: '2022',
      runtime: '2h 20m',
      rating: '3.9',
      synopsis:
        "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
    },
  },
  {
    name: 'Fiddler on the Roof',
    poster: 'https://image.tmdb.org/t/p/w780/v65PHx7Q6Jx0anyNeUOX07SJic9.jpg',
    genres: ['Musical', 'Romance'],
    detail: {
      title: 'Fiddler on the Roof',
      year: '1971',
      runtime: '3h 1m',
      rating: '3.9',
      synopsis:
        'In a pre-revolutionary Russia, a poor Jewish milkman struggles with the challenges of a changing world as his daughters fall in love and antisemitism grows.',
    },
  },
  {
    name: 'Hamnet',
    poster: 'https://image.tmdb.org/t/p/w780/vbeyOZm2bvBXcbgPD3v6o94epPX.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Hamnet',
      year: '2025',
      runtime: '2h 5m',
      rating: '3.9',
      synopsis:
        "The powerful story of love and loss that inspired the creation of Shakespeare's timeless masterpiece, Hamlet.",
    },
  },
  {
    name: 'Iron Man',
    poster: 'https://image.tmdb.org/t/p/w780/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Iron Man',
      year: '2008',
      runtime: '2h 6m',
      rating: '3.9',
      synopsis:
        'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.',
    },
  },
  {
    name: 'John Wick ―  Chapter 4',
    poster: 'https://image.tmdb.org/t/p/w780/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    genres: ['Action'],
    detail: {
      title: 'John Wick: Chapter 4',
      year: '2023',
      runtime: '2h 50m',
      rating: '3.9',
      synopsis:
        'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes.',
    },
  },
  {
    name: 'My Fault',
    poster: 'https://image.tmdb.org/t/p/w780/w46Vw536HwNnEzOa7J24YH9DPRS.jpg',
    genres: ['Romance'],
    detail: {
      title: 'My Fault',
      year: '2023',
      runtime: '1h 56m',
      rating: '3.9',
      synopsis:
        "Noah must leave her city, boyfriend, and friends to move into William Leister's mansion, the flashy and wealthy husband of her mother Rafaela. As a proud and independent 17 year old, Noah resists living in a mansion surrounded by luxury. However, it is there where she meets Nick, her new stepbrother, and the clash of their strong personalities becomes evident from the very beginning.",
    },
  },
  {
    name: 'Past Lives',
    poster: 'https://image.tmdb.org/t/p/w780/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Past Lives',
      year: '2023',
      runtime: '1h 46m',
      rating: '3.9',
      synopsis:
        'After decades apart, childhood friends Nora and Hae Sung are reunited in New York for one fateful weekend as they confront notions of destiny, love, and the choices that make a life.',
    },
  },
  {
    name: 'The Blues Brothers',
    poster: 'https://image.tmdb.org/t/p/w780/b0hq1d2d7FIvRGNLewKLm79JNTK.jpg',
    genres: ['Comedy', 'Musical'],
    detail: {
      title: 'The Blues Brothers',
      year: '1980',
      runtime: '2h 13m',
      rating: '3.9',
      synopsis:
        'Jake Blues, just released from prison, puts his old band back together to save the Catholic home where he and his brother Elwood were raised.',
    },
  },
  {
    name: 'The Gorge',
    poster: 'https://image.tmdb.org/t/p/w780/7iMBZzVZtG0oBug4TfqDb9ZxAOa.jpg',
    genres: ['Romance', 'Sci-Fi'],
    detail: {
      title: 'The Gorge',
      year: '2025',
      runtime: '2h 8m',
      rating: '3.9',
      synopsis:
        'Two highly trained operatives grow close from a distance after being sent to guard opposite sides of a mysterious gorge. When an evil below emerges, they must work together to survive what lies within.',
    },
  },
  {
    name: 'The Hustler',
    poster: 'https://image.tmdb.org/t/p/w780/snItsSViawjaadW9mlWUmGwR41R.jpg',
    genres: ['Romance', 'Sport'],
    detail: {
      title: 'The Hustler',
      year: '1961',
      runtime: '2h 14m',
      rating: '3.9',
      synopsis:
        'Fast Eddie Felson is a small-time pool hustler with a lot of talent but a self-destructive attitude. His bravado causes him to challenge the legendary Minnesota Fats to a high-stakes match.',
    },
  },
  {
    name: 'The Incredibles',
    poster: 'https://image.tmdb.org/t/p/w780/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg',
    genres: ['Action', 'Animation'],
    detail: {
      title: 'The Incredibles',
      year: '2004',
      runtime: '1h 55m',
      rating: '3.9',
      synopsis:
        "Bob Parr has given up his superhero days to log in time as an insurance adjuster and raise his three children with his formerly heroic wife in suburbia. But when he receives a mysterious assignment, it's time to get back into costume.",
    },
  },
  {
    name: 'The Martian',
    poster: 'https://image.tmdb.org/t/p/w780/fASz8A0yFE3QB6LgGoOfwvFSseV.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'The Martian',
      year: '2015',
      runtime: '2h 21m',
      rating: '3.9',
      synopsis:
        'During a manned mission to Mars, Astronaut Mark Watney is presumed dead after a fierce storm and left behind by his crew. But Watney has survived and finds himself stranded and alone on the hostile planet. With only meager supplies, he must draw upon his ingenuity, wit and spirit to subsist and find a way to signal to Earth that he is alive.',
    },
  },
  {
    name: 'The Sound of Music',
    poster: 'https://image.tmdb.org/t/p/w780/c6CrUZypAsBCaRWX0M3RVRDbhNS.jpg',
    genres: ['Musical', 'Romance'],
    detail: {
      title: 'The Sound of Music',
      year: '1965',
      runtime: '2h 54m',
      rating: '3.9',
      synopsis:
        'In the years before World War II, a tomboyish postulant at an Austrian abbey is hired as a governess in the home of a widowed naval captain with seven children and brings a new love of life and music into the home.',
    },
  },
  {
    name: 'The Terminator',
    poster: 'https://image.tmdb.org/t/p/w780/qvktm0BHcnmDpul4Hz01GIazWPr.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'The Terminator',
      year: '1984',
      runtime: '1h 48m',
      rating: '3.9',
      synopsis:
        'In the post-apocalyptic future, reigning tyrannical supercomputers teleport a cyborg assassin known as the "Terminator" back to 1984 to kill Sarah Connor, whose unborn son is destined to lead insurgents against 21st century mechanical hegemony. Meanwhile, the human-resistance movement dispatches a lone warrior to safeguard Sarah. Can he stop the virtually indestructible killing machine?',
    },
  },
  {
    name: 'Zootopia 2',
    poster: 'https://image.tmdb.org/t/p/w780/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Zootopia 2',
      year: '2025',
      runtime: '1h 48m',
      rating: '3.9',
      synopsis:
        "After cracking the biggest case in Zootopia's history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De'Snake arrives and turns the animal metropolis upside down. To crack the case, Judy and Nick must go undercover to unexpected new parts of town, where their growing partnership is tested like never before.",
    },
  },
  {
    name: '10 Things I Hate About You',
    poster: 'https://image.tmdb.org/t/p/w780/ujERk3aKABXU3NDXOAxEQYTHe9A.jpg',
    genres: ['Comedy', 'Romance'],
    detail: {
      title: '10 Things I Hate About You',
      year: '1999',
      runtime: '1h 37m',
      rating: '3.8',
      synopsis:
        'On the first day at his new school, Cameron instantly falls for Bianca, the gorgeous girl of his dreams. The only problem is that Bianca is forbidden to date until her ill-tempered, completely un-dateable older sister Kat goes out, too. In an attempt to solve his problem, Cameron singles out the only guy who could possibly be a match for Kat: a mysterious bad boy with a nasty reputation of his own.',
    },
  },
  {
    name: 'Avatar ―  Fire and Ash',
    poster: 'https://image.tmdb.org/t/p/w780/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'Avatar: Fire and Ash',
      year: '2025',
      runtime: '3h 18m',
      rating: '3.8',
      synopsis:
        "In the wake of the devastating war against the RDA and the loss of their eldest son, Jake Sully and Neytiri face a new threat on Pandora: the Ash People, a violent and power-hungry Na'vi tribe led by the ruthless Varang. Jake's family must fight for their survival and the future of Pandora in a conflict that pushes them to their emotional and physical limits.",
    },
  },
  {
    name: 'Avatar ―  The Way of Water',
    poster: 'https://image.tmdb.org/t/p/w780/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Avatar: The Way of Water',
      year: '2022',
      runtime: '3h 12m',
      rating: '3.8',
      synopsis:
        'Set more than a decade after the events of the first film, learn the story of the Sully family (Jake, Neytiri, and their kids), the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.',
    },
  },
  {
    name: 'Blade Runner 2049',
    poster: 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    genres: ['Sci-Fi'],
    detail: {
      title: 'Blade Runner 2049',
      year: '2017',
      runtime: '2h 44m',
      rating: '3.8',
      synopsis:
        "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard, a former LAPD blade runner who has been missing for 30 years.",
    },
  },
  {
    name: 'Cinderella Man',
    poster: 'https://image.tmdb.org/t/p/w780/wkeOjIcpuqLMW4GnVowlM9VI0JE.jpg',
    genres: ['Romance', 'Sport'],
    detail: {
      title: 'Cinderella Man',
      year: '2005',
      runtime: '2h 24m',
      rating: '3.8',
      synopsis:
        'The true story of boxer Jim Braddock who, following his retirement in the 1930s, makes a surprise comeback in order to lift his family out of poverty.',
    },
  },
  {
    name: 'Corpse Bride',
    poster: 'https://image.tmdb.org/t/p/w780/3RAoVTxUk1OzZClscAsynuu670p.jpg',
    genres: ['Animation', 'Romance'],
    detail: {
      title: 'Corpse Bride',
      year: '2005',
      runtime: '1h 17m',
      rating: '3.8',
      synopsis:
        'In a 19th-century European village, a young man about to be married is whisked away to the underworld and wed to a mysterious corpse bride, while his real bride waits bereft in the land of the living.',
    },
  },
  {
    name: 'Deadpool',
    poster: 'https://image.tmdb.org/t/p/w780/3E53WEZJqP6aM84D8CckXx4pIHw.jpg',
    genres: ['Action', 'Comedy'],
    detail: {
      title: 'Deadpool',
      year: '2016',
      runtime: '1h 48m',
      rating: '3.8',
      synopsis:
        'The origin story of former Special Forces operative turned mercenary Wade Wilson, who, after being subjected to a rogue experiment that leaves him with accelerated healing powers, adopts the alter ego Deadpool. Armed with his new abilities and a dark, twisted sense of humor, Deadpool hunts down the man who nearly destroyed his life.',
    },
  },
  {
    name: 'Deadpool & Wolverine',
    poster: 'https://image.tmdb.org/t/p/w780/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    detail: {
      title: 'Deadpool & Wolverine',
      year: '2024',
      runtime: '2h 8m',
      rating: '3.8',
      synopsis:
        'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
    },
  },
  {
    name: 'Elemental',
    poster: 'https://image.tmdb.org/t/p/w780/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg',
    genres: ['Animation', 'Comedy', 'Romance'],
    detail: {
      title: 'Elemental',
      year: '2023',
      runtime: '1h 42m',
      rating: '3.8',
      synopsis:
        'In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy will discover something elemental: how much they have in common.',
    },
  },
  {
    name: 'Groundhog Day',
    poster: 'https://image.tmdb.org/t/p/w780/gCgt1WARPZaXnq523ySQEUKinCs.jpg',
    genres: ['Comedy', 'Romance'],
    detail: {
      title: 'Groundhog Day',
      year: '1993',
      runtime: '1h 41m',
      rating: '3.8',
      synopsis:
        'A cynical TV weatherman, along with his idealistic producer and his sardonic cameraman, is sent to report on Groundhog Day in the small town of Punxsutawney, where he finds himself repeating the same day over and over.',
    },
  },
  {
    name: 'Guardians of the Galaxy Vol. 2',
    poster: 'https://image.tmdb.org/t/p/w780/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Guardians of the Galaxy Vol. 2',
      year: '2017',
      runtime: '2h 17m',
      rating: '3.8',
      synopsis:
        "The Guardians must fight to keep their newfound family together as they unravel the mysteries of Peter Quill's true parentage.",
    },
  },
  {
    name: 'Jackass ―  Best and Last',
    poster: 'https://image.tmdb.org/t/p/w780/tfgccePxnswMqhmtxafliLlcCVR.jpg',
    genres: ['Action', 'Comedy'],
    detail: {
      title: 'Jackass: Best and Last',
      year: '2026',
      runtime: '1h 32m',
      rating: '3.8',
      synopsis:
        'The fifth and final installment to Jackass franchise where the crew go on one last insane crusade.',
    },
  },
  {
    name: 'King Richard',
    poster: 'https://image.tmdb.org/t/p/w780/2dfujXrxePtYJPiPHj1HkAFQvpu.jpg',
    genres: ['Sport'],
    detail: {
      title: 'King Richard',
      year: '2021',
      runtime: '2h 24m',
      rating: '3.8',
      synopsis:
        'The story of how Richard Williams served as a coach to his daughters Venus and Serena, who will soon become two of the most legendary tennis players in history.',
    },
  },
  {
    name: 'Lilo & Stitch',
    poster: 'https://image.tmdb.org/t/p/w780/cFuLvQJPoZpuruAtN3rVnMmLIH8.jpg',
    genres: ['Animation', 'Comedy', 'Sci-Fi'],
    detail: {
      title: 'Lilo & Stitch',
      year: '2002',
      runtime: '1h 25m',
      rating: '3.8',
      synopsis:
        'As Stitch, a runaway genetic experiment from a faraway planet, wreaks havoc on the Hawaiian Islands, he becomes the mischievous adopted alien "puppy" of an independent little girl named Lilo and learns about loyalty, friendship, and ʻohana, the Hawaiian tradition of family.',
    },
  },
  {
    name: 'Mad Max ―  Fury Road',
    poster: 'https://image.tmdb.org/t/p/w780/ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Mad Max: Fury Road',
      year: '2015',
      runtime: '2h 1m',
      rating: '3.8',
      synopsis:
        'An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and most everyone is crazed fighting for the necessities of life. Within this world exist two rebels on the run who just might be able to restore order.',
    },
  },
  {
    name: 'Poor Things',
    poster: 'https://image.tmdb.org/t/p/w780/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    genres: ['Comedy', 'Romance', 'Sci-Fi'],
    detail: {
      title: 'Poor Things',
      year: '2023',
      runtime: '2h 21m',
      rating: '3.8',
      synopsis:
        'Brought back to life by an unorthodox scientist, a young woman runs off with a lawyer on a whirlwind adventure across the continents. Free from the prejudices of her times, she grows steadfast in her purpose to stand for equality and liberation.',
    },
  },
  {
    name: 'Ready Player One',
    poster: 'https://image.tmdb.org/t/p/w780/pU1ULUq8D3iRxl1fdX2lZIzdHuI.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Ready Player One',
      year: '2018',
      runtime: '2h 20m',
      rating: '3.8',
      synopsis:
        'When the creator of a popular video game system dies, a virtual contest is created to compete for his fortune.',
    },
  },
  {
    name: 'Ready or Not ―  Here I Come',
    poster: 'https://image.tmdb.org/t/p/w780/13ZcJzSGEqVgDSqsS9U5EkQwPkV.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'Ready or Not: Here I Come',
      year: '2026',
      runtime: '1h 48m',
      rating: '3.8',
      synopsis:
        'Moments after surviving an all-out attack from the Le Domas family, Grace discovers she’s reached the next level of the nightmarish game — and this time with her estranged sister Faith at her side. Grace has one chance to survive, keep her sister alive, and claim the High Seat of the Council that controls the world. Four rival families are hunting her for the throne, and whoever wins rules it all.',
    },
  },
  {
    name: 'Sonic the Hedgehog 3',
    poster: 'https://image.tmdb.org/t/p/w780/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    detail: {
      title: 'Sonic the Hedgehog 3',
      year: '2024',
      runtime: '1h 50m',
      rating: '3.8',
      synopsis:
        'Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow, a mysterious villain with powers unlike anything they have faced before. With their abilities outmatched in every way, Team Sonic must seek out an unlikely alliance in hopes of stopping Shadow and protecting the planet.',
    },
  },
  {
    name: 'Tangled',
    poster: 'https://image.tmdb.org/t/p/w780/ym7Kst6a4uodryxqbGOxmewF235.jpg',
    genres: ['Animation'],
    detail: {
      title: 'Tangled',
      year: '2010',
      runtime: '1h 40m',
      rating: '3.8',
      synopsis:
        "Feisty teenager Rapunzel, who has long and magical hair, wants to go and see sky lanterns on her eighteenth birthday, but she's bound to a tower by her overprotective mother. She strikes a deal with Flynn Rider, a charming wanted thief, and the duo set off on an action-packed escapade.",
    },
  },
  {
    name: 'The Bad Guys 2',
    poster: 'https://image.tmdb.org/t/p/w780/26oSPnq0ct59l07QOXZKyzsiRtN.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'The Bad Guys 2',
      year: '2025',
      runtime: '1h 44m',
      rating: '3.8',
      synopsis:
        'The now-reformed Bad Guys are trying (very, very hard) to be good, but instead find themselves hijacked into a high-stakes, globe-trotting heist, masterminded by a new team of criminals they never saw coming: The Bad Girls.',
    },
  },
  {
    name: 'The Fifth Element',
    poster: 'https://image.tmdb.org/t/p/w780/fPtlCO1yQtnoLHOwKtWz7db6RGU.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'The Fifth Element',
      year: '1997',
      runtime: '2h 6m',
      rating: '3.8',
      synopsis:
        'In 2257, a taxi driver is unintentionally given the task of saving a young girl who is part of the key that will ensure the survival of humanity.',
    },
  },
  {
    name: 'The Super Mario Bros. Movie',
    poster: 'https://image.tmdb.org/t/p/w780/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
    genres: ['Comedy'],
    detail: {
      title: 'The Super Mario Bros. Movie',
      year: '2023',
      runtime: '1h 33m',
      rating: '3.8',
      synopsis:
        'While working underground to fix a water main, Brooklyn plumbers—and brothers—Mario and Luigi are transported down a mysterious pipe and wander into a magical new world. But when the brothers are separated, Mario embarks on an epic quest to find Luigi.',
    },
  },
  {
    name: 'Toy Story 2',
    poster: 'https://image.tmdb.org/t/p/w780/4rbcp3ng8n1MKHjpeqW0L7Fnpzz.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Toy Story 2',
      year: '1999',
      runtime: '1h 32m',
      rating: '3.8',
      synopsis:
        "Andy heads off to Cowboy Camp, leaving his toys to their own devices. Things shift into high gear when an obsessive toy collector named Al McWhiggen, owner of Al's Toy Barn kidnaps Woody. Andy's toys mount a daring rescue mission, Buzz Lightyear meets his match and Woody has to decide where he and his heart truly belong.",
    },
  },
  {
    name: 'tick, tick... BOOM!',
    poster: 'https://image.tmdb.org/t/p/w780/DPmfcuR8fh8ROYXgdjrAjSGA0o.jpg',
    genres: ['Musical'],
    detail: {
      title: 'tick, tick... BOOM!',
      year: '2021',
      runtime: '2h',
      rating: '3.8',
      synopsis:
        'On the brink of turning 30, a promising theater composer navigates love, friendship and the pressure to create something great before time runs out.',
    },
  },
  {
    name: 'Captain America ―  Civil War',
    poster: 'https://image.tmdb.org/t/p/w780/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Captain America: Civil War',
      year: '2016',
      runtime: '2h 27m',
      rating: '3.8',
      synopsis:
        'Following the events of Age of Ultron, the collective governments of the world pass an act designed to regulate all superhuman activity. This polarizes opinion amongst the Avengers, causing two factions to side with Iron Man or Captain America, which causes an epic battle between former allies.',
    },
  },
  {
    name: 'Hercules',
    poster: 'https://image.tmdb.org/t/p/w780/dK9rNoC97tgX3xXg5zdxFisdfcp.jpg',
    genres: ['Animation'],
    detail: {
      title: 'Hercules',
      year: '1997',
      runtime: '1h 33m',
      rating: '3.8',
      synopsis:
        "Bestowed with superhuman strength, a young mortal named Hercules sets out to prove himself a hero in the eyes of his father, the great god Zeus. Along with his friends Pegasus, a flying horse, and Phil, a personal trainer, Hercules is tricked by the hilarious, hotheaded villain Hades, who's plotting to take over Mount Olympus!",
    },
  },
  {
    name: 'I, Tonya',
    poster: 'https://image.tmdb.org/t/p/w780/6gNXwSHxaksR1PjVZRqNapmkgj3.jpg',
    genres: ['Comedy', 'Sport'],
    detail: {
      title: 'I, Tonya',
      year: '2017',
      runtime: '2h',
      rating: '3.8',
      synopsis:
        'Competitive ice skater Tonya Harding rises amongst the ranks at the U.S. Figure Skating Championships, but her future in the sport is thrown into doubt when her ex-husband intervenes.',
    },
  },
  {
    name: 'Incredibles 2',
    poster: 'https://image.tmdb.org/t/p/w780/9lFKBtaVIhP7E2Pk0IY1CwTKTMZ.jpg',
    genres: ['Action', 'Animation'],
    detail: {
      title: 'Incredibles 2',
      year: '2018',
      runtime: '1h 58m',
      rating: '3.8',
      synopsis:
        'Elastigirl springs into action to save the day, while Mr. Incredible faces his greatest challenge yet – taking care of the problems of his three children.',
    },
  },
  {
    name: 'Inside Out 2',
    poster: 'https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Inside Out 2',
      year: '2024',
      runtime: '1h 37m',
      rating: '3.8',
      synopsis:
        "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust, who’ve long been running a successful operation by all accounts, aren’t sure how to feel when Anxiety shows up. And it looks like she’s not alone.",
    },
  },
  {
    name: 'Mary Poppins',
    poster: 'https://image.tmdb.org/t/p/w780/o4Wsby4ydIXhWmtmfvb451D5Np1.jpg',
    genres: ['Comedy', 'Musical'],
    detail: {
      title: 'Mary Poppins',
      year: '1964',
      runtime: '2h 19m',
      rating: '3.8',
      synopsis:
        'In turn of the century London, a magical nanny employs music and adventure to help two neglected children become closer to their father.',
    },
  },
  {
    name: 'Moulin Rouge!',
    poster: 'https://image.tmdb.org/t/p/w780/2kjM5CUZRIU5yOANUowrbJcRL9L.jpg',
    genres: ['Musical', 'Romance'],
    detail: {
      title: 'Moulin Rouge!',
      year: '2001',
      runtime: '2h 8m',
      rating: '3.8',
      synopsis:
        "A celebration of love and creative inspiration takes place in the infamous, gaudy and glamorous Parisian nightclub, at the cusp of the 20th century. A young poet, who is plunged into the heady world of Moulin Rouge, begins a passionate affair with the club's most notorious and beautiful star.",
    },
  },
  {
    name: 'The Bad Guys',
    poster: 'https://image.tmdb.org/t/p/w780/7qop80YfuO0BwJa1uXk1DXUUEwv.jpg',
    genres: ['Action', 'Animation', 'Comedy'],
    detail: {
      title: 'The Bad Guys',
      year: '2022',
      runtime: '1h 40m',
      rating: '3.8',
      synopsis:
        'When the Bad Guys, a crew of criminal animals, are finally caught after years of heists and being the world’s most-wanted villains, Mr. Wolf brokers a deal to save them all from prison.',
    },
  },
  {
    name: 'The Invite',
    poster: 'https://image.tmdb.org/t/p/w780/b7Dr8Chzse8VagexAporUu2RtLx.jpg',
    genres: ['Comedy', 'Romance'],
    detail: {
      title: 'The Invite',
      year: '2026',
      runtime: '1h 47m',
      rating: '3.8',
      synopsis:
        "Joe and Angela's marriage is on thin ice. When they invite their enigmatic upstairs neighbors for a dinner party, the night spirals into unexpected places. Have they reignited the spark or lit the match that burns it all down?",
    },
  },
  {
    name: 'The Mandalorian and Grogu',
    poster: 'https://image.tmdb.org/t/p/w780/7GV5rrUJf0BRUhoh2cyFoeNthlQ.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'The Mandalorian and Grogu',
      year: '2026',
      runtime: '2h 12m',
      rating: '3.8',
      synopsis:
        'The evil Empire has fallen, and Imperial warlords remain scattered throughout the galaxy. As the fledgling New Republic works to protect everything the Rebellion fought for, they have enlisted the help of legendary Mandalorian bounty hunter Din Djarin and his young apprentice Grogu.',
    },
  },
  {
    name: 'The Wrestler',
    poster: 'https://image.tmdb.org/t/p/w780/6OTR8dSoNGjWohJNo3UhIGd3Tj.jpg',
    genres: ['Romance', 'Sport'],
    detail: {
      title: 'The Wrestler',
      year: '2008',
      runtime: '1h 49m',
      rating: '3.8',
      synopsis:
        'Aging wrestler Randy "The Ram" Robinson is long past his prime but still ready and rarin\' to go on the pro-wrestling circuit. After a particularly brutal beating, however, Randy hangs up his tights, pursues a serious relationship with a long-in-the-tooth stripper, and tries to reconnect with his estranged daughter. But he can\'t resist the lure of the ring and readies himself for a comeback.',
    },
  },
  {
    name: 'Toy Story 4',
    poster: 'https://image.tmdb.org/t/p/w780/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Toy Story 4',
      year: '2019',
      runtime: '1h 40m',
      rating: '3.8',
      synopsis:
        'Woody has always been confident about his place in the world, devoted to taking care of his kid—whether that\'s Andy or Bonnie. But after Bonnie creates a reluctant new toy called "Forky", a road trip adventure alongside old and new friends challenges everything Woody believes about loyalty, purpose, and what it truly means to be a toy.',
    },
  },
  {
    name: 'Your Fault ―  London',
    poster: 'https://image.tmdb.org/t/p/w780/nLxu237EJAisFCYKK48hN9Plobx.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Your Fault: London',
      year: '2026',
      runtime: '2h 3m',
      rating: '3.8',
      synopsis:
        'Nick and Noah are both embarking on life-changing adventures that are threatening to pull them apart—Nick in business with his father and Noah starting a fresh chapter at Oxford University. Now living separate lives, and meeting new people, they find themselves entangled in temptations, rivalries, and betrayals and their bond is tested like never before. As secrets unravel and temptation rises, they must fight to hold onto each other—or risk losing everything.',
    },
  },
  {
    name: 'Boulevard',
    poster: 'https://image.tmdb.org/t/p/w780/hAKOp4AHaDiVdDMlobMNCNgJVD7.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Boulevard',
      year: '2026',
      runtime: '1h 53m',
      rating: '3.7',
      synopsis:
        "New city, new life, and an unexpected encounter with Luke-a boy fueled by adrenaline and haunted by demons. Despite the warnings, Hasley can't stay away. In their 'boulevard,' they find a raw, liberating love. But as his past threatens to destroy them both, Hasley faces a heartbreaking choice: can you save someone who isn't ready to be rescued?",
    },
  },
  {
    name: 'Glory Road',
    poster: 'https://image.tmdb.org/t/p/w780/bGRSV5tStxDNPRLCewnOeeiZzrY.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Glory Road',
      year: '2006',
      runtime: '1h 58m',
      rating: '3.7',
      synopsis:
        'In 1966, Texas Western coach Don Haskins led the first all-black starting line-up for a college basketball team to the NCAA national championship.',
    },
  },
  {
    name: 'Grease',
    poster: 'https://image.tmdb.org/t/p/w780/2rM7fQKpb7cs1Iq7IBqub9LFDzJ.jpg',
    genres: ['Comedy', 'Musical', 'Romance'],
    detail: {
      title: 'Grease',
      year: '1978',
      runtime: '1h 50m',
      rating: '3.7',
      synopsis:
        "Australian good girl Sandy and greaser Danny fell in love over the summer. But when they unexpectedly discover they're now in the same high school, will they be able to rekindle their romance despite their eccentric friends?",
    },
  },
  {
    name: 'Love & Basketball',
    poster: 'https://image.tmdb.org/t/p/w780/zNZWNX19FZ5QyedprVM0ldsXFiP.jpg',
    genres: ['Comedy', 'Romance', 'Sport'],
    detail: {
      title: 'Love & Basketball',
      year: '2000',
      runtime: '2h 5m',
      rating: '3.7',
      synopsis:
        'Monica Wright and Quincy McCall grew up in the same neighborhood and have known each other since childhood. As they grow into adulthood, they fall in love, but they also share another all-consuming passion: basketball.  As Quincy and Monica struggle to make their relationship work, they follow separate career paths though high school and college basketball and, they hope, into stardom in big-league professional ball.',
    },
  },
  {
    name: 'Meet Joe Black',
    poster: 'https://image.tmdb.org/t/p/w780/fDPAjvfPMomkKF7cMRmL5Anak61.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Meet Joe Black',
      year: '1998',
      runtime: '2h 58m',
      rating: '3.7',
      synopsis:
        "Bill Parrish has it all - success, wealth and power. Days before his 65th birthday, he receives a visit from a mysterious stranger, Joe Black, who soon reveals himself as Death. In exchange for extra time, Bill agrees to serve as Joe's earthly guide. But will he regret his choice when Joe unexpectedly falls in love with Bill's beautiful daughter Susan?",
    },
  },
  {
    name: 'My Fault ―  London',
    poster: 'https://image.tmdb.org/t/p/w780/ttN5D6GKOwKWHmCzDGctAvaNMAi.jpg',
    genres: ['Romance'],
    detail: {
      title: 'My Fault: London',
      year: '2025',
      runtime: '1h 59m',
      rating: '3.7',
      synopsis:
        "18-year-old Noah moves from America to London, with her mother who's recently fallen in love with William, a wealthy British businessman. Noah meets William’s son, bad-boy Nick, and soon discovers there is an attraction between them neither can avoid. As Noah spends the summer adjusting to her new life, her devastating past will catch up with her while falling in love for the first time.",
    },
  },
  {
    name: 'Our Fault',
    poster: 'https://image.tmdb.org/t/p/w780/yzqHt4m1SeY9FbPrfZ0C2Hi9x1s.jpg',
    genres: ['Romance'],
    detail: {
      title: 'Our Fault',
      year: '2025',
      runtime: '1h 50m',
      rating: '3.7',
      synopsis:
        "Jenna and Lion's wedding brings about the long-awaited reunion between Noah and Nick after their breakup. Nick's inability to forgive Noah stands as an insurmountable barrier. He, heir to his grandfather's businesses, and she, starting her professional life, resist fueling a flame that's still alive. But now that their paths have crossed again, will love be stronger than resentment?",
    },
  },
  {
    name: 'Pretty Woman',
    poster: 'https://image.tmdb.org/t/p/w780/hVHUfT801LQATGd26VPzhorIYza.jpg',
    genres: ['Comedy', 'Romance'],
    detail: {
      title: 'Pretty Woman',
      year: '1990',
      runtime: '2h',
      rating: '3.7',
      synopsis:
        "Vivian is a carefree, streetwise diamond in the rough when she meets sophisticated billionaire Edward in a chance encounter that turns into a week-long business arrangement. But Vivian's energetic spirit challenges Edward's no-nonsense approach to life, and soon they are teaching each other – and falling in love!",
    },
  },
  {
    name: 'Southpaw',
    poster: 'https://image.tmdb.org/t/p/w780/kSQ49Fi3NVTqGGXILmxV2T2pdkG.jpg',
    genres: ['Action', 'Sport'],
    detail: {
      title: 'Southpaw',
      year: '2015',
      runtime: '2h 3m',
      rating: '3.7',
      synopsis:
        'Billy "The Great" Hope, the reigning junior middleweight boxing champion, has an impressive career, a loving wife and daughter, and a lavish lifestyle. However, when tragedy strikes, Billy hits rock bottom, losing his family, his house and his manager. He soon finds an unlikely savior in Tick Willis, a former fighter who trains the city\'s toughest amateur boxers. With his future on the line, Hope fights to reclaim the trust of those he loves the most.',
    },
  },
  {
    name: 'Spider-Man ―  Far From Home',
    poster: 'https://image.tmdb.org/t/p/w780/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg',
    genres: ['Action', 'Sci-Fi'],
    detail: {
      title: 'Spider-Man: Far From Home',
      year: '2019',
      runtime: '2h 9m',
      rating: '3.7',
      synopsis:
        'Peter Parker and his friends go on a summer trip to Europe. However, they will hardly be able to rest - Peter will have to agree to help Nick Fury uncover the mystery of creatures that cause natural disasters and destruction throughout the continent.',
    },
  },
  {
    name: 'The Temptation of the Mature 50s Mother-in-law',
    poster: 'https://image.tmdb.org/t/p/w780/w4NBXeIu5wR8RZmw3Apq6pw72tB.jpg',
    genres: ['Romance'],
    detail: {
      title: 'The Temptation of the Mature 50s Mother-in-law',
      year: '2023',
      runtime: '1h 14m',
      rating: '3.7',
      synopsis:
        "A young couple, Wan-jin and So-hee, are living with Wan-jin's single father, Seok-bong. Seok-bong was preying on his daughter-in-law, who was doing the housework and preparing meals for him while her husband was away at work. He pretended to have dementia and attacked her. So-hee, who was suffering from her shame, suggested to Wan-jin to hire his father a caregiver, saying that his father seemed to be suffering from dementia, and so Bok-ja, a sexy and voluptuous caregiver who was about Seok-bong's age, came in. Seok-bong is captivated by Bok-ja's passionate charm and soon begins to share his love with her, and in this way, she takes the place of Wan-jin's new mother.",
    },
  },
  {
    name: 'Toy Story 5',
    poster: 'https://image.tmdb.org/t/p/w780/sfQtVlIHljToOwYjhe21KPGzZWK.jpg',
    genres: ['Animation', 'Comedy'],
    detail: {
      title: 'Toy Story 5',
      year: '2026',
      runtime: '1h 42m',
      rating: '3.7',
      synopsis:
        "When Bonnie receives a Lilypad tablet as a gift and becomes obsessed, Buzz, Woody, Jessie and the rest of the gang's jobs become exponentially harder when they have to go head to head with the all-new threat to playtime.",
    },
  },
  {
    name: 'Air',
    poster: 'https://image.tmdb.org/t/p/w780/76AKQPdH3M8cvsFR9K8JsOzVlY5.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Air',
      year: '2023',
      runtime: '1h 52m',
      rating: '3.6',
      synopsis:
        "Discover the game-changing partnership between a then undiscovered Michael Jordan and Nike's fledgling basketball division which revolutionized the world of sports and culture with the Air Jordan brand.",
    },
  },
  {
    name: 'Moneyball',
    poster: 'https://image.tmdb.org/t/p/w780/4yIQq1e6iOcaZ5rLDG3lZBP3j7a.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Moneyball',
      year: '2011',
      runtime: '2h 14m',
      rating: '3.6',
      synopsis:
        "The story of Oakland Athletics general manager Billy Beane's successful attempt to put together a baseball team on a budget, by employing computer-generated analysis to draft his players.",
    },
  },
  {
    name: 'Radio',
    poster: 'https://image.tmdb.org/t/p/w780/uQ6ci4iFHhB6TWB2f4wftR7AEly.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Radio',
      year: '2003',
      runtime: '1h 49m',
      rating: '3.6',
      synopsis:
        "In the racially divided town of Anderson, South Carolina in 1976, football coach Harold Jones spots a mentally disabled African-American young man nicknamed Radio near his practice field and is inspired to befriend him. Soon, Radio is Jones' loyal assistant, and he becomes a student at T.L. Hanna High School. But things start to sour when Coach Jones begins taking guff from parents and fans who feel that his devotion to Radio is getting in the way of the team's quest for a championship.",
    },
  },
  {
    name: 'Rocky II',
    poster: 'https://image.tmdb.org/t/p/w780/nMaiiu0CzT77U4JZkUYV7KqdAjK.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Rocky II',
      year: '1979',
      runtime: '1h 59m',
      rating: '3.6',
      synopsis:
        'After Rocky goes the distance with champ Apollo Creed, both try to put the fight behind them and move on. Rocky settles down with Adrian but can\'t put his life together outside the ring, while Creed seeks a rematch to restore his reputation. Soon enough, the "Master of Disaster" and the "Italian Stallion" are set on a collision course for a climactic battle that is brutal and unforgettable.',
    },
  },
  {
    name: 'The Prince of Egypt',
    poster: 'https://image.tmdb.org/t/p/w780/2xUjYwL6Ol7TLJPPKs7sYW5PWLX.jpg',
    genres: ['Animation', 'Musical'],
    detail: {
      title: 'The Prince of Egypt',
      year: '1998',
      runtime: '1h 39m',
      rating: '3.6',
      synopsis:
        'The strong bond between two Royal Egyptian brothers is challenged when their chosen responsibilities set them at odds, with extraordinary consequences.',
    },
  },
  {
    name: '42',
    poster: 'https://image.tmdb.org/t/p/w780/iZ7jVGQWj3eBUdqwAPUlKk0BaS2.jpg',
    genres: ['Sport'],
    detail: {
      title: '42',
      year: '2013',
      runtime: '2h 8m',
      rating: '3.6',
      synopsis:
        'In 1947, Jackie Robinson becomes the first Black man to play in Major League Baseball facing unabashed racism from the public, the press and other players.',
    },
  },
  {
    name: 'Cats',
    poster: 'https://image.tmdb.org/t/p/w780/lT8V3oJS50LAtsz3Mb1oJB6ofTC.jpg',
    genres: ['Comedy', 'Musical'],
    detail: {
      title: 'Cats',
      year: '1998',
      runtime: '2h',
      rating: '3.6',
      synopsis:
        '"Jellicle" cats join for a Jellicle ball where they rejoice with their leader, Old Deuteronomy. One cat will be chosen to go to the "Heavyside Layer" and be reborn.',
    },
  },
  {
    name: 'Eddie the Eagle',
    poster: 'https://image.tmdb.org/t/p/w780/r562gvTRVHnDSvG7MrKHEECSn1V.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Eddie the Eagle',
      year: '2016',
      runtime: '1h 46m',
      rating: '3.6',
      synopsis:
        "The feel-good story of Michael 'Eddie' Edwards, an unlikely but courageous British ski-jumper who never stopped believing in himself—even as an entire nation was counting him out. With the help of a rebellious and charismatic coach, Eddie takes on the establishment and wins the hearts of sports fans around the world by making an improbable and historic showing at the 1988 Calgary Winter Olympics.",
    },
  },
  {
    name: 'Invincible',
    poster: 'https://image.tmdb.org/t/p/w780/oss3pdMXDh9kwoCD9YEqv0hZ1vq.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Invincible',
      year: '2021',
      runtime: '1h 23m',
      rating: '3.6',
      synopsis:
        'A dynamic and emotional story of fighting, passion and sacrifice. From 2016 to 2018, the filmmakers accompanied Joanna Jedrzejczyk, a multiple UFC champion, who at her time conquered the world of female MMA. To stay on top, the Polish fighter has to constantly confront her opponents and her own body, which is forced to make superhuman efforts over and over again. "Invincible" reveals the behind-the-scenes fights of modern gladiators, bluntly showing the blood, sweat, tears and overwhelming loneliness that are the price of the road to success in sports on a global scale.',
    },
  },
  {
    name: 'Sweeney Todd ―  The Demon Barber of Fleet Street',
    poster: 'https://image.tmdb.org/t/p/w780/gAW4J1bkRjZKmFsJsIiOBASeoAp.jpg',
    genres: ['Musical'],
    detail: {
      title: 'Sweeney Todd: The Demon Barber of Fleet Street',
      year: '2007',
      runtime: '1h 56m',
      rating: '3.6',
      synopsis:
        'The infamous story of Benjamin Barker, a.k.a Sweeney Todd, who sets up a barber shop down in London which is the basis for a sinister partnership with his fellow tenant, Mrs. Lovett. Based on the hit Broadway musical.',
    },
  },
  {
    name: 'The Idea of You',
    poster: 'https://image.tmdb.org/t/p/w780/Y5P4Q3q8nrruZ9aD3wXeJS2Plg.jpg',
    genres: ['Comedy', 'Musical', 'Romance'],
    detail: {
      title: 'The Idea of You',
      year: '2024',
      runtime: '1h 56m',
      rating: '3.6',
      synopsis:
        "40-year-old single mom Solène begins an unexpected romance with 24-year-old Hayes Campbell, the lead singer of August Moon, the hottest boy band on the planet. As they begin a whirlwind romance, it isn't long before Hayes' superstar status poses unavoidable challenges to their relationship, and Solène soon discovers that life in the glare of his spotlight might be more than she bargained for.",
    },
  },
  {
    name: 'Chicago',
    poster: 'https://image.tmdb.org/t/p/w780/3ED8cWCXY9zkx77Sd0N5qMbsdDP.jpg',
    genres: ['Comedy', 'Musical'],
    detail: {
      title: 'Chicago',
      year: '2002',
      runtime: '1h 53m',
      rating: '3.5',
      synopsis:
        'Murderesses Velma Kelly and Roxie Hart find themselves on death row together and fight for the fame that will keep them from the gallows in 1920s Chicago.',
    },
  },
  {
    name: 'Concussion',
    poster: 'https://image.tmdb.org/t/p/w780/uuRFr7Jhsq7bITDyyvxZrQMAr9e.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Concussion',
      year: '2015',
      runtime: '2h 3m',
      rating: '3.5',
      synopsis:
        "A dramatic thriller based on the incredible true David vs. Goliath story of American immigrant Dr. Bennet Omalu, the brilliant forensic neuropathologist who made the first discovery of CTE, a football-related brain trauma, in a pro player and fought for the truth to be known. Omalu's emotional quest puts him at dangerous odds with one of the most powerful institutions in the world.",
    },
  },
  {
    name: 'Gridiron Gang',
    poster: 'https://image.tmdb.org/t/p/w780/tTjDApg546wt8OWazvPbEhygu83.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Gridiron Gang',
      year: '2006',
      runtime: '2h 5m',
      rating: '3.5',
      synopsis:
        'Under the leadership of their counselor, teenagers at a juvenile detention center gain self-esteem by playing football together. Based on a true story.',
    },
  },
  {
    name: 'In the Heights',
    poster: 'https://image.tmdb.org/t/p/w780/RO4KoJyoQMQzh9z76d4v4FJMmJ.jpg',
    genres: ['Musical', 'Romance'],
    detail: {
      title: 'In the Heights',
      year: '2021',
      runtime: '2h 23m',
      rating: '3.5',
      synopsis:
        'The story of Usnavi, a bodega owner who has mixed feelings about closing his store and retiring to the Dominican Republic or staying in Washington Heights.',
    },
  },
  {
    name: 'Rocky IV',
    poster: 'https://image.tmdb.org/t/p/w780/2MHUit4H6OK5adcOjnCN6suCKOl.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Rocky IV',
      year: '1985',
      runtime: '1h 31m',
      rating: '3.5',
      synopsis:
        "Rocky Balboa holds the world heavyweight championship, but a new challenger has stepped forward: Drago, a six-foot-four, 261-pound fighter who has the backing of the Soviet Union. This time, Rocky's training regimen takes him to Siberia, where he prepares for a globally televised match in the heart of Moscow. But nothing can truly prepare him for what he's about to face – a fight to the finish, in which he must defend not only himself, but also the honor of his country!",
    },
  },
  {
    name: 'Sing',
    poster: 'https://image.tmdb.org/t/p/w780/rwopfpHqPCYBSgBuZwkaXXqHp14.jpg',
    genres: ['Animation', 'Comedy', 'Musical'],
    detail: {
      title: 'Sing',
      year: '2016',
      runtime: '1h 48m',
      rating: '3.5',
      synopsis:
        'A koala named Buster recruits his best friend to help him drum up business for his theater by hosting a singing competition.',
    },
  },
  {
    name: 'Creed II',
    poster: 'https://image.tmdb.org/t/p/w780/v3QyboWRoA4O9RbcsqH8tJMe8EB.jpg',
    genres: ['Action', 'Sport'],
    detail: {
      title: 'Creed II',
      year: '2018',
      runtime: '2h 10m',
      rating: '3.5',
      synopsis:
        "Between personal obligations and training for his next big fight against an opponent with ties to his family's past, Adonis Creed is up against the challenge of his life.",
    },
  },
  {
    name: 'Jerry Maguire',
    poster: 'https://image.tmdb.org/t/p/w780/lABvGN7fDk5ifnwZoxij6G96t2w.jpg',
    genres: ['Comedy', 'Romance', 'Sport'],
    detail: {
      title: 'Jerry Maguire',
      year: '1996',
      runtime: '2h 19m',
      rating: '3.5',
      synopsis:
        "Jerry Maguire used to be a typical sports agent: willing to do just about anything he could to get the biggest possible contracts for his clients, plus a nice commission for himself. Then, one day, he suddenly has second thoughts about what he's really doing. When he voices these doubts, he ends up losing his job and all of his clients, save Rod Tidwell, an egomaniacal football player.",
    },
  },
  {
    name: 'Little Shop of Horrors',
    poster: 'https://image.tmdb.org/t/p/w780/iKkbN17OmFosaW6asCNZTTsyvpu.jpg',
    genres: ['Comedy', 'Musical'],
    detail: {
      title: 'Little Shop of Horrors',
      year: '1986',
      runtime: '1h 34m',
      rating: '3.5',
      synopsis:
        "Seymour Krelborn is a nerdy orphan working at Mushnik's; a flower shop in urban Skid Row. He harbors a crush on fellow co-worker, Audrey Fulquard, and is berated by Mr. Mushnik daily. One day, Seymour finds a very mysterious unidentified plant which he calls Audrey II. The plant seems to have a craving for blood and soon begins to sing for it’s supper.",
    },
  },
  {
    name: 'Mamma Mia!',
    poster: 'https://image.tmdb.org/t/p/w780/xYLiCWmAMHJubx5jNZ7HuXKjAbV.jpg',
    genres: ['Comedy', 'Musical', 'Romance'],
    detail: {
      title: 'Mamma Mia!',
      year: '2008',
      runtime: '1h 48m',
      rating: '3.5',
      synopsis:
        "A spirited young bride-to-be living with her single mother on a small Greek island secretly invites three of her mother's ex-boyfriends in hope of finding her biological father to walk her down the aisle.",
    },
  },
  {
    name: 'The Color Purple',
    poster: 'https://image.tmdb.org/t/p/w780/h5bqIxM8GO4TewJ0u6Rzkg58ssJ.jpg',
    genres: ['Musical'],
    detail: {
      title: 'The Color Purple',
      year: '2023',
      runtime: '2h 21m',
      rating: '3.5',
      synopsis:
        "A decades-spanning tale of love and resilience and of one woman's journey to independence. Celie faces many hardships in her life, but ultimately finds extraordinary strength and hope in the unbreakable bonds of sisterhood.",
    },
  },
  {
    name: 'Challengers',
    poster: 'https://image.tmdb.org/t/p/w780/H6vke7zGiuLsz4v4RPeReb9rsv.jpg',
    genres: ['Romance', 'Sport'],
    detail: {
      title: 'Challengers',
      year: '2024',
      runtime: '2h 12m',
      rating: '3.5',
      synopsis:
        'Tennis player turned coach Tashi has taken her husband, Art, and transformed him into a world-famous Major champion. To jolt him out of his recent losing streak, she signs him up for a "Challenger" event — close to the lowest level of pro tournament — where he finds himself standing across the net from his former best friend and Tashi\'s former boyfriend.',
    },
  },
  {
    name: 'Rocky III',
    poster: 'https://image.tmdb.org/t/p/w780/uqw16i2kmwVqkJHzjzbDU4xZ0Pl.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Rocky III',
      year: '1982',
      runtime: '1h 40m',
      rating: '3.5',
      synopsis:
        "Following Rocky Balboa's intense battle with his most powerful adversary yet – the ferocious Clubber Lang – Rocky joins forces with former rival Apollo Creed in an effort to get back his fighting spirit.",
    },
  },
  {
    name: 'The Color of Money',
    poster: 'https://image.tmdb.org/t/p/w780/dVdnHmdQu3JtLAAksjTmTEF76gD.jpg',
    genres: ['Sport'],
    detail: {
      title: 'The Color of Money',
      year: '1986',
      runtime: '1h 59m',
      rating: '3.5',
      synopsis:
        'Former pool hustler "Fast Eddie" Felson decides he wants to return to the game by taking a pupil. He meets talented but green Vincent Lauria and proposes a partnership. As they tour pool halls, Eddie teaches Vincent the tricks of scamming, but he eventually grows frustrated with Vincent\'s showboat antics, leading to an argument and a falling-out. Eddie takes up playing again and soon crosses paths with Vincent as an opponent.',
    },
  },
  {
    name: 'The Natural',
    poster: 'https://image.tmdb.org/t/p/w780/fwn1gYeOkS1XHKVFdNorKSIpix8.jpg',
    genres: ['Sport'],
    detail: {
      title: 'The Natural',
      year: '1984',
      runtime: '2h 17m',
      rating: '3.5',
      synopsis:
        'An unknown middle-aged batter named Roy Hobbs with a mysterious past appears out of nowhere to take a losing 1930s baseball team to the top of the league.',
    },
  },
  {
    name: 'We Are Marshall',
    poster: 'https://image.tmdb.org/t/p/w780/5PSiExbg6Fm8MiPJOikBCOcZFnd.jpg',
    genres: ['Sport'],
    detail: {
      title: 'We Are Marshall',
      year: '2006',
      runtime: '2h 11m',
      rating: '3.5',
      synopsis:
        "When a plane crash claims the lives of members of the Marshall University football team and some of its fans, the team's new coach and his surviving players try to keep the football program alive.",
    },
  },
  {
    name: 'West Side Story',
    poster: 'https://image.tmdb.org/t/p/w780/yfz3IUoYYSY32tkb97HlUBGFsnh.jpg',
    genres: ['Musical', 'Romance'],
    detail: {
      title: 'West Side Story',
      year: '2021',
      runtime: '2h 36m',
      rating: '3.5',
      synopsis:
        'Two youngsters from rival New York City gangs fall in love, but tensions between their respective friends build toward tragedy.',
    },
  },
  {
    name: 'Wicked',
    poster: 'https://image.tmdb.org/t/p/w780/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg',
    genres: ['Musical', 'Romance'],
    detail: {
      title: 'Wicked',
      year: '2024',
      runtime: '2h 42m',
      rating: '3.5',
      synopsis:
        "In the land of Oz, ostracized and misunderstood green-skinned Elphaba is forced to share a room with the popular aristocrat Glinda at Shiz University, and the two's unlikely friendship is tested as they begin to fulfill their respective destinies as Glinda the Good and the Wicked Witch of the West.",
    },
  },
  {
    name: 'Bleed for This',
    poster: 'https://image.tmdb.org/t/p/w780/cMM9frT6sFEvz7PwHniIDUKcLDo.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Bleed for This',
      year: '2016',
      runtime: '1h 56m',
      rating: '3.4',
      synopsis:
        "The inspirational story of World Champion Boxer Vinny Pazienza, who after a near fatal car crash, which left him not knowing if he'd ever walk again, made one of sports most incredible comebacks.",
    },
  },
  {
    name: 'Chariots of Fire',
    poster: 'https://image.tmdb.org/t/p/w780/qnRaum8k0HqGRml2i7OawFqUtEb.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Chariots of Fire',
      year: '1981',
      runtime: '2h 3m',
      rating: '3.4',
      synopsis:
        "In the class-obsessed and religiously divided UK of the early 1920s, two determined young runners train for the 1924 Paris Olympics. Eric Liddell, a devout Christian born to Scottish missionaries in China, sees running as part of his worship of God's glory and refuses to train or compete on the Sabbath. Harold Abrahams overcomes anti-Semitism and class bias, but neglects his beloved sweetheart in his single-minded quest.",
    },
  },
  {
    name: 'Slap Shot',
    poster: 'https://image.tmdb.org/t/p/w780/k5dvEA7ajd90mf3KrF6m6LnYXOv.jpg',
    genres: ['Comedy', 'Sport'],
    detail: {
      title: 'Slap Shot',
      year: '1977',
      runtime: '2h 3m',
      rating: '3.4',
      synopsis:
        'To build up attendance at their games, the management of a struggling minor-league hockey team signs up the Hanson Brothers, three hard-charging players whose job is to demolish the opposition.',
    },
  },
  {
    name: 'Space Jam',
    poster: 'https://image.tmdb.org/t/p/w780/4RN5El3Pj2W4gpwgiAGLVfSJv2g.jpg',
    genres: ['Animation', 'Sci-Fi', 'Sport'],
    detail: {
      title: 'Space Jam',
      year: '1996',
      runtime: '1h 27m',
      rating: '3.4',
      synopsis:
        'With their freedom on the line, the Looney Tunes seek the help of NBA superstar Michael Jordan to win a basketball game against a team of moronic aliens.',
    },
  },
  {
    name: 'Draft Day',
    poster: 'https://image.tmdb.org/t/p/w780/bnl2ocjS1io4UCPhjoFuPKmJ9bf.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Draft Day',
      year: '2014',
      runtime: '1h 50m',
      rating: '3.4',
      synopsis:
        "At the NFL Draft, general manager Sonny Weaver has the opportunity to rebuild his team when he trades for the number one pick. He must decide what he's willing to sacrifice on a life-changing day for a few hundred young men with NFL dreams.",
    },
  },
  {
    name: 'Foxcatcher',
    poster: 'https://image.tmdb.org/t/p/w780/w6Sl079QtUcQ9dVQ2RP6aN9NBXx.jpg',
    genres: ['Sport'],
    detail: {
      title: 'Foxcatcher',
      year: '2014',
      runtime: '2h 14m',
      rating: '3.4',
      synopsis:
        'The greatest Olympic Wrestling Champion brother team joins Team Foxcatcher led by multimillionaire sponsor John E. du Pont as they train for the 1988 games in Seoul - a union that leads to unlikely circumstances.',
    },
  },
  {
    name: 'Hairspray',
    poster: 'https://image.tmdb.org/t/p/w780/fgMka3HtFvI5OgW1eYdR9XpySxH.jpg',
    genres: ['Comedy', 'Musical', 'Romance'],
    detail: {
      title: 'Hairspray',
      year: '2007',
      runtime: '1h 56m',
      rating: '3.4',
      synopsis:
        "Pleasantly plump teenager Tracy Turnblad auditions to be on Baltimore's most popular dance show - The Corny Collins Show - and lands a prime spot. Through her newfound fame, she becomes determined to help her friends and end the racial segregation that has been a staple of the show.",
    },
  },
  {
    name: 'Happy Gilmore',
    poster: 'https://image.tmdb.org/t/p/w780/4RnCeRzvI1xk5tuNWjpDKzSnJDk.jpg',
    genres: ['Comedy', 'Sport'],
    detail: {
      title: 'Happy Gilmore',
      year: '1996',
      runtime: '1h 32m',
      rating: '3.4',
      synopsis:
        "Failed hockey player-turned-golf whiz Happy Gilmore — whose unconventional approach and antics on the green courts the ire of rival Shooter McGavin — is determined to win a PGA tournament so he can save his granny's house with the prize money. Meanwhile, an attractive tour publicist tries to soften Happy's image.",
    },
  },
  {
    name: 'He Got Game',
    poster: 'https://image.tmdb.org/t/p/w780/kd8hRaysUQOz7AvSorZDJHuihcJ.jpg',
    genres: ['Sport'],
    detail: {
      title: 'He Got Game',
      year: '1998',
      runtime: '2h 16m',
      rating: '3.4',
      synopsis:
        "A basketball player's father must try to convince him to go to a college so he can get a shorter prison sentence.",
    },
  },
  {
    name: 'Rent',
    poster: 'https://image.tmdb.org/t/p/w780/9fxpcJ5a1MwLmdfMrIAqtVCRpud.jpg',
    genres: ['Musical'],
    detail: {
      title: 'Rent',
      year: '2019',
      runtime: '2h 15m',
      rating: '3.4',
      synopsis:
        'The story of several friends in New York City facing financial poverty, homophobia, AIDS, and, of course, rent.',
    },
  },
  {
    name: 'The Longest Yard',
    poster: 'https://image.tmdb.org/t/p/w780/nbKcVBcxF96ARW2oKHqDYAcLdu.jpg',
    genres: ['Comedy', 'Sport'],
    detail: {
      title: 'The Longest Yard',
      year: '2005',
      runtime: '1h 53m',
      rating: '3.4',
      synopsis:
        "Disgraced pro football quarterback Paul Crewe lands in a Texas federal penitentiary, where manipulative Warden Hazen recruits him to advise the institution's football team of prison guards. Crewe suggests a tune-up game which lands him quarterbacking a crew of inmates in a game against the guards. Aided by incarcerated ex-NFL coach and player Nate Scarborough, Crewe and his team must overcome not only the bloodthirstiness of the opposition, but also the corrupt warden trying to fix the game against them.",
    },
  },
  {
    name: 'Uncle Drew',
    poster: 'https://image.tmdb.org/t/p/w780/yO2qw2cX0oU1ZrPBKc0PPj1C1NL.jpg',
    genres: ['Comedy', 'Sport'],
    detail: {
      title: 'Uncle Drew',
      year: '2018',
      runtime: '1h 43m',
      rating: '3.4',
      synopsis:
        'Uncle Drew recruits a squad of older basketball players to return to the court to compete in a tournament.',
    },
  },
  {
    name: "White Men Can't Jump",
    poster: 'https://image.tmdb.org/t/p/w780/jnI05Z2Cm9ACEJo8FGen7tdHKLl.jpg',
    genres: ['Comedy', 'Sport'],
    detail: {
      title: "White Men Can't Jump",
      year: '1992',
      runtime: '1h 55m',
      rating: '3.4',
      synopsis:
        'Two street basketball hustlers try to con each other, then team up for a bigger score.',
    },
  },
  {
    name: 'Bull Durham',
    poster: 'https://image.tmdb.org/t/p/w780/q3T9bO6p74NcTxWOhdUA6fASQ5T.jpg',
    genres: ['Comedy', 'Romance', 'Sport'],
    detail: {
      title: 'Bull Durham',
      year: '1988',
      runtime: '1h 48m',
      rating: '3.3',
      synopsis:
        'Veteran catcher Crash Davis is brought to the minor league Durham Bulls to help their up and coming pitching prospect, "Nuke" Laloosh. Their relationship gets off to a rocky start and is further complicated when baseball groupie Annie Savoy sets her sights on the two men.',
    },
  },
  {
    name: 'Caddyshack',
    poster: 'https://image.tmdb.org/t/p/w780/lXnNz7zOXCsftMDVoU3VSo0Eioi.jpg',
    genres: ['Comedy', 'Sport'],
    detail: {
      title: 'Caddyshack',
      year: '1980',
      runtime: '1h 38m',
      rating: '3.3',
      synopsis:
        'At an exclusive country club, an ambitious young caddy, Danny Noonan, eagerly pursues a caddy scholarship in hopes of attending college and, in turn, avoiding a job at the lumber yard. In order to succeed, he must first win the favour of the elitist Judge Smails, and then the caddy golf tournament which Smails sponsors.',
    },
  },
  {
    name: 'Les Miserables',
    poster: 'https://image.tmdb.org/t/p/w780/toQ6BJCiKVSnklpsma2GnJ6KKah.jpg',
    genres: ['Musical'],
    detail: {
      title: 'Les Miserables',
      year: '1995',
      runtime: '2h 55m',
      rating: '3.3',
      synopsis:
        "In WWII France, poor and illiterate Henri Fortin is introduced to Victor Hugo's classic novel Les Misérables and begins to see parallels between the book and his own life.",
    },
  },
  {
    name: 'Smile 2',
    poster: 'https://image.tmdb.org/t/p/w780/ht8Uv9QPv9y7K0RvUyJIaXOZTfd.jpg',
    genres: ['Musical'],
    detail: {
      title: 'Smile 2',
      year: '2024',
      runtime: '2h 7m',
      rating: '3.3',
      synopsis:
        'About to embark on a new world tour, global pop sensation Skye Riley begins experiencing increasingly terrifying and inexplicable events. Overwhelmed by the escalating horrors and the pressures of fame, Skye is forced to face her dark past to regain control of her life before it spirals out of control.',
    },
  },
  {
    name: 'The Karate Kid',
    poster: 'https://image.tmdb.org/t/p/w780/b1RBy3l297N0c7PHjlz35cClWju.jpg',
    genres: ['Action', 'Sport'],
    detail: {
      title: 'The Karate Kid',
      year: '2010',
      runtime: '2h 20m',
      rating: '3.3',
      synopsis:
        "12-year-old Dre Parker could've been the most popular kid in Detroit, but his mother's latest career move has landed him in China. Dre immediately falls for his classmate Mei Ying but the cultural differences make such a friendship impossible. Even worse, Dre's feelings make him an enemy of the class bully, Cheng. With no friends in a strange land, Dre has nowhere to turn but maintenance man Mr. Han, who is a kung fu master. As Han teaches Dre that kung fu is not about punches and parries, but maturity and calm, Dre realizes that facing down the bullies will be the fight of his life.",
    },
  },
  {
    name: 'Trolls',
    poster: 'https://image.tmdb.org/t/p/w780/9VlK2j0THZWzhQPq0W3Oc0IIdBB.jpg',
    genres: ['Animation', 'Comedy', 'Musical'],
    detail: {
      title: 'Trolls',
      year: '2016',
      runtime: '1h 32m',
      rating: '3.3',
      synopsis:
        'After the monstrous Bergens invade Troll Village, Princess Poppy, the happiest Troll ever born, and overly-cautious, curmudgeonly outcast Branch set off on a journey to rescue her friends. Their mission is full of adventure and mishaps, as this mismatched duo try to tolerate each other long enough to get the job done.',
    },
  },
  {
    name: 'Annie',
    poster: 'https://image.tmdb.org/t/p/w780/aKAM9V0izx4VhsdyAdBvAB26UCZ.jpg',
    genres: ['Comedy', 'Musical'],
    detail: {
      title: 'Annie',
      year: '2014',
      runtime: '1h 58m',
      rating: '3.1',
      synopsis:
        "Annie is a young, happy foster kid who's also tough enough to make her way on the streets of New York in 2014. Originally left by her parents as a baby with the promise that they'd be back for her someday, it's been a hard knock life ever since with her mean foster mom Miss Hannigan. But everything's about to change when the hard-nosed tycoon and New York mayoral candidate Will Stacks—advised by his brilliant VP and his shrewd and scheming campaign advisor—makes a thinly-veiled campaign move and takes her in. Stacks believes he's her guardian angel, but Annie's self-assured nature and bright, sun-will-come-out-tomorrow outlook on life just might mean it's the other way around.",
    },
  },
  {
    name: 'Into the Woods',
    poster: 'https://image.tmdb.org/t/p/w780/bINGDDuvUnZyde2sIcSx41IE5b6.jpg',
    genres: ['Comedy', 'Musical'],
    detail: {
      title: 'Into the Woods',
      year: '2014',
      runtime: '2h 5m',
      rating: '2.9',
      synopsis:
        'In a woods filled with magic and fairy tale characters, a baker and his wife set out to end the curse put on them by their neighbor, a spiteful witch.',
    },
  },
  {
    name: '9 Songs',
    poster: 'https://image.tmdb.org/t/p/w780/91O7z0vo7MiNWd5xD2BoivwbQsb.jpg',
    genres: ['Musical', 'Romance'],
    detail: {
      title: '9 Songs',
      year: '2004',
      runtime: '1h 10m',
      rating: '2.8',
      synopsis:
        "Matt, a young glaciologist, soars across the vast, silent, icebound immensities of the South Pole as he recalls his love affair with Lisa. They meet at a mobbed rock concert in a vast music hall - London's Brixton Academy. They are in bed at night's end. Together, over a period of several months, they pursue a mutual sexual passion whose inevitable stages unfold in counterpoint to nine live-concert songs.",
    },
  },
]
