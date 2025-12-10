import React, { useState, useEffect } from 'react';
import { ViewState, Translation, LanguageCode } from '../types';

interface ReadingList100Props {
  onNavClick: (view: ViewState) => void;
  t: Translation;
  language: LanguageCode;
}

const ReadingList100: React.FC<ReadingList100Props> = ({ onNavClick, t, language }) => {
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for tracking read books in this specific list (persisted in localStorage)
  const [markedAsRead, setMarkedAsRead] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('readingList100Progress');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('readingList100Progress', JSON.stringify(markedAsRead));
  }, [markedAsRead]);

  const toggleBook = (bookNumber: string) => {
    setMarkedAsRead(prev => {
      if (prev.includes(bookNumber)) {
        return prev.filter(id => id !== bookNumber);
      } else {
        return [...prev, bookNumber];
      }
    });
  };

  // Multilingual Data for the 100 Books List
  const SECTIONS_DATA: Record<LanguageCode, { title: string; books: string[] }[]> = {
    tr: [
      {
        title: "Antik Çağ ve Destanlar",
        books: [
          "1. Gılgamış Destanı – Anonim",
          "2. İlyada – Homeros",
          "3. Odysseia – Homeros",
          "4. Aeneis – Vergilius",
          "5. Kral Oidipus – Sofokles",
          "6. Medea – Euripides",
          "7. Ramayana – Valmiki",
          "8. Mahabharata – Vyasa",
          "9. Binbir Gece Masalları – Anonim",
          "10. Genji'nin Hikayesi – Murasaki Shikibu",
          "11. Şakuntala – Kalidasa",
          "12. Bostan ve Gülistan – Şeyh Sadi-i Şirazi",
          "13. Mesnevi – Mevlana Celaleddin Rumi",
          "14. Eyüb’ün Kitabı (Kutsal Kitap'tan) – Anonim",
          "15. Njal’ın Sagası – Anonim"
        ]
      },
      {
        title: "Rönesans'tan 18. Yüzyıla",
        books: [
          "16. İlahi Komedya – Dante Alighieri",
          "17. Decameron – Giovanni Boccaccio",
          "18. Canterbury Hikayeleri – Geoffrey Chaucer",
          "19. Gargantua ve Pantagruel – François Rabelais",
          "20. Denemeler – Michel de Montaigne",
          "21. Don Kişot – Miguel de Cervantes",
          "22. Hamlet – William Shakespeare",
          "23. Kral Lear – William Shakespeare",
          "24. Othello – William Shakespeare",
          "25. Gulliver’in Gezileri – Jonathan Swift",
          "26. Tristram Shandy – Laurence Sterne",
          "27. Tehlikeli İlişkiler – Pierre Choderlos de Laclos",
          "28. Kaderci Jacques ve Efendisi – Denis Diderot",
          "29. Faust – Johann Wolfgang von Goethe"
        ]
      },
      {
        title: "19. Yüzyıl Klasikleri",
        books: [
          "30. Gurur ve Önyargı – Jane Austen",
          "31. Kırmızı ve Siyah – Stendhal",
          "32. Goriot Baba – Honoré de Balzac",
          "33. Ölü Canlar – Nikolay Gogol",
          "34. Moby Dick – Herman Melville",
          "35. Madam Bovary – Gustave Flaubert",
          "36. Duygusal Eğitim – Gustave Flaubert",
          "37. Savaş ve Barış – Lev Tolstoy",
          "38. Anna Karenina – Lev Tolstoy",
          "39. İvan İlyiç’in Ölümü – Lev Tolstoy",
          "40. Suç ve Ceza – Fyodor Dostoyevski",
          "41. Karamazov Kardeşler – Fyodor Dostoyevski",
          "42. Budala – Fyodor Dostoyevski",
          "43. Ecinniler – Fyodor Dostoyevski",
          "44. Büyük Umutlar – Charles Dickens",
          "45. Middlemarch – George Eliot",
          "46. Bir Bebek Evi – Henrik İbsen",
          "47. Huckleberry Finn’in Maceraları – Mark Twain",
          "48. Anton Çehov'un Öyküleri – Anton Çehov",
          "49. Açlık – Knut Hamsun"
        ]
      },
      {
        title: "20. Yüzyıl Modern Klasikleri",
        books: [
          "50. Yabancı – Albert Camus",
          "51. Veba – Albert Camus",
          "52. Kayıp Zamanın İzinde – Marcel Proust",
          "53. Ulysses – James Joyce",
          "54. Mrs. Dalloway – Virginia Woolf",
          "55. Deniz Feneri – Virginia Woolf",
          "56. Dönüşüm – Franz Kafka",
          "57. Dava – Franz Kafka",
          "58. Şato – Franz Kafka",
          "59. Büyülü Dağ – Thomas Mann",
          "60. Buddenbrooklar – Thomas Mann",
          "61. Ses ve Öfke – William Faulkner",
          "62. Absalom, Absalom! – William Faulkner",
          "63. Yaşlı Adam ve Deniz – Ernest Hemingway",
          "64. 1984 – George Orwell",
          "65. Lolita – Vladimir Nabokov",
          "66. Görünmez Adam – Ralph Ellison",
          "67. Beklerken – Samuel Beckett (Godot'yu Beklerken)",
          "68. Satranç – Stefan Zweig",
          "69. Berlin Alexanderplatz – Alfred Döblin",
          "70. Çimenlerin Yaprakları – Walt Whitman",
          "71. Fernando Pessoa'nın Şiirleri – Fernando Pessoa",
          "72. Çorak Ülke – T.S. Eliot",
          "73. Federico Garcia Lorca'nın Şiirleri – Federico Garcia Lorca",
          "74. Paul Celan'ın Şiirleri – Paul Celan",
          "75. Zeno'nun Bilinci – Italo Svevo",
          "76. Niteliksiz Adam – Robert Musil",
          "77. Hadrianus’un Anıları – Marguerite Yourcenar"
        ]
      },
      {
        title: "Çağdaş Dönem ve Büyülü Gerçekçilik",
        books: [
          "78. Yüzyıllık Yalnızlık – Gabriel Garcia Marquez",
          "79. Kolera Günlerinde Aşk – Gabriel Garcia Marquez",
          "80. Alef – Jorge Luis Borges",
          "81. Ficciones (Hayaller ve Hikayeler) – Jorge Luis Borges",
          "82. Pedro Paramo – Juan Rulfo",
          "83. Sevilen (Beloved) – Toni Morrison",
          "84. Parçalanma – Chinua Achebe",
          "85. Geceyarısı Çocukları – Salman Rushdie",
          "86. Teneke Trampet – Günter Grass",
          "87. Körlük – José Saramago",
          "88. Kuzeye Göç Mevsimi – Tayeb Salih",
          "89. Kahire Üçlemesi – Necib Mahfuz",
          "90. Altın Defter – Doris Lessing"
        ]
      },
      {
        title: "Diğer Önemli Eserler",
        books: [
          "91. Yabancı (The Outsider) – Natsume Soseki (Kokoro)",
          "92. Dağun Sesi – Yasunari Kawabata",
          "93. Deli Adamın Güncesi – Lu Xun",
          "94. Tutunamayanlar – Oğuz Atay",
          "95. Pippi Uzunçorap – Astrid Lindgren",
          "96. Masallar – Hans Christian Andersen",
          "97. Zorba – Nikos Kazancakis",
          "98. Çingene Romansları – Federico Garcia Lorca",
          "99. Lirikler – Giacomo Leopardi",
          "100. Tarih – Elsa Morante"
        ]
      }
    ],
    en: [
      {
        title: "Ancient Age & Epics",
        books: [
          "1. Epic of Gilgamesh – Anonymous",
          "2. Iliad – Homer",
          "3. Odyssey – Homer",
          "4. Aeneid – Virgil",
          "5. Oedipus the King – Sophocles",
          "6. Medea – Euripides",
          "7. Ramayana – Valmiki",
          "8. Mahabharata – Vyasa",
          "9. One Thousand and One Nights – Anonymous",
          "10. The Tale of Genji – Murasaki Shikibu",
          "11. Shakuntala – Kalidasa",
          "12. Bustan & Gulistan – Saadi Shirazi",
          "13. Masnavi – Rumi",
          "14. Book of Job – Anonymous",
          "15. Njal's Saga – Anonymous"
        ]
      },
      {
        title: "Renaissance to 18th Century",
        books: [
          "16. Divine Comedy – Dante Alighieri",
          "17. The Decameron – Giovanni Boccaccio",
          "18. The Canterbury Tales – Geoffrey Chaucer",
          "19. Gargantua and Pantagruel – François Rabelais",
          "20. Essays – Michel de Montaigne",
          "21. Don Quixote – Miguel de Cervantes",
          "22. Hamlet – William Shakespeare",
          "23. King Lear – William Shakespeare",
          "24. Othello – William Shakespeare",
          "25. Gulliver's Travels – Jonathan Swift",
          "26. Tristram Shandy – Laurence Sterne",
          "27. Dangerous Liaisons – Pierre Choderlos de Laclos",
          "28. Jacques the Fatalist – Denis Diderot",
          "29. Faust – Johann Wolfgang von Goethe"
        ]
      },
      {
        title: "19th Century Classics",
        books: [
          "30. Pride and Prejudice – Jane Austen",
          "31. The Red and the Black – Stendhal",
          "32. Père Goriot – Honoré de Balzac",
          "33. Dead Souls – Nikolai Gogol",
          "34. Moby-Dick – Herman Melville",
          "35. Madame Bovary – Gustave Flaubert",
          "36. Sentimental Education – Gustave Flaubert",
          "37. War and Peace – Leo Tolstoy",
          "38. Anna Karenina – Leo Tolstoy",
          "39. The Death of Ivan Ilyich – Leo Tolstoy",
          "40. Crime and Punishment – Fyodor Dostoevsky",
          "41. The Brothers Karamazov – Fyodor Dostoevsky",
          "42. The Idiot – Fyodor Dostoevsky",
          "43. Demons – Fyodor Dostoevsky",
          "44. Great Expectations – Charles Dickens",
          "45. Middlemarch – George Eliot",
          "46. A Doll's House – Henrik Ibsen",
          "47. Adventures of Huckleberry Finn – Mark Twain",
          "48. Stories of Anton Chekhov – Anton Chekhov",
          "49. Hunger – Knut Hamsun"
        ]
      },
      {
        title: "20th Century Modern Classics",
        books: [
          "50. The Stranger – Albert Camus",
          "51. The Plague – Albert Camus",
          "52. In Search of Lost Time – Marcel Proust",
          "53. Ulysses – James Joyce",
          "54. Mrs. Dalloway – Virginia Woolf",
          "55. To the Lighthouse – Virginia Woolf",
          "56. The Metamorphosis – Franz Kafka",
          "57. The Trial – Franz Kafka",
          "58. The Castle – Franz Kafka",
          "59. The Magic Mountain – Thomas Mann",
          "60. Buddenbrooks – Thomas Mann",
          "61. The Sound and the Fury – William Faulkner",
          "62. Absalom, Absalom! – William Faulkner",
          "63. The Old Man and the Sea – Ernest Hemingway",
          "64. 1984 – George Orwell",
          "65. Lolita – Vladimir Nabokov",
          "66. Invisible Man – Ralph Ellison",
          "67. Waiting for Godot – Samuel Beckett",
          "68. Chess Story – Stefan Zweig",
          "69. Berlin Alexanderplatz – Alfred Döblin",
          "70. Leaves of Grass – Walt Whitman",
          "71. Poems of Fernando Pessoa – Fernando Pessoa",
          "72. The Waste Land – T.S. Eliot",
          "73. Poems of Federico Garcia Lorca – Federico Garcia Lorca",
          "74. Poems of Paul Celan – Paul Celan",
          "75. Zeno's Conscience – Italo Svevo",
          "76. The Man Without Qualities – Robert Musil",
          "77. Memoirs of Hadrian – Marguerite Yourcenar"
        ]
      },
      {
        title: "Contemporary & Magical Realism",
        books: [
          "78. One Hundred Years of Solitude – Gabriel Garcia Marquez",
          "79. Love in the Time of Cholera – Gabriel Garcia Marquez",
          "80. The Aleph – Jorge Luis Borges",
          "81. Fictions – Jorge Luis Borges",
          "82. Pedro Páramo – Juan Rulfo",
          "83. Beloved – Toni Morrison",
          "84. Things Fall Apart – Chinua Achebe",
          "85. Midnight's Children – Salman Rushdie",
          "86. The Tin Drum – Günter Grass",
          "87. Blindness – José Saramago",
          "88. Season of Migration to the North – Tayeb Salih",
          "89. Cairo Trilogy – Naguib Mahfouz",
          "90. The Golden Notebook – Doris Lessing"
        ]
      },
      {
        title: "Other Important Works",
        books: [
          "91. Kokoro – Natsume Soseki",
          "92. The Sound of the Mountain – Yasunari Kawabata",
          "93. A Madman's Diary – Lu Xun",
          "94. The Disconnected – Oğuz Atay",
          "95. Pippi Longstocking – Astrid Lindgren",
          "96. Fairy Tales – Hans Christian Andersen",
          "97. Zorba the Greek – Nikos Kazantzakis",
          "98. Gypsy Ballads – Federico Garcia Lorca",
          "99. Leopardi's Poems – Giacomo Leopardi",
          "100. History – Elsa Morante"
        ]
      }
    ],
    fr: [
      {
        title: "Antiquité et Épopées",
        books: [
          "1. L'Épopée de Gilgamesh – Anonyme",
          "2. L'Iliade – Homère",
          "3. L'Odyssée – Homère",
          "4. L'Énéide – Virgile",
          "5. Œdipe roi – Sophocle",
          "6. Médée – Euripide",
          "7. Ramayana – Valmiki",
          "8. Mahabharata – Vyasa",
          "9. Les Mille et Une Nuits – Anonyme",
          "10. Le Dit du Genji – Murasaki Shikibu",
          "11. La Reconnaissance de Shâkountalâ – Kalidasa",
          "12. Le Bustan et Le Golestan – Saadi Shirazi",
          "13. Masnavi – Rumi",
          "14. Livre de Job – Anonyme",
          "15. La Saga de Njal – Anonyme"
        ]
      },
      {
        title: "Renaissance au 18ème Siècle",
        books: [
          "16. La Divine Comédie – Dante Alighieri",
          "17. Le Décaméron – Giovanni Boccaccio",
          "18. Les Contes de Canterbury – Geoffrey Chaucer",
          "19. Gargantua et Pantagruel – François Rabelais",
          "20. Essais – Michel de Montaigne",
          "21. Don Quichotte – Miguel de Cervantes",
          "22. Hamlet – William Shakespeare",
          "23. Le Roi Lear – William Shakespeare",
          "24. Othello – William Shakespeare",
          "25. Les Voyages de Gulliver – Jonathan Swift",
          "26. Vie et opinions de Tristram Shandy – Laurence Sterne",
          "27. Les Liaisons dangereuses – Pierre Choderlos de Laclos",
          "28. Jacques le Fataliste – Denis Diderot",
          "29. Faust – Johann Wolfgang von Goethe"
        ]
      },
      {
        title: "Classiques du 19ème Siècle",
        books: [
          "30. Orgueil et Préjugés – Jane Austen",
          "31. Le Rouge et le Noir – Stendhal",
          "32. Le Père Goriot – Honoré de Balzac",
          "33. Les Âmes mortes – Nicolas Gogol",
          "34. Moby Dick – Herman Melville",
          "35. Madame Bovary – Gustave Flaubert",
          "36. L'Éducation sentimentale – Gustave Flaubert",
          "37. Guerre et Paix – Léon Tolstoï",
          "38. Anna Karénine – Léon Tolstoï",
          "39. La Mort d'Ivan Ilitch – Léon Tolstoï",
          "40. Crime et Châtiment – Fiodor Dostoïevski",
          "41. Les Frères Karamazov – Fiodor Dostoïevski",
          "42. L'Idiot – Fiodor Dostoïevski",
          "43. Les Possédés – Fiodor Dostoïevski",
          "44. Les Grandes Espérances – Charles Dickens",
          "45. Middlemarch – George Eliot",
          "46. Une maison de poupée – Henrik Ibsen",
          "47. Les Aventures de Huckleberry Finn – Mark Twain",
          "48. Nouvelles – Anton Tchekhov",
          "49. La Faim – Knut Hamsun"
        ]
      },
      {
        title: "Classiques Modernes du 20ème",
        books: [
          "50. L'Étranger – Albert Camus",
          "51. La Peste – Albert Camus",
          "52. À la recherche du temps perdu – Marcel Proust",
          "53. Ulysse – James Joyce",
          "54. Mrs Dalloway – Virginia Woolf",
          "55. La Promenade au phare – Virginia Woolf",
          "56. La Métamorphose – Franz Kafka",
          "57. Le Procès – Franz Kafka",
          "58. Le Château – Franz Kafka",
          "59. La Montagne magique – Thomas Mann",
          "60. Les Buddenbrook – Thomas Mann",
          "61. Le Bruit et la Fureur – William Faulkner",
          "62. Absalon, Absalon! – William Faulkner",
          "63. Le Vieil Homme et la Mer – Ernest Hemingway",
          "64. 1984 – George Orwell",
          "65. Lolita – Vladimir Nabokov",
          "66. Homme invisible, pour qui chantes-tu ? – Ralph Ellison",
          "67. En attendant Godot – Samuel Beckett",
          "68. Le Joueur d'échecs – Stefan Zweig",
          "69. Berlin Alexanderplatz – Alfred Döblin",
          "70. Feuilles d'herbe – Walt Whitman",
          "71. Poèmes – Fernando Pessoa",
          "72. La Terre vaine – T.S. Eliot",
          "73. Romancero gitan – Federico Garcia Lorca",
          "74. Poèmes – Paul Celan",
          "75. La Conscience de Zeno – Italo Svevo",
          "76. L'Homme sans qualités – Robert Musil",
          "77. Mémoires d'Hadrien – Marguerite Yourcenar"
        ]
      },
      {
        title: "Contemporain et Réalisme Magique",
        books: [
          "78. Cent ans de solitude – Gabriel Garcia Marquez",
          "79. L'Amour aux temps du choléra – Gabriel Garcia Marquez",
          "80. L'Aleph – Jorge Luis Borges",
          "81. Fictions – Jorge Luis Borges",
          "82. Pedro Paramo – Juan Rulfo",
          "83. Beloved – Toni Morrison",
          "84. Le monde s'effondre – Chinua Achebe",
          "85. Les Enfants de minuit – Salman Rushdie",
          "86. Le Tambour – Günter Grass",
          "87. L'Aveuglement – José Saramago",
          "88. Saison de la migration vers le nord – Tayeb Salih",
          "89. L'Impasse des deux palais – Naguib Mahfouz",
          "90. Le Carnet d'or – Doris Lessing"
        ]
      },
      {
        title: "Autres Œuvres Importantes",
        books: [
          "91. Le Pauvre Cœur des hommes – Natsume Soseki",
          "92. Le Grondement de la montagne – Yasunari Kawabata",
          "93. Le Journal d'un fou – Lu Xun",
          "94. Tutunamayanlar (Les Déconnectés) – Oğuz Atay",
          "95. Fifi Brindacier – Astrid Lindgren",
          "96. Contes – Hans Christian Andersen",
          "97. Alexis Zorba – Nikos Kazancakis",
          "98. Romancero gitan – Federico Garcia Lorca",
          "99. Canti – Giacomo Leopardi",
          "100. La Storia – Elsa Morante"
        ]
      }
    ],
    it: [
      {
        title: "Antichità ed Epica",
        books: [
          "1. Epopea di Gilgamesh – Anonimo",
          "2. Iliade – Omero",
          "3. Odissea – Omero",
          "4. Eneide – Virgilio",
          "5. Edipo re – Sofocle",
          "6. Medea – Euripide",
          "7. Ramayana – Valmiki",
          "8. Mahabharata – Vyasa",
          "9. Le mille e una notte – Anonimo",
          "10. Storia di Genji – Murasaki Shikibu",
          "11. Il riconoscimento di Sakuntala – Kalidasa",
          "12. Bustan & Gulistan – Saadi Shirazi",
          "13. Masnavi – Rumi",
          "14. Libro di Giobbe – Anonimo",
          "15. Njáls saga – Anonimo"
        ]
      },
      {
        title: "Dal Rinascimento al XVIII Secolo",
        books: [
          "16. Divina Commedia – Dante Alighieri",
          "17. Decameron – Giovanni Boccaccio",
          "18. I racconti di Canterbury – Geoffrey Chaucer",
          "19. Gargantua e Pantagruel – François Rabelais",
          "20. Saggi – Michel de Montaigne",
          "21. Don Chisciotte – Miguel de Cervantes",
          "22. Amleto – William Shakespeare",
          "23. Re Lear – William Shakespeare",
          "24. Otello – William Shakespeare",
          "25. I viaggi di Gulliver – Jonathan Swift",
          "26. Vita e opinioni di Tristram Shandy – Laurence Sterne",
          "27. Le relazioni pericolose – Pierre Choderlos de Laclos",
          "28. Jacques il fatalista – Denis Diderot",
          "29. Faust – Johann Wolfgang von Goethe"
        ]
      },
      {
        title: "Classici del XIX Secolo",
        books: [
          "30. Orgoglio e pregiudizio – Jane Austen",
          "31. Il rosso e il nero – Stendhal",
          "32. Papà Goriot – Honoré de Balzac",
          "33. Le anime morte – Nikolaj Gogol",
          "34. Moby Dick – Herman Melville",
          "35. Madame Bovary – Gustave Flaubert",
          "36. L'educazione sentimentale – Gustave Flaubert",
          "37. Guerra e pace – Lev Tolstoj",
          "38. Anna Karenina – Lev Tolstoj",
          "39. La morte di Ivan Il'ič – Lev Tolstoj",
          "40. Delitto e castigo – Fëdor Dostoevskij",
          "41. I fratelli Karamazov – Fëdor Dostoevskij",
          "42. L'idiota – Fëdor Dostoevskij",
          "43. I demoni – Fëdor Dostoevskij",
          "44. Grandi speranze – Charles Dickens",
          "45. Middlemarch – George Eliot",
          "46. Casa di bambola – Henrik Ibsen",
          "47. Le avventure di Huckleberry Finn – Mark Twain",
          "48. Racconti – Anton Čechov",
          "49. Fame – Knut Hamsun"
        ]
      },
      {
        title: "Classici Moderni del XX Secolo",
        books: [
          "50. Lo straniero – Albert Camus",
          "51. La peste – Albert Camus",
          "52. Alla ricerca del tempo perduto – Marcel Proust",
          "53. Ulisse – James Joyce",
          "54. La signora Dalloway – Virginia Woolf",
          "55. Gita al faro – Virginia Woolf",
          "56. La metamorfosi – Franz Kafka",
          "57. Il processo – Franz Kafka",
          "58. Il castello – Franz Kafka",
          "59. La montagna incantata – Thomas Mann",
          "60. I Buddenbrook – Thomas Mann",
          "61. L'urlo e il furore – William Faulkner",
          "62. Assalonne, Assalonne! – William Faulkner",
          "63. Il vecchio e il mare – Ernest Hemingway",
          "64. 1984 – George Orwell",
          "65. Lolita – Vladimir Nabokov",
          "66. Uomo invisibile – Ralph Ellison",
          "67. Aspettando Godot – Samuel Beckett",
          "68. Novella degli scacchi – Stefan Zweig",
          "69. Berlin Alexanderplatz – Alfred Döblin",
          "70. Foglie d'erba – Walt Whitman",
          "71. Poesie – Fernando Pessoa",
          "72. La terra desolata – T.S. Eliot",
          "73. Romancero gitano – Federico Garcia Lorca",
          "74. Poesie – Paul Celan",
          "75. La coscienza di Zeno – Italo Svevo",
          "76. L'uomo senza qualità – Robert Musil",
          "77. Memorie di Adriano – Marguerite Yourcenar"
        ]
      },
      {
        title: "Contemporaneo e Realismo Magico",
        books: [
          "78. Cent'anni di solitudine – Gabriel Garcia Marquez",
          "79. L'amore ai tempi del colera – Gabriel Garcia Marquez",
          "80. L'Aleph – Jorge Luis Borges",
          "81. Finzioni – Jorge Luis Borges",
          "82. Pedro Páramo – Juan Rulfo",
          "83. Amatissima – Toni Morrison",
          "84. Il crollo – Chinua Achebe",
          "85. I figli della mezzanotte – Salman Rushdie",
          "86. Il tamburo di latta – Günter Grass",
          "87. Cecità – José Saramago",
          "88. La stagione della migrazione a Nord – Tayeb Salih",
          "89. Trilogia del Cairo – Naguib Mahfouz",
          "90. Il taccuino d'oro – Doris Lessing"
        ]
      },
      {
        title: "Altre Opere Importanti",
        books: [
          "91. Il cuore delle cose – Natsume Soseki",
          "92. Il suono della montagna – Yasunari Kawabata",
          "93. Diario di un pazzo – Lu Xun",
          "94. Tutunamayanlar (Gli sconnessi) – Oğuz Atay",
          "95. Pippi Calzelunghe – Astrid Lindgren",
          "96. Fiabe – Hans Christian Andersen",
          "97. Zorba il greco – Nikos Kazantzakis",
          "98. Romancero gitano – Federico Garcia Lorca",
          "99. Canti – Giacomo Leopardi",
          "100. La Storia – Elsa Morante"
        ]
      }
    ],
    de: [
      {
        title: "Antike und Epen",
        books: [
          "1. Gilgamesch-Epos – Anonym",
          "2. Ilias – Homer",
          "3. Odyssee – Homer",
          "4. Aeneis – Vergil",
          "5. König Ödipus – Sophokles",
          "6. Medea – Euripides",
          "7. Ramayana – Valmiki",
          "8. Mahabharata – Vyasa",
          "9. Tausendundeine Nacht – Anonym",
          "10. Die Geschichte vom Prinzen Genji – Murasaki Shikibu",
          "11. Shakuntala – Kalidasa",
          "12. Bustan & Gulistan – Saadi Shirazi",
          "13. Masnavi – Rumi",
          "14. Ijob – Anonym",
          "15. Njáls saga – Anonym"
        ]
      },
      {
        title: "Renaissance bis 18. Jh.",
        books: [
          "16. Göttliche Komödie – Dante Alighieri",
          "17. Decamerone – Giovanni Boccaccio",
          "18. Canterbury Tales – Geoffrey Chaucer",
          "19. Gargantua und Pantagruel – François Rabelais",
          "20. Essais – Michel de Montaigne",
          "21. Don Quijote – Miguel de Cervantes",
          "22. Hamlet – William Shakespeare",
          "23. König Lear – William Shakespeare",
          "24. Othello – William Shakespeare",
          "25. Gullivers Reisen – Jonathan Swift",
          "26. Tristram Shandy – Laurence Sterne",
          "27. Gefährliche Liebschaften – Pierre Choderlos de Laclos",
          "28. Jakob der Fatalist und sein Herr – Denis Diderot",
          "29. Faust – Johann Wolfgang von Goethe"
        ]
      },
      {
        title: "Klassiker des 19. Jh.",
        books: [
          "30. Stolz und Vorurteil – Jane Austen",
          "31. Rot und Schwarz – Stendhal",
          "32. Vater Goriot – Honoré de Balzac",
          "33. Die toten Seelen – Nikolai Gogol",
          "34. Moby-Dick – Herman Melville",
          "35. Madame Bovary – Gustave Flaubert",
          "36. Die Erziehung der Gefühle – Gustave Flaubert",
          "37. Krieg und Frieden – Leo Tolstoi",
          "38. Anna Karenina – Leo Tolstoi",
          "39. Der Tod des Iwan Iljitsch – Leo Tolstoi",
          "40. Schuld und Sühne – Fjodor Dostojewski",
          "41. Die Brüder Karamasow – Fjodor Dostojewski",
          "42. Der Idiot – Fjodor Dostojewski",
          "43. Die Dämonen – Fjodor Dostojewski",
          "44. Große Erwartungen – Charles Dickens",
          "45. Middlemarch – George Eliot",
          "46. Nora oder Ein Puppenheim – Henrik Ibsen",
          "47. Die Abenteuer des Huckleberry Finn – Mark Twain",
          "48. Erzählungen – Anton Tschechow",
          "49. Hunger – Knut Hamsun"
        ]
      },
      {
        title: "Moderne Klassiker des 20. Jh.",
        books: [
          "50. Der Fremde – Albert Camus",
          "51. Die Pest – Albert Camus",
          "52. Auf der Suche nach der verlorenen Zeit – Marcel Proust",
          "53. Ulysses – James Joyce",
          "54. Mrs. Dalloway – Virginia Woolf",
          "55. Zum Leuchtturm – Virginia Woolf",
          "56. Die Verwandlung – Franz Kafka",
          "57. Der Process – Franz Kafka",
          "58. Das Schloss – Franz Kafka",
          "59. Der Zauberberg – Thomas Mann",
          "60. Buddenbrooks – Thomas Mann",
          "61. Schall und Wahn – William Faulkner",
          "62. Absalom, Absalom! – William Faulkner",
          "63. Der alte Mann und das Meer – Ernest Hemingway",
          "64. 1984 – George Orwell",
          "65. Lolita – Vladimir Nabokov",
          "66. Der unsichtbare Mann – Ralph Ellison",
          "67. Warten auf Godot – Samuel Beckett",
          "68. Schachnovelle – Stefan Zweig",
          "69. Berlin Alexanderplatz – Alfred Döblin",
          "70. Grashalme – Walt Whitman",
          "71. Gedichte – Fernando Pessoa",
          "72. Das wüste Land – T.S. Eliot",
          "73. Zigeunerromanzen – Federico Garcia Lorca",
          "74. Gedichte – Paul Celan",
          "75. Zenos Gewissen – Italo Svevo",
          "76. Der Mann ohne Eigenschaften – Robert Musil",
          "77. Ich zähmte die Wölfin: Die Erinnerungen des Kaisers Hadrian – Marguerite Yourcenar"
        ]
      },
      {
        title: "Zeitgenössisch & Magischer Realismus",
        books: [
          "78. Hundert Jahre Einsamkeit – Gabriel Garcia Marquez",
          "79. Die Liebe in den Zeiten der Cholera – Gabriel Garcia Marquez",
          "80. Das Aleph – Jorge Luis Borges",
          "81. Fiktionen – Jorge Luis Borges",
          "82. Pedro Páramo – Juan Rulfo",
          "83. Menschenkind – Toni Morrison",
          "84. Alles zerfällt – Chinua Achebe",
          "85. Mitternachtskinder – Salman Rushdie",
          "86. Die Blechtrommel – Günter Grass",
          "87. Die Stadt der Blinden – José Saramago",
          "88. Zeit der Nordwanderung – Tayeb Salih",
          "89. Kairo-Trilogie – Naguib Mahfouz",
          "90. Das goldene Notizbuch – Doris Lessing"
        ]
      },
      {
        title: "Andere wichtige Werke",
        books: [
          "91. Kokoro – Natsume Soseki",
          "92. Ein Kirschbaum im Winter – Yasunari Kawabata",
          "93. Tagebuch eines Verrückten – Lu Xun",
          "94. Die Haltlosen (Tutunamayanlar) – Oğuz Atay",
          "95. Pippi Langstrumpf – Astrid Lindgren",
          "96. Märchen – Hans Christian Andersen",
          "97. Alexis Sorbas – Nikos Kazantzakis",
          "98. Zigeunerromanzen – Federico Garcia Lorca",
          "99. Gesänge (Canti) – Giacomo Leopardi",
          "100. La Storia – Elsa Morante"
        ]
      }
    ]
  };

  const sections = SECTIONS_DATA[language];

  // Helper to parse "1. Book Name – Author"
  const parseBookString = (str: string) => {
    const splitIndex = str.indexOf(" – ");
    if (splitIndex === -1) {
        // Fallback if formatting is unexpected
        return { number: "0", title: str, author: "" };
    }
    const part1 = str.substring(0, splitIndex); // "1. Book Name"
    const author = str.substring(splitIndex + 3); // "Author"
    
    const dotIndex = part1.indexOf(". ");
    const number = part1.substring(0, dotIndex);
    const title = part1.substring(dotIndex + 2);

    return { number, title, author };
  };

  const totalRead = markedAsRead.length;
  const progressPercentage = (totalRead / 100) * 100;

  // Filter sections based on search query
  const filteredSections = sections.map(section => ({
    ...section,
    books: section.books.filter(bookStr => {
        const q = searchQuery.toLowerCase();
        return bookStr.toLowerCase().includes(q);
    })
  })).filter(section => section.books.length > 0);

  const handleCloseSearch = () => {
      setIsSearchOpen(false);
      setSearchQuery('');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1.5rem)] shadow-sm">
        {isSearchOpen ? (
          <div className="flex flex-1 items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
            <button 
              onClick={handleCloseSearch}
              className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="material-symbols-outlined text-zinc-600 dark:text-zinc-300">arrow_back</span>
            </button>
            <div className="relative flex-1">
              <input 
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search_placeholder}
                className="w-full h-10 pl-4 pr-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-white placeholder:text-zinc-500 text-sm"
              />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold flex-1 text-left">{t.list_100_title}</h1>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl text-zinc-900 dark:text-white">search</span>
            </button>
          </>
        )}
      </header>

      <main className="flex-1 pb-24">
        <div className="p-4 space-y-6">
          
          {/* Progress Card (Hide during search to reduce clutter) */}
          {!isSearchOpen && (
            <div className="bg-card-dark rounded-xl p-5 border border-zinc-800 shadow-md">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-white font-bold">{t.general_progress}</span>
                    <span className="text-primary font-bold">{totalRead}/100</span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
          )}

          {!isSearchOpen && (
             <div className="bg-primary/10 dark:bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 italic">
                    {t.list_100_desc}
                </p>
             </div>
          )}

          {filteredSections.length > 0 ? (
             filteredSections.map((section, idx) => (
                <div key={idx} className="relative">
                <h2 className="static bg-background-light dark:bg-background-dark py-3 text-lg font-bold text-primary border-b border-zinc-100 dark:border-zinc-800/50 mb-2">
                    {section.title}
                </h2>
                <div className="flex flex-col gap-2">
                    {section.books.map((bookStr, bIdx) => {
                    const { number, title, author } = parseBookString(bookStr);
                    const isRead = markedAsRead.includes(number);

                    return (
                        <div 
                        key={bIdx} 
                        onClick={() => toggleBook(number)}
                        className={`group flex items-start gap-3 p-3 rounded-xl border shadow-sm transition-all cursor-pointer active:scale-[0.98] ${
                            isRead 
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-500/30 shadow-green-500/5' 
                            : 'bg-white dark:bg-card-dark border-zinc-200 dark:border-zinc-800 hover:shadow-md'
                        }`}
                        >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                            isRead 
                            ? 'bg-green-500 text-white' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}>
                            {isRead ? (
                                <span className="material-symbols-outlined text-lg">check</span>
                            ) : (
                                number
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-semibold transition-colors ${
                                isRead 
                                ? 'text-green-700 dark:text-green-400 line-through decoration-green-500/50 decoration-2' 
                                : 'text-zinc-900 dark:text-zinc-100 group-hover:text-primary'
                            }`}>
                            {title}
                            </span>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {author}
                            </span>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
             ))
          ) : (
             <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-600 mb-4">search_off</span>
                <p className="text-zinc-900 dark:text-white font-medium text-lg">{t.not_found}</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  {t.empty_state_desc}
                </p>
             </div>
          )}
        </div>
      </main>

       {/* Bottom Navigation */}
       <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-background-light/95 dark:bg-[#101922]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 h-20 z-40 pb-safe">
        <button 
          onClick={() => onNavClick('dashboard')}
          className="flex flex-col items-center justify-center gap-1 w-20 text-zinc-500 dark:text-zinc-500 hover:text-primary dark:hover:text-white transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[10px] font-medium">{t.nav_home}</span>
        </button>

        <button 
          onClick={() => onNavClick('reading-list-100')}
          className="relative -top-4 active:scale-95 transition-transform"
        >
           <div className="flex flex-col items-center justify-center h-16 w-16 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-transform border-4 border-background-light dark:border-background-dark">
              <span className="text-xl font-black leading-none tracking-tighter">100</span>
              <span className="text-[8px] font-bold uppercase tracking-wide opacity-80 mt-0.5">{t.nav_list}</span>
           </div>
        </button>

        <button 
          onClick={() => onNavClick('stats')} 
          className="flex flex-col items-center justify-center gap-1 w-20 text-zinc-500 dark:text-zinc-500 hover:text-primary dark:hover:text-white transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">emoji_events</span>
          <span className="text-[10px] font-medium">{t.nav_stats}</span>
        </button>
      </nav>
    </div>
  );
};

export default ReadingList100;