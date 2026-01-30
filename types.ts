export interface Student {
  id: string;
  name: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  classId: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface ClassEntity {
  id: string;
  name: string;
  homeroomTeacherId: string;
}

export interface ScoreRecord {
  studentId: string;
  subjectId: string;
  oral: number[]; // Điểm miệng
  test15: number[]; // 15 phút
  test45: number[]; // 1 tiết
  semester: number | null; // Thi học kỳ
}

export enum ReportTone {
  STRICT = 'Nghiêm khắc & Kỷ luật',
  ENCOURAGING = 'Khích lệ & Động viên',
  PROFESSIONAL = 'Chuyên nghiệp & Khách quan',
  EMOTIONAL = 'Tình cảm & Sâu sắc'
}

export interface AIAnalysisRequest {
  studentName: string;
  className: string;
  scores: { subject: string; average: number }[];
  tone: ReportTone;
  focus: string[]; // e.g. "Hạnh kiểm", "Học lực", "Định hướng"
}
