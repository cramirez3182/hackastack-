export interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  start_time: string  // "09:00"
  end_time: string    // "10:15"
  course_code: string
  course_name: string
  room?: string
}

export interface Professor {
  id: string
  first_name: string
  last_name: string
  full_name: string
  department: string
  school: string
  title: string
  tenure_track: boolean
  email?: string
  photo_url?: string
  bio?: string
  profile_url?: string

  rmp_id?: string
  avg_rating: number
  avg_difficulty: number
  num_ratings: number
  would_take_again_percent: number
  tags: string[]
  courses_taught: string[]
  schedule: TimeSlot[]
}

export interface Filters {
  search: string
  department: string
  school: string
  hasSchedule: 'all' | 'yes' | 'no'
  minRating: number
  maxDifficulty: number
  minWouldTakeAgain: number
  tenureTrack: 'all' | 'yes' | 'no'
  course: string
  tags: string[]
  sortBy: 'avg_rating' | 'avg_difficulty' | 'num_ratings' | 'would_take_again_percent' | 'last_name'
  sortDir: 'asc' | 'desc'
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SavedSlot {
  id: string
  professor_id: string
  professor_name: string
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  start_time: string
  end_time: string
  course_code: string
  course_name: string
  room?: string
}

export const SCHOOL_COLORS: Record<string, string> = {
  'College of Arts & Sciences': 'bg-blue-500',
  'Leavey School of Business': 'bg-green-500',
  'School of Engineering': 'bg-purple-500',
  'School of Law': 'bg-red-500',
  'School of Education & Counseling Psychology': 'bg-orange-500',
  'Jesuit School of Theology': 'bg-amber-600',
  'Santa Clara University': 'bg-gray-500',
}

export const SCHOOL_TEXT_COLORS: Record<string, string> = {
  'College of Arts & Sciences': 'text-blue-700',
  'Leavey School of Business': 'text-green-700',
  'School of Engineering': 'text-purple-700',
  'School of Law': 'text-red-700',
  'School of Education & Counseling Psychology': 'text-orange-700',
  'Jesuit School of Theology': 'text-amber-700',
  'Santa Clara University': 'text-gray-700',
}

export const SCHOOL_BG_COLORS: Record<string, string> = {
  'College of Arts & Sciences': 'bg-blue-50 border-blue-200',
  'Leavey School of Business': 'bg-green-50 border-green-200',
  'School of Engineering': 'bg-purple-50 border-purple-200',
  'School of Law': 'bg-red-50 border-red-200',
  'School of Education & Counseling Psychology': 'bg-orange-50 border-orange-200',
  'Jesuit School of Theology': 'bg-amber-50 border-amber-200',
  'Santa Clara University': 'bg-gray-50 border-gray-200',
}
