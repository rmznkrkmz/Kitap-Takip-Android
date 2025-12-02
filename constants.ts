
import { Book } from './types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverUrl: 'https://m.media-amazon.com/images/I/81gepf1eMqL._AC_UF1000,1000_QL80_.jpg',
    status: 'reading',
    rating: 4,
    year: 1960,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
    startDate: '2024-01-15'
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    coverUrl: 'https://m.media-amazon.com/images/I/71rpa1-kyvL._AC_UF1000,1000_QL80_.jpg',
    status: 'reading',
    rating: 5,
    year: 1949,
    description: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.'
  },
  {
    id: '3',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverUrl: 'https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg',
    status: 'read',
    rating: 4,
    year: 1925,
    startDate: '2023-11-01',
    finishDate: '2023-11-20',
    notes: 'A tragic story of love and the American Dream.'
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: 'https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg',
    status: 'want-to-read',
    rating: 0,
    year: 1813
  },
  {
    id: '5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    coverUrl: 'https://m.media-amazon.com/images/I/8125BDk3l9L._AC_UF1000,1000_QL80_.jpg',
    status: 'read',
    rating: 3,
    year: 1951
  },
  {
    id: '6',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    coverUrl: 'https://m.media-amazon.com/images/I/91D4YvdC0dL._AC_UF1000,1000_QL80_.jpg',
    status: 'reading',
    rating: 5,
    year: 1932
  }
];

