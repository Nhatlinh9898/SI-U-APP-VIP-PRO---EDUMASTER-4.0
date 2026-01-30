import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, BookOpen, GraduationCap, BarChart3, 
  Settings, Save, Plus, Trash2, Wand2, Volume2, 
  LayoutDashboard, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { generateStudentReport, generateVoiceReport } from './services/geminiService';
import { 
  Student, Teacher, Subject, ClassEntity, 
  ScoreRecord, ReportTone, AIAnalysisRequest 
} from './types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

// --- MOCK DATA INITIALIZATION ---
const MOCK_SUBJECTS: Subject[] = [
  { id: 's1', name: 'Toán Học' },
  { id: 's2', name: 'Ngữ Văn' },
  { id: 's3', name: 'Tiếng Anh' },
  { id: 's4', name: 'Vật Lý' },
];

const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Nguyễn Văn A', subject: 'Toán Học' },
  { id: 't2', name: 'Trần Thị B', subject: 'Ngữ Văn' },
];

const MOCK_CLASSES: ClassEntity[] = [
  { id: 'c1', name: '12A1 (Chuyên Toán)', homeroomTeacherId: 't1' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 'st1', name: 'Lê Hoàng Nam', dob: '2006-05-12', gender: 'Nam', classId: 'c1' },
  { id: 'st2', name: 'Phạm Minh Thư', dob: '2006-08-20', gender: 'Nữ', classId: 'c1' },
  { id: 'st3', name: 'Đỗ Hùng Dũng', dob: '2006-02-14', gender: 'Nam', classId: 'c1' },
];

const MOCK_SCORES: ScoreRecord[] = [
  { studentId: 'st1', subjectId: 's1', oral: [9, 10], test15: [9], test45: [8.5], semester: 9 },
  { studentId: 'st1', subjectId: 's2', oral: [7, 8], test15: [7.5], test45: [7], semester: 7.5 },
  { studentId: 'st2', subjectId: 's1', oral: [6, 7], test15: [6.5], test45: [6], semester: 6 },
];

// --- COMPONENTS ---

