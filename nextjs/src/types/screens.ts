export interface ScreensJSON {
  screens: Screen[];
}

export interface Screen {
  screen_title: string;
  screen_name: string;
  icon?: string;
  showInSidebar: boolean;
  screen_header?: ScreenHeader;
  components: Component[];
}

export interface DetailsScreen extends Screen {
  api_url: string;
  table_name: string;
  params?: DetailsFilter[];
}

export interface DetailsFilter {
  param_column: string;
  param_value: string | boolean | "id";
}
export interface BaseScreenHeader {
  file_name: string;
}

export type ScreenHeader = Header;

export interface Header extends BaseScreenHeader {
  file_name: "page-header";
  title?: string;
  back_btn_href?: string;
}

export interface BaseComponent {
  file_name: string;
}

export type Component =
  | StaticCardsComponent
  | DynamicCardsComponent
  | FormComponent
  | TimelineComponent
  | MetricsComponent
  | WorkoutSessionsComponent
  | CoachCardComponent
  | MultiSelectComponent
  | UserInformationComponent
  | ScheduleCoachComponent
  | RadioButtonComponent
  | EventCardComponent
  | ChallengesComponent
  |ChallengesWorkoutsComponent
  | CurrentChallenge
  | WelcomeComponent
  | HistoryComponent;

// **Static Cards Component**
export interface StaticCardsComponent extends BaseComponent {
  file_name: "cards";
  type: "static";
  cards: Card[];
}

// **Dynamic Cards Component**
export interface DynamicCardsComponent extends BaseComponent {
  file_name: "cards";
  type: "dynamic";
  api_url: string;
  table_name: string;
  card_title: string;
  card_description: string;
  card_id: string;
  card_image: string;
  redirect_link: string;
  filter_by_user_email?: boolean;
  report_image?:boolean
}

// **Card Interface**
export interface Card {
  id: number;
  title: string;
  image: string;
  description: string;
  redirect_link: string;
}

// **Form Component**
export interface FormComponent extends BaseComponent {
  file_name: "form";
  formMethod: "POST" | "PUT";
  table_name: string;
  fields: FormField[];
  api_url?: string;
  redirect_link?: string;
}

// **Discriminated Union for Form Fields**
export type FormField = InputField | TextareaField | SelectField;

// **Base Form Field**
interface BaseFormField {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  validation?: {
    regex: string;
    message: string;
  };
}

// **Input Field**
export interface InputField extends BaseFormField {
  fieldType: "input";
  type?: string;
}

// **Textarea Field**
export interface TextareaField extends BaseFormField {
  fieldType: "textarea";
  rows?: number;
  cols?: number;
}

// **Select Field**
export interface SelectField extends BaseFormField {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  filters: any;
  fieldType: "select";
  relatedTable: string;
  selectKey: string;
  selectName: string;
  params?: Filter[];
}

// **Filter Type**
export interface Filter {
  param_column: string;
  param_value: string | boolean;
}

// **Timeline Component**
export interface TimelineComponent extends BaseComponent {
  file_name: "timeline";
  apis: {
    fetch_events: string;
  };
  table_name: string;
  filter_by_user_email: boolean;
  title: string;
  button_label: string;
  limit?: number;
}

// **Timeline Event**
export interface TimelineEvent {
  EventID: number;
  UserID: number;
  ReservationID: number;
  Date: string;
  Status: "completed" | "upcoming" | "pending";
  Title: string;
  Description: string;
  MeetLink: string;
}

export interface CalendarComponent {
  file_name: "calendar";
  apis: {
    get_events_by_date: string;
  };
  show_all_events?: boolean;
}

// **Metrics Component**
export interface MetricsComponent extends BaseComponent {
  file_name: "metrics";
  metrics: Metric[];
  section_title: string;
}

// **Metric Interface**
export interface Metric {
  label?: string;
  value?: number;
  unit?: string;
  percentage: number;
  size?: "small" | "medium" | "large";
}

// **History Component**
export interface WorkoutSessionsComponent extends BaseComponent {
  file_name: "history";
  section_title: string;
  redirect_link: string;
}
export interface HistoryComponent extends BaseComponent {
  file_name: "history";
  section_title: string;
  table_name: string;
  api_url: string;
  redirect_link: string;
  filter_by_user_email?: boolean;
  history_id: string;
  history_image: string;
  history_title: string;
  history_duration: string;
  history_status: "completed" | "pending";
  history_percentage: string;
}