export const TOP_100_BOOKS = [
  {
    category: "Antik Çağ ve Destanlar",
    books: [
      { title: "Gılgamış Destanı", author: "Anonim" },
      { title: "İlyada", author: "Homeros" },
      { title: "Odysseia", author: "Homeros" },
      { title: "Aeneis", author: "Vergilius" },
      { title: "Kral Oidipus", author: "Sofokles" },
      { title: "Medea", author: "Euripides" },
      { title: "Ramayana", author: "Valmiki" },
      { title: "Mahabharata", author: "Vyasa" },
      { title: "Binbir Gece Masalları", author: "Anonim" },
      { title: "Genji'nin Hikayesi", author: "Murasaki Shikibu" },
      { title: "Şakuntala", author: "Kalidasa" },
      { title: "Bostan ve Gülistan", author: "Şeyh Sadi-i Şirazi" },
      { title: "Mesnevi", author: "Mevlana Celaleddin Rumi" },
      { title: "Eyüb’ün Kitabı", author: "Anonim" },
      { title: "Njal’ın Sagası", author: "Anonim" }
    ]
  },
  {
    category: "Rönesans'tan 18. Yüzyıla",
    books: [
      { title: "İlahi Komedya", author: "Dante Alighieri" },
      { title: "Decameron", author: "Giovanni Boccaccio" },
      { title: "Canterbury Hikayeleri", author: "Geoffrey Chaucer" },
      { title: "Gargantua ve Pantagruel", author: "François Rabelais" },
      { title: "Denemeler", author: "Michel de Montaigne" },
      { title: "Don Kişot", author: "Miguel de Cervantes" },
      { title: "Hamlet", author: "William Shakespeare" },
      { title: "Kral Lear", author: "William Shakespeare" },
      { title: "Othello", author: "William Shakespeare" },
      { title: "Gulliver’in Gezileri", author: "Jonathan Swift" },
      { title: "Tristram Shandy", author: "Laurence Sterne" },
      { title: "Tehlikeli İlişkiler", author: "Pierre Choderlos de Laclos" },
      { title: "Kaderci Jacques ve Efendisi", author: "Denis Diderot" },
      { title: "Faust", author: "Johann Wolfgang von Goethe" }
    ]
  },
  {
    category: "19. Yüzyıl Klasikleri",
    books: [
      { title: "Gurur ve Önyargı", author: "Jane Austen" },
      { title: "Kırmızı ve Siyah", author: "Stendhal" },
      { title: "Goriot Baba", author: "Honoré de Balzac" },
      { title: "Ölü Canlar", author: "Nikolay Gogol" },
      { title: "Moby Dick", author: "Herman Melville" },
      { title: "Madam Bovary", author: "Gustave Flaubert" },
      { title: "Duygusal Eğitim", author: "Gustave Flaubert" },
      { title: "Savaş ve Barış", author: "Lev Tolstoy" },
      { title: "Anna Karenina", author: "Lev Tolstoy" },
      { title: "İvan İlyiç’in Ölümü", author: "Lev Tolstoy" },
      { title: "Suç ve Ceza", author: "Fyodor Dostoyevski" },
      { title: "Karamazov Kardeşler", author: "Fyodor Dostoyevski" },
      { title: "Budala", author: "Fyodor Dostoyevski" },
      { title: "Ecinniler", author: "Fyodor Dostoyevski" },
      { title: "Büyük Umutlar", author: "Charles Dickens" },
      { title: "Middlemarch", author: "George Eliot" },
      { title: "Bir Bebek Evi", author: "Henrik İbsen" },
      { title: "Huckleberry Finn’in Maceraları", author: "Mark Twain" },
      { title: "Anton Çehov'un Öyküleri", author: "Anton Çehov" },
      { title: "Açlık", author: "Knut Hamsun" }
    ]
  },
  {
    category: "20. Yüzyıl Modern Klasikleri",
    books: [
      { title: "Yabancı", author: "Albert Camus" },
      { title: "Veba", author: "Albert Camus" },
      { title: "Kayıp Zamanın İzinde", author: "Marcel Proust" },
      { title: "Ulysses", author: "James Joyce" },
      { title: "Mrs. Dalloway", author: "Virginia Woolf" },
      { title: "Deniz Feneri", author: "Virginia Woolf" },
      { title: "Dönüşüm", author: "Franz Kafka" },
      { title: "Dava", author: "Franz Kafka" },
      { title: "Şato", author: "Franz Kafka" },
      { title: "Büyülü Dağ", author: "Thomas Mann" },
      { title: "Buddenbrooklar", author: "Thomas Mann" },
      { title: "Ses ve Öfke", author: "William Faulkner" },
      { title: "Absalom, Absalom!", author: "William Faulkner" },
      { title: "Yaşlı Adam ve Deniz", author: "Ernest Hemingway" },
      { title: "1984", author: "George Orwell" },
      { title: "Lolita", author: "Vladimir Nabokov" },
      { title: "Görünmez Adam", author: "Ralph Ellison" },
      { title: "Beklerken (Godot'yu Beklerken)", author: "Samuel Beckett" },
      { title: "Satranç", author: "Stefan Zweig" },
      { title: "Berlin Alexanderplatz", author: "Alfred Döblin" },
      { title: "Çimenlerin Yaprakları", author: "Walt Whitman" },
      { title: "Fernando Pessoa'nın Şiirleri", author: "Fernando Pessoa" },
      { title: "Çorak Ülke", author: "T.S. Eliot" },
      { title: "Federico Garcia Lorca'nın Şiirleri", author: "Federico Garcia Lorca" },
      { title: "Paul Celan'ın Şiirleri", author: "Paul Celan" },
      { title: "Zeno'nun Bilinci", author: "Italo Svevo" },
      { title: "Niteliksiz Adam", author: "Robert Musil" },
      { title: "Hadrianus’un Anıları", author: "Marguerite Yourcenar" }
    ]
  },
  {
    category: "Çağdaş Dönem ve Büyülü Gerçekçilik",
    books: [
      { title: "Yüzyıllık Yalnızlık", author: "Gabriel Garcia Marquez" },
      { title: "Kolera Günlerinde Aşk", author: "Gabriel Garcia Marquez" },
      { title: "Alef", author: "Jorge Luis Borges" },
      { title: "Ficciones", author: "Jorge Luis Borges" },
      { title: "Pedro Paramo", author: "Juan Rulfo" },
      { title: "Sevilen", author: "Toni Morrison" },
      { title: "Parçalanma", author: "Chinua Achebe" },
      { title: "Geceyarısı Çocukları", author: "Salman Rushdie" },
      { title: "Teneke Trampet", author: "Günter Grass" },
      { title: "Körlük", author: "José Saramago" },
      { title: "Kuzeye Göç Mevsimi", author: "Tayeb Salih" },
      { title: "Kahire Üçlemesi", author: "Necib Mahfuz" },
      { title: "Altın Defter", author: "Doris Lessing" }
    ]
  },
  {
    category: "Diğer Önemli Eserler",
    books: [
      { title: "Yabancı (Kokoro)", author: "Natsume Soseki" },
      { title: "Dağın Sesi", author: "Yasunari Kawabata" },
      { title: "Deli Adamın Güncesi", author: "Lu Xun" },
      { title: "Tutunamayanlar", author: "Oğuz Atay" },
      { title: "Pippi Uzunçorap", author: "Astrid Lindgren" },
      { title: "Masallar", author: "Hans Christian Andersen" },
      { title: "Zorba", author: "Nikos Kazancakis" },
      { title: "Çingene Romansları", author: "Federico Garcia Lorca" },
      { title: "Lirikler", author: "Giacomo Leopardi" },
      { title: "Tarih", author: "Elsa Morante" }
    ]
  }
];
