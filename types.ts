
export type ReadingStatus = 'reading' | 'read' | 'want-to-read';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: ReadingStatus;
  rating: number; // 0-5
  year?: number;
  genre?: string;
  description?: string;
  startDate?: string;
  finishDate?: string;
  notes?: string;
  notesLastUpdated?: string;
  isFavorite?: boolean;
  totalPages?: number;
  currentPage?: number;
}

export type ViewState = 'login' | 'dashboard' | 'add' | 'details' | 'stats' | 'reading-list-100' | 'settings' | 'import';

export type TabType = ReadingStatus;

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
  isLocked: boolean;
}

export type LanguageCode = 'tr' | 'en' | 'fr' | 'it' | 'de';

export interface Translation {
  // General
  back: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  close: string;
  search_placeholder: string;
  not_found: string;
  
  // Login
  welcome: string;
  welcome_subtitle: string;
  enter_name: string;
  login_button: string;
  select_language: string;

  // Dashboard
  my_library: string; // Used for "Ahmet's Library" suffix logic
  tab_reading: string;
  tab_read: string;
  tab_want_to_read: string;
  sort_newest: string;
  sort_oldest: string;
  sort_az: string;
  filter_favorites: string;
  empty_state_title: string;
  empty_state_desc: string;
  book_count_label: string;

  // Add Book
  add_book_title: string;
  cover_image: string;
  cover_placeholder: string;
  tap_to_upload: string;
  book_name: string;
  author: string;
  genre: string;
  page_count: string;
  publish_year: string;
  status: string;
  description: string;
  notes: string;
  notes_placeholder: string;
  genres: string[];

  // Details
  book_details: string;
  start_date: string;
  finish_date: string;
  progress: string;
  personal_notes: string;
  no_notes: string;
  no_desc: string;
  delete_confirm_title: string;
  delete_confirm_desc: string;
  delete_irreversible: string;
  page: string; // "sf" abbreviation or full
  update_progress: string;
  total_pages: string;
  date_format: string; // e.g. GG.AA.YYYY

  // Stats
  stats_title: string;
  streak_day: string;
  streak_active: string;
  streak_risk: string;
  today_read: string;
  completed: string;
  personal_goals: string;
  yearly_goal: string;
  yearly_goal_desc: string;
  daily_goal: string;
  daily_goal_desc: string;
  weekly_activity: string;
  chart_read: string;
  chart_goal: string;
  days_short: string[]; // ['Mon', 'Tue', ...]
  monthly_goals: string;
  monthly_report: string;
  books_read_count: string;
  favorite_genre: string;
  goal_2_books: string;
  goal_new_genre: string;
  goal_met_desc: string;
  goal_continue: string;
  
  // Onboarding questions
  onboarding_yearly_goal_question: string;
  onboarding_daily_goal_question: string;
  
  // Reading List 100
  list_100_title: string;
  general_progress: string;
  list_100_desc: string;

  // Settings
  settings_title: string;
  app_language: string;
  username: string;
  theme: string;
  about: string;
  version: string;
  
  // Navigation
  nav_home: string;
  nav_list: string;
  nav_stats: string;
  
  // Import
  import_title: string;
  import_isbn_tab: string;
  isbn_instructions: string;
  paste_isbns: string;
  fetch_books: string;
  books_found: string;
  import_success: string;
  import_btn: string;
  loading: string;
  remove: string;
}