// **CoachCardComponent Component**
export interface CoachCardComponent extends BaseComponent {
  file_name: "coach-card";
  title?: string;
  description: string;
  name: string;
  imageUrl: string;
  apis: {
    get_random_coach: string;
  };
}
export interface CoachAction {
  label: string;
  href: string;
}

// **MultiSelectComponent Component**
export interface MultiSelectComponent extends BaseComponent {
  file_name: "multi-select";
  title: string;
  subtitle: string;
  redirect_link: string;
  api_url: string;
  method: "POST";
  table_name: string;
  column_name: string;
  choices: string[];
}

export interface RadioButtonComponent extends BaseComponent {
  file_name: "radio-button";
  title: string;
  subtitle: string;
  apis: {
    update_user_info: string;
  };
  method: "POST";
  table_name: string;
  column_name: string;
  choices: { label: string; href: string }[];
}

// **User Information Component**
export interface UserInformationComponent extends BaseComponent {
  file_name: "user-information";
  title: string;
  table_name: string;
  apis: {
    update_user_info: string;
  };
  method: "POST";
  image: string;
  choices: {
    gender: ["Male", "Female"];
    ageGroup: string[];
    inputs: {
      label: string;
      input: {
        name: string;
        type: string;
        placeholder: string;
      };
    }[];
  };
  redirect_link: string;
}

export interface ScheduleCoachComponent extends BaseComponent {
  file_name: "schedule-coach";
  title: string;
  redirect_link: string;
  apis: {
    get_sessions: string;
    schedule_session: string;
  };
  table_name: string;
  filters?: Filter[];
}

export interface EventCardComponent extends BaseComponent {
  file_name: "upcoming-event";
  date: string;
  title: string;
  description: string;
  link: string;
  section_title: string;
  api_url: string;
  table_name: string;
}
export interface WelcomeComponent extends BaseComponent {
  file_name: "welcome";
  title: string;
  redirect_link: string;
  api_url: string;
}
export interface EventCardComponent extends BaseComponent {
  file_name: "upcoming-event";
  section_title: string;
}

export interface ChallengesComponent extends BaseComponent {
  file_name: "challenges";
  apis: {
    get_challenges: string;
    get_challenges_progress: string;
  };
  table_name: string;
  redirect_link: string;
  button_label: string;
  is_public?: boolean;
  add_date_control?: boolean;
}
export interface ChallengesWorkoutsComponent extends BaseComponent {
  file_name: "challenges-workouts";
  apis: {
    get_challenges: string;
    get_challenges_progress: string;
  };
  table_name: string;
  redirect_link: string;
  button_label: string;
  is_public?: boolean;
  add_date_control?: boolean;
}

export interface ChallengeCard {
  ChallengeID: number;
  Title: string;
  Description: string;
  Score: number;
  StartDate: string;
  EndDate: string;
}

export interface CurrentChallenge extends BaseComponent {
  file_name: "current-challenge";
  section_title: string;
  redirect_link: string;
  button_label: string;
  link: {
    label: string;
    href: string;
  };
  apis: {
    user_challenge_progress: string;
    challenge: string;
  };
}

export interface TasksComponent extends BaseComponent {
  file_name: "tasks";
  apis: {
    get_tasks: string;
    get_completed_tasks: string;
  };
  show_points?: boolean;
}

export interface Task {
  completed: boolean;
  TaskID: number;
  ChallengeID_id: number;
  GeneralTaskID_id: number;
  Score: number;
  StartDate: string;
  EndDate: string;
  generalTaskDetails: GeneralTask;
}

export interface GeneralTask {
  Label: string;
  TaskID: number;
  GeneralTaskID: number;
  Name: string;
  Link: string;
  Notes: string;
  Unit: string;
}

export interface SingleTaskComponent {
  TaskID: number;
  ChallengeID: ChallengeCard;
  GeneralTaskID: GeneralTask;
  Value: string;
  Score: number;
  StartDate: string;
  EndDate: string;
  apis: {
    get_completed_tasks: string;
    complete_task: string;
  };
}

export interface TabsComponent extends BaseComponent {
  file_name: "tabs";
  tabs: Tab[];
}

interface Tab {
  title: string;
  component: BaseComponent;
}