// 1. Navigation Sidebar
const Sidebar = ({ currentView, setView }: { currentView: string, setView: (v: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'classes', label: 'Quản Lý Lớp', icon: Users },
    { id: 'grades', label: 'Sổ Điểm Điện Tử', icon: BookOpen },
    { id: 'ai-report', label: 'AI Phân Tích & Báo Cáo', icon: Wand2, special: true },
  ];

  return (
    <div className="w-64 h-screen glass-panel fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-neon-blue">
          <GraduationCap className="w-8 h-8" />
          <span className="font-display font-bold text-xl tracking-wider">EDUMASTER</span>
        </div>
        <div className="text-xs text-gray-400 mt-1 tracking-widest pl-10">SYSTEM V4.0</div>
      </div>
      
      <div className="flex-1 py-6 space-y-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
              ${currentView === item.id 
                ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              ${item.special ? 'mt-8 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10' : ''}
            `}
          >
            <item.icon className={`w-5 h-5 ${item.special ? 'animate-pulse' : ''}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// 2. Dashboard Component
const Dashboard = ({ students, scores, classes }: { students: Student[], scores: ScoreRecord[], classes: ClassEntity[] }) => {
  // Simple stats calculation
  const totalStudents = students.length;
  const totalClasses = classes.length;
  
  // Calculate Good/Average/Bad based on mock logic (simplified)
  const stats = [
    { name: 'Giỏi', value: 45, fill: '#00f3ff' },
    { name: 'Khá', value: 30, fill: '#bc13fe' },
    { name: 'Trung Bình', value: 15, fill: '#fbbf24' },
    { name: 'Yếu', value: 10, fill: '#ef4444' },
  ];

  const attendanceData = [
    { day: 'T2', present: 98 },
    { day: 'T3', present: 95 },
    { day: 'T4', present: 97 },
    { day: 'T5', present: 92 },
    { day: 'T6', present: 96 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon-blue">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">Tổng Học Sinh</div>
          <div className="text-4xl font-display font-bold text-white mt-2">{totalStudents}</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon-purple">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">Số Lớp Học</div>
          <div className="text-4xl font-display font-bold text-white mt-2">{totalClasses}</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-green-500">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">Hiệu Suất TB</div>
          <div className="text-4xl font-display font-bold text-white mt-2">8.7</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-blue" />
            Phân Loại Học Lực
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats} 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-purple" />
            Biểu Đồ Chuyên Cần
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Class Management Component (Simplified List)
const ClassManager = ({ 
  students, classes, subjects, onAddStudent 
}: { 
  students: Student[], classes: ClassEntity[], subjects: Subject[], onAddStudent: (s: Student) => void 
}) => {
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');

  const handleAdd = () => {
    if (!newStudentName) return;
    onAddStudent({
      id: `st${Date.now()}`,
      name: newStudentName,
      dob: '2007-01-01',
      gender: 'Nam',
      classId: selectedClass
    });
    setNewStudentName('');
  };

  return (
    <div className="glass-panel rounded-2xl p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-display font-bold text-white neon-text">Quản Lý Lớp Học</h2>
        <div className="flex gap-4">
           <select 
             value={selectedClass} 
             onChange={(e) => setSelectedClass(e.target.value)}
             className="bg-black/50 border border-white/20 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-neon-blue outline-none"
           >
             {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>
      </div>

      <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
         <h3 className="text-neon-blue font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4"/> Thêm Học Sinh Mới</h3>
         <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Họ và tên học sinh..." 
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue outline-none transition-all"
            />
            <button 
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all"
            >
              Thêm Vào Lớp
            </button>
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="p-4 font-medium">Mã HS</th>
              <th className="p-4 font-medium">Họ Tên</th>
              <th className="p-4 font-medium">Ngày Sinh</th>
              <th className="p-4 font-medium">Giới Tính</th>
              <th className="p-4 font-medium text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {students.filter(s => s.classId === selectedClass).map(s => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-neon-blue font-mono text-sm">{s.id}</td>
                <td className="p-4 text-white font-medium">{s.name}</td>
                <td className="p-4 text-gray-300">{s.dob}</td>
                <td className="p-4 text-gray-300">
                  <span className={`px-2 py-1 rounded text-xs ${s.gender === 'Nam' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'}`}>
                    {s.gender}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 4. GradeBook Component
const GradeBook = ({ 
  students, scores, subjects, setScores 
}: { 
  students: Student[], scores: ScoreRecord[], subjects: Subject[], setScores: any 
}) => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);

  // Helper to find score
  const getScore = (stId: string, subId: string) => scores.find(s => s.studentId === stId && s.subjectId === subId);

  return (
    <div className="glass-panel rounded-2xl p-8 animate-fade-in">
       <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-display font-bold text-white neon-text">Sổ Điểm Điện Tử</h2>
        <select 
             value={selectedSubject} 
             onChange={(e) => setSelectedSubject(e.target.value)}
             className="bg-black/50 border border-white/20 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-neon-purple outline-none"
           >
             {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
           </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-300 border-b border-white/10">
              <th className="p-4 min-w-[200px]">Học Sinh</th>
              <th className="p-4">Miệng (x1)</th>
              <th className="p-4">15 Phút (x1)</th>
              <th className="p-4">1 Tiết (x2)</th>
              <th className="p-4">Thi HK (x3)</th>
              <th className="p-4 text-right">Trung Bình</th>
            </tr>
          </thead>
          <tbody>
            {students.map(st => {
              const record = getScore(st.id, selectedSubject);
              // Calculate average (mock)
              const avg = record ? 
                ((record.oral[0] || 0) + (record.test15[0] || 0) + (record.test45[0] || 0) * 2 + (record.semester || 0) * 3) / 7 
                : 0;

              return (
                <tr key={st.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{st.name}</td>
                  <td className="p-4"><span className="bg-gray-800 px-3 py-1 rounded text-white border border-gray-700">{record?.oral.join(', ') || '-'}</span></td>
                  <td className="p-4"><span className="bg-gray-800 px-3 py-1 rounded text-white border border-gray-700">{record?.test15.join(', ') || '-'}</span></td>
                  <td className="p-4"><span className="bg-gray-800 px-3 py-1 rounded text-white border border-gray-700">{record?.test45.join(', ') || '-'}</span></td>
                  <td className="p-4"><span className="bg-purple-900/50 px-3 py-1 rounded text-purple-200 border border-purple-700">{record?.semester || '-'}</span></td>
                  <td className="p-4 text-right">
                    <span className={`font-bold ${avg >= 8 ? 'text-neon-blue' : avg >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {record ? avg.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. AI Report Generator (The Persona Implementation)
const AIReportGenerator = ({ students, scores, subjects }: { students: Student[], scores: ScoreRecord[], subjects: Subject[] }) => {
  const [selectedStudent, setSelectedStudent] = useState(students[0].id);
  const [tone, setTone] = useState<ReportTone>(ReportTone.PROFESSIONAL);
  const [focus, setFocus] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const focusOptions = ['Hạnh kiểm', 'Học lực', 'Kỹ năng mềm', 'Định hướng nghề nghiệp', 'Cần cải thiện'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');
    
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    const studentScores = subjects.map(sub => {
      const rec = scores.find(s => s.studentId === student.id && s.subjectId === sub.id);
      const avg = rec ? ((rec.oral[0] || 0) + (rec.test15[0] || 0) + (rec.test45[0] || 0) * 2 + (rec.semester || 0) * 3) / 7 : 0;
      return { subject: sub.name, average: avg };
    });

    const request: AIAnalysisRequest = {
      studentName: student.name,
      className: '12A1', // Mock
      scores: studentScores,
      tone: tone,
      focus: focus
    };

    const text = await generateStudentReport(request);
    setResult(text);
    setIsGenerating(false);
  };

  const handleSpeak = async (gender: 'Nam' | 'Nữ') => {
    if (!result) return;
    setIsPlaying(true);
    const buffer = await generateVoiceReport(result, gender);
    
    if (buffer) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start(0);
    } else {
      setIsPlaying(false);
    }
  };

  const toggleFocus = (f: string) => {
    setFocus(prev => prev.includes(f) ? prev.filter(i => i !== f) : [...prev, f]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Control Panel */}
      <div className="glass-panel p-8 rounded-2xl h-fit">
        <h2 className="text-2xl font-display font-bold text-white neon-text mb-6 border-b border-white/10 pb-4">
          Cấu Hình AI Writer
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Chọn Học Sinh</label>
            <select 
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-neon-purple outline-none"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students.map(s => <option key={s.id} value={s.id}>{s.name} - {s.id}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tone Giọng Báo Cáo</label>
            <select 
              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-neon-purple outline-none"
              value={tone}
              onChange={(e) => setTone(e.target.value as ReportTone)}
            >
              {Object.values(ReportTone).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Trọng Tâm Phân Tích</label>
            <div className="flex flex-wrap gap-2">
              {focusOptions.map(f => (
                <button
                  key={f}
                  onClick={() => toggleFocus(f)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    focus.includes(f) 
                    ? 'bg-neon-purple/20 border-neon-purple text-white shadow-[0_0_10px_rgba(188,19,254,0.3)]' 
                    : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-bold font-display tracking-wider text-lg uppercase transition-all flex justify-center items-center gap-2
              ${isGenerating 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] text-white'}`}
          >
            {isGenerating ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Wand2 className="w-6 h-6" /> Kích Hoạt Neural Core</>}
          </button>
        </div>
      </div>

      {/* Result Panel */}
      <div className="glass-panel p-8 rounded-2xl min-h-[500px] flex flex-col relative">
        <h2 className="text-xl font-bold text-gray-300 mb-4 flex items-center justify-between">
          <span>Kết Quả Phân Tích</span>
          {result && (
             <div className="flex gap-2">
                <button 
                  disabled={isPlaying}
                  onClick={() => handleSpeak('Nam')}
                  className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-full text-blue-300 transition-colors" title="Đọc giọng Nam"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button 
                   disabled={isPlaying}
                   onClick={() => handleSpeak('Nữ')}
                   className="p-2 bg-pink-600/20 hover:bg-pink-600/40 rounded-full text-pink-300 transition-colors" title="Đọc giọng Nữ"
                >
                   <Volume2 className="w-5 h-5" />
                </button>
             </div>
          )}
        </h2>

        {result ? (
          <div className="bg-black/30 p-6 rounded-xl border border-white/5 text-gray-200 leading-relaxed whitespace-pre-line flex-1 overflow-y-auto max-h-[600px] font-light">
            {result}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
             <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-500" />
             </div>
             <p>Chưa có dữ liệu báo cáo</p>
             <p className="text-sm">Vui lòng chọn cấu hình và nhấn kích hoạt</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [scores, setScores] = useState<ScoreRecord[]>(MOCK_SCORES);
  
  // Header Component
  const Header = () => (
    <div className="relative h-32 flex items-center justify-center bg-gradient-to-b from-blue-900/10 to-transparent z-10">
      <div className="text-center animate-fade-in-down">
         <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-[0_0_15px_rgba(0,243,255,0.4)] tracking-wider">
           HỆ THỐNG GIÁO DỤC 4.0
         </h1>
         <p className="text-gray-400 mt-2 font-light tracking-[0.2em] text-sm uppercase">Siêu App Quản Lý & Phân Tích Dữ Liệu Học Đường</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-body overflow-x-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="pl-64 min-h-screen relative">
        {/* Background Ambient Glow */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
           <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 pb-20 px-8">
          <Header />
          
          <div className="mt-8">
            {currentView === 'dashboard' && <Dashboard students={students} scores={scores} classes={MOCK_CLASSES} />}
            
            {currentView === 'classes' && (
              <ClassManager 
                students={students} 
                classes={MOCK_CLASSES} 
                subjects={MOCK_SUBJECTS}
                onAddStudent={(s) => setStudents([...students, s])}
              />
            )}
            
            {currentView === 'grades' && (
              <GradeBook 
                students={students} 
                scores={scores} 
                subjects={MOCK_SUBJECTS}
                setScores={setScores}
              />
            )}
            
            {currentView === 'ai-report' && (
              <AIReportGenerator 
                students={students} 
                scores={scores} 
                subjects={MOCK_SUBJECTS}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
