import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  Save, 
  X, 
  RotateCcw, 
  Clock, 
  Play, 
  FolderPlus, 
  Users, 
  Sparkles, 
  KeyRound,
  GraduationCap,
  Image as ImageIcon,
  ImagePlus,
  Eye,
  Maximize2,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { Question, OptionKey, QuizPackage, ActiveQuizSession, QuizSessionMode, QuestionType } from '../types';
import { DEFAULT_TEAMS } from '../data/defaultQuestions';
import { parseQuestionsCSV, downloadCSVTemplate } from '../utils/csvHelper';
import { sound } from '../utils/audio';
import { processImageUpload } from '../utils/imageHelper';

interface AdminQuestionManagerProps {
  quizPackages: QuizPackage[];
  activeSession: ActiveQuizSession;
  onSaveQuizPackage: (pkg: QuizPackage) => void;
  onDeleteQuizPackage: (id: string) => void;
  onPlayQuizSession: (pkg: QuizPackage, newClass: string, newCode: string, mode: QuizSessionMode, scheduledStartAt?: number, scheduledEndAt?: number) => void;
  onResetDefaultQuestions: () => void;
  onSaveToDrive?: () => void;
}

export const AdminQuestionManager: React.FC<AdminQuestionManagerProps> = ({
  quizPackages,
  activeSession,
  onSaveQuizPackage,
  onDeleteQuizPackage,
  onPlayQuizSession,
  onResetDefaultQuestions,
  onSaveToDrive,
}) => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    activeSession.quizId || (quizPackages[0]?.id ?? '')
  );

  const currentPackage = quizPackages.find(p => p.id === selectedPackageId) || quizPackages[0];

  // Tab: 'QUESTIONS' or 'PACKAGES' or 'TEAMS'
  const [managerTab, setManagerTab] = useState<'QUESTIONS' | 'PACKAGES' | 'TEAMS' | 'LIBRARY'>('QUESTIONS');
  const [libraryKeyword, setLibraryKeyword] = useState('');
  const [quickTime, setQuickTime] = useState(20);
  const [quickPoints, setQuickPoints] = useState(1000);

  // Question Edit modal
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // New/Edit Quiz Package Modal
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [packageTitle, setPackageTitle] = useState('');
  const [packageDesc, setPackageDesc] = useState('');
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [saveAsNewPackage, setSaveAsNewPackage] = useState(false);

  // Play modal
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [targetClassInput, setTargetClassInput] = useState(currentPackage?.targetClass || 'TI-3A');
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [sessionMode, setSessionMode] = useState<QuizSessionMode>('LIVE');
  const [scheduledStartInput, setScheduledStartInput] = useState('');
  const [scheduledEndInput, setScheduledEndInput] = useState('');

  // Custom Teams state inside current package
  const [newTeamInput, setNewTeamInput] = useState('');

  // CSV State
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);

  // Form State for Manual Add/Edit Question
  const [formData, setFormData] = useState<Question>({
    id: `Q1`,
    pertanyaan: '',
    opsiA: '',
    opsiB: '',
    opsiC: '',
    opsiD: '',
    jawabanBenar: 'A',
    waktuDetik: 20,
    imageUrl: undefined,
  });
  const questionTextRef = useRef<HTMLTextAreaElement | null>(null);

  const insertQuestionMarkup = (prefix: string, suffix = prefix) => {
    const textarea = questionTextRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = formData.pertanyaan.slice(start, end) || 'teks';
    const nextText = `${formData.pertanyaan.slice(0, start)}${prefix}${selected}${suffix}${formData.pertanyaan.slice(end)}`;
    setFormData(prev => ({ ...prev, pertanyaan: nextText }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  };

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'FILE' | 'URL'>('FILE');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const [imagePreviewModalUrl, setImagePreviewModalUrl] = useState<string | null>(null);

  const handleImageFileSelected = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadError('File harus berupa gambar valid (JPG, PNG, WEBP, GIF, SVG)');
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const dataUrl = await processImageUpload(file, 800, 0.82);
      setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
      sound.playCorrect();
    } catch (err: any) {
      setImageUploadError(err.message || 'Gagal memproses gambar');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleApplyImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setImageUploadError('URL gambar harus diawali dengan http:// atau https://');
      return;
    }
    setImageUploadError(null);
    setFormData(prev => ({ ...prev, imageUrl: trimmed }));
    setImageUrlInput('');
    sound.playClick();
  };

  const handleRemoveImage = () => {
    sound.playClick();
    setFormData(prev => ({ ...prev, imageUrl: undefined }));
    setImageUploadError(null);
    setImageUrlInput('');
  };

  const handleOpenAddQuestion = () => {
    sound.playClick();
    const currentQuestions = currentPackage?.questions || [];
    setFormData({
      id: `Q${currentQuestions.length + 1}`,
      pertanyaan: '',
      opsiA: '',
      opsiB: '',
      opsiC: '',
      opsiD: '',
      jawabanBenar: 'A',
      waktuDetik: 20,
      poin: 1000,
      kodeLibrary: '',
      jenisSoal: 'MULTIPLE_CHOICE',
      jawabanSingkat: '',
      imageUrl: undefined,
    });
    setImageUploadError(null);
    setImageUrlInput('');
    setEditingQuestion(null);
    setIsEditingQuestion(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    sound.playClick();
    setFormData({ ...q });
    setImageUploadError(null);
    setImageUrlInput(q.imageUrl?.startsWith('http') ? q.imageUrl : '');
    setEditingQuestion(q);
    setIsEditingQuestion(true);
  };

  const handleDeleteQuestion = (id: string) => {
    sound.playClick();
    if (!currentPackage) return;
    if (confirm(`Hapus soal "${id}"?`)) {
      const updatedQuestions = currentPackage.questions.filter(q => q.id !== id);
      onSaveQuizPackage({
        ...currentPackage,
        questions: updatedQuestions,
        updatedAt: Date.now(),
      });
    }
  };

  const handleSaveQuestionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPackage) return;
    sound.playClick();

    if (!formData.pertanyaan.trim()) {
      alert('Pertanyaan tidak boleh kosong!');
      return;
    }

    let updatedList: Question[];
    if (editingQuestion) {
      updatedList = currentPackage.questions.map(q => q.id === editingQuestion.id ? formData : q);
    } else {
      updatedList = [...currentPackage.questions, formData];
    }

    onSaveQuizPackage({
      ...currentPackage,
      questions: updatedList,
      updatedAt: Date.now(),
    });

    setIsEditingQuestion(false);
    setEditingQuestion(null);
  };

  // CSV Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentPackage) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { questions: parsed, errors } = parseQuestionsCSV(text);

      if (errors.length > 0) {
        setCsvErrors(errors);
        setCsvSuccess(null);
        sound.playIncorrect();
      } else {
        setCsvErrors([]);
        onSaveQuizPackage({
          ...currentPackage,
          questions: parsed,
          updatedAt: Date.now(),
        });
        setCsvSuccess(`Berhasil mengimpor ${parsed.length} butir soal ke paket kuis "${currentPackage.title}"!`);
        sound.playCorrect();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Add custom team
  const handleAddCustomTeam = () => {
    if (!newTeamInput.trim() || !currentPackage) return;
    sound.playClick();
    const trimmed = newTeamInput.trim();
    if (currentPackage.customTeams.includes(trimmed)) {
      alert('Nama kelompok sudah ada!');
      return;
    }
    const updated = [...currentPackage.customTeams, trimmed];
    onSaveQuizPackage({
      ...currentPackage,
      customTeams: updated,
      updatedAt: Date.now(),
    });
    setNewTeamInput('');
  };

  const handleDeleteTeam = (teamName: string) => {
    if (!currentPackage) return;
    sound.playClick();
    const updated = currentPackage.customTeams.filter(t => t !== teamName);
    onSaveQuizPackage({
      ...currentPackage,
      customTeams: updated,
      updatedAt: Date.now(),
    });
  };

  // Create new quiz package
  const handleCreateNewPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageTitle.trim()) return;
    sound.playClick();

    const existingPackage = editingPackageId ? quizPackages.find(pkg => pkg.id === editingPackageId) : null;
    const newPkg: QuizPackage = {
      id: existingPackage && !saveAsNewPackage ? existingPackage.id : `quiz-pkg-${Date.now()}`,
      title: packageTitle.trim(),
      description: packageDesc.trim() || 'Paket soal kuis kelas baru.',
      targetClass: existingPackage?.targetClass || '',
      customTeams: existingPackage?.customTeams?.length ? existingPackage.customTeams : DEFAULT_TEAMS,
      questions: existingPackage?.questions || [],
      createdAt: existingPackage?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSaveQuizPackage(newPkg);
    setSelectedPackageId(newPkg.id);
    setIsEditingPackage(false);
    setEditingPackageId(null);
    setSaveAsNewPackage(false);
    setPackageTitle('');
    setPackageDesc('');
  };

  // Trigger Play
  const handleStartPlay = () => {
    if (!currentPackage) return;
    sound.playClick();
    const generatedCode = customCodeInput.trim() 
      ? customCodeInput.trim().toUpperCase()
      : `OCTO-${Math.floor(100 + Math.random() * 900)}`;
    const targetClass = targetClassInput.trim() || currentPackage.targetClass || 'TI-3A';

    const scheduledStartAt = sessionMode === 'ASSIGNMENT' && scheduledStartInput ? new Date(scheduledStartInput).getTime() : undefined;
    const scheduledEndAt = sessionMode === 'ASSIGNMENT' && scheduledEndInput ? new Date(scheduledEndInput).getTime() : undefined;
    if (sessionMode === 'ASSIGNMENT' && (!scheduledStartAt || !scheduledEndAt || scheduledEndAt <= scheduledStartAt)) {
      alert('Waktu mulai dan selesai tugas harus diisi, dan waktu selesai harus setelah waktu mulai.');
      return;
    }
    onPlayQuizSession(currentPackage, targetClass, generatedCode, sessionMode, scheduledStartAt, scheduledEndAt);
    setIsPlayModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
      
      {/* Top Banner Header */}
      <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase">
              Bank Soal & Paket Kuis
            </span>
            <span className="text-xs text-cyan-200/70">
              {quizPackages.length} Paket Kuis Tersimpan
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            Manajemen Soal & Multi-Kuis
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Buat nama kuis, masukkan butir soal, kustomisasi nama kelompok kelas, dan putar ulang untuk berbagai kelas dengan kode sesi kuis unik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setEditingPackageId(null);
              setSaveAsNewPackage(false);
              setPackageTitle('');
              setPackageDesc('');
              setIsEditingPackage(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Buat Paket Kuis Baru</span>
          </button>

          {onSaveToDrive && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSaveToDrive();
              }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-400/30 transition-colors flex items-center gap-1.5"
              title="Simpan paket soal dan kelompok ke Google Drive"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Soal ke Drive</span>
            </button>
          )}

          <button
            onClick={onResetDefaultQuestions}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#111c33] text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
            title="Kembalikan paket soal default bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* Package Selector & Active Package Overview */}
      <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl">
              🐙
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                Paket Kuis Terpilih:
              </span>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="bg-[#080d19] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-white font-extrabold text-sm sm:text-base focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {quizPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id} className="bg-[#0e172a] text-white">
                    {pkg.title} ({pkg.questions.length} Soal) • Kelas {pkg.targetClass}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Play Button for this quiz */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setTargetClassInput(currentPackage?.targetClass || 'TI-3A');
                setCustomCodeInput(`OCTO-${Math.floor(100 + Math.random() * 900)}`);
                setIsPlayModalOpen(true);
              }}
              className="px-6 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-emerald-400/30 cursor-pointer"
              title="Mulai mainkan kuis ini ke Layar Kelas dengan kode kuis baru"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY KUIS INI ({currentPackage?.questions.length || 0} SOAL)</span>
            </button>
          </div>

        </div>

        {/* Tab Switcher for Current Package */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setManagerTab('QUESTIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              managerTab === 'QUESTIONS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Butir Soal ({currentPackage?.questions.length || 0})
          </button>
          <button
            onClick={() => setManagerTab('TEAMS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              managerTab === 'TEAMS'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Nama Kelompok ({currentPackage?.customTeams.length || 0})
          </button>
          <button
            onClick={() => setManagerTab('PACKAGES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              managerTab === 'PACKAGES'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kelola Daftar Kuis ({quizPackages.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: QUESTIONS MANAGEMENT & CSV IMPORT                  */}
      {/* ========================================================= */}
      {managerTab === 'QUESTIONS' && (
        <div className="space-y-6">
          
          {/* CSV Import & Template Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upload Card */}
            <div className="lg:col-span-2 bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-base text-white font-display">
                    Import Soal ke "{currentPackage?.title}"
                  </h3>
                </div>
                <button
                  onClick={downloadCSVTemplate}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template CSV</span>
                </button>
              </div>

              <label className="block border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[#080d19]/80 hover:bg-[#0c1427]">
                <input 
                  type="file" 
                  accept=".csv, .txt" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-300">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-white block">
                  Pilih atau Tarik File CSV ke Sini
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Format: ID_Soal, Pertanyaan, Opsi_A, Opsi_B, Opsi_C, Opsi_D, Jawaban_Benar, Waktu_Detik, Poin, Kode_Library
                </span>
              </label>

              {csvSuccess && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{csvSuccess}</span>
                </div>
              )}

              {csvErrors.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Terjadi kesalahan pada file CSV:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-rose-200">
                    {csvErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold uppercase text-cyan-200 mb-1.5">Waktu Cepat Semua Soal</label>
                <div className="flex gap-2">
                  <input title="Waktu semua soal" type="number" min="5" max="120" value={quickTime} onChange={event => setQuickTime(Number(event.target.value) || 20)} className="w-20 rounded-xl bg-[#080d19] border border-cyan-400/30 px-2 py-2 text-xs text-white" />
                  <input title="Poin semua soal" type="number" min="1" value={quickPoints} onChange={event => setQuickPoints(Number(event.target.value) || 1000)} className="w-20 rounded-xl bg-[#080d19] border border-emerald-400/30 px-2 py-2 text-xs text-white" />
                  <button type="button" onClick={() => currentPackage && onSaveQuizPackage({ ...currentPackage, questions: currentPackage.questions.map(question => ({ ...question, waktuDetik: quickTime, poin: quickPoints })), updatedAt: Date.now() })} className="flex-1 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-2 py-2 text-xs font-bold text-cyan-200">Terapkan</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-cyan-200 mb-1.5">Mode Pelaksanaan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setSessionMode('LIVE')} className={`rounded-xl border px-3 py-2 text-xs font-bold ${sessionMode === 'LIVE' ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-white/10 text-slate-400'}`}>Live di Kelas</button>
                  <button type="button" onClick={() => setSessionMode('ASSIGNMENT')} className={`rounded-xl border px-3 py-2 text-xs font-bold ${sessionMode === 'ASSIGNMENT' ? 'border-amber-400 bg-amber-500/15 text-amber-200' : 'border-white/10 text-slate-400'}`}>Tugas Terjadwal</button>
                </div>
              </div>

              {sessionMode === 'ASSIGNMENT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-400/20">
                  <label className="text-xs text-amber-200 font-bold">Waktu Mulai<input type="datetime-local" value={scheduledStartInput} onChange={event => setScheduledStartInput(event.target.value)} className="mt-1 w-full rounded-xl bg-[#080d19] border border-amber-400/30 px-3 py-2 text-xs text-white" /></label>
                  <label className="text-xs text-amber-200 font-bold">Waktu Selesai<input type="datetime-local" value={scheduledEndInput} onChange={event => setScheduledEndInput(event.target.value)} className="mt-1 w-full rounded-xl bg-[#080d19] border border-amber-400/30 px-3 py-2 text-xs text-white" /></label>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white font-display">
                    Tambah Manual
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Tambah butir pertanyaan langsung melalui formulir interaktif lengkap dengan durasi detik dan opsi A/B/C/D.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleOpenAddQuestion}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-400/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Soal Manual</span>
                </button>

                <button
                  onClick={downloadCSVTemplate}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#111c33] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Contoh Format CSV</span>
                </button>
                <button
                  onClick={() => setManagerTab('LIBRARY')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${managerTab === 'LIBRARY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'text-slate-400 hover:text-white'}`}
                >Library Soal</button>
              </div>
            </div>

          </div>

          {/* Form Modal / Inline Editor for Question */}
          {isEditingQuestion && (
            <div className="bg-[#0c1426] border-2 border-cyan-400/50 rounded-3xl p-6 shadow-2xl animate-slideUp">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
                <h3 className="font-bold text-base text-white font-display flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>{editingQuestion ? `Edit Soal: ${editingQuestion.id}` : 'Tambah Soal Baru'}</span>
                </h3>
                <button
                  onClick={() => setIsEditingQuestion(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestionForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">ID Soal</label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Jenis Soal</label>
                    <select value={formData.jenisSoal || 'MULTIPLE_CHOICE'} onChange={(e) => setFormData({ ...formData, jenisSoal: e.target.value as QuestionType })} className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs font-bold">
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">Benar / Salah</option>
                      <option value="SHORT_ANSWER">Isian Singkat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Kunci Jawaban</label>
                    <select
                      hidden={formData.jenisSoal === 'SHORT_ANSWER'}
                      value={formData.jawabanBenar}
                      onChange={(e) => setFormData({ ...formData, jawabanBenar: e.target.value as OptionKey })}
                      className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs font-bold"
                    >
                      <option value="A">Opsi A</option>
                      <option value="B">Opsi B</option>
                      <option value="C">Opsi C</option>
                      <option value="D">Opsi D</option>
                    </select>
                    {formData.jenisSoal === 'TRUE_FALSE' && <select value={formData.jawabanSingkat || 'BENAR'} onChange={event => setFormData({ ...formData, jawabanSingkat: event.target.value })} className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs font-bold"><option value="BENAR">Benar</option><option value="SALAH">Salah</option></select>}
                    {formData.jenisSoal === 'SHORT_ANSWER' && <input value={formData.jawabanSingkat || ''} onChange={event => setFormData({ ...formData, jawabanSingkat: event.target.value })} placeholder="Jawaban yang benar" className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs" required />}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Waktu (Detik)</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={formData.waktuDetik}
                      onChange={(e) => setFormData({ ...formData, waktuDetik: parseInt(e.target.value) || 20 })}
                      className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Poin Soal</label>
                    <input type="number" min="1" value={formData.poin || 1000} onChange={(e) => setFormData({ ...formData, poin: parseInt(e.target.value, 10) || 1000 })} className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Kode Library</label>
                    <input type="text" value={formData.kodeLibrary || ''} onChange={(e) => setFormData({ ...formData, kodeLibrary: e.target.value.toUpperCase() })} placeholder="NETWORK-BASIC" className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs uppercase" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Pertanyaan</label>
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    {[
                      ['B', '**', 'Tebal'], ['I', '*', 'Miring'], ['U', '__', 'Garis bawah'], ['x²', '^^', 'Pangkat'], ['√', '$', 'Rumus inline'],
                    ].map(([label, marker, title]) => <button key={title} type="button" title={title} onClick={() => insertQuestionMarkup(marker)} className="px-2 py-1 rounded-md bg-[#111c33] border border-white/10 text-[11px] font-bold text-cyan-200 hover:border-cyan-400">{label}</button>)}
                    <span className="text-[10px] text-slate-500 ml-1">Gunakan `$...$` untuk rumus KaTeX</span>
                  </div>
                  <textarea
                    ref={questionTextRef}
                    rows={2}
                    value={formData.pertanyaan}
                    onChange={(e) => setFormData({ ...formData, pertanyaan: e.target.value })}
                    placeholder="Tuliskan pertanyaan kuis di sini..."
                    className="w-full p-3 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-sm"
                    required
                  />
                </div>

                {/* Image Attachment (Upload / URL) */}
                <div className="p-4 rounded-2xl bg-[#080d19] border border-cyan-500/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <label className="text-xs font-bold text-white uppercase tracking-wider">
                        Gambar / Diagram Soal <span className="text-[10px] text-cyan-400/80 font-normal lowercase">(opsional)</span>
                      </label>
                    </div>

                    {/* Input Mode Toggle (File Upload vs URL Link) */}
                    {!formData.imageUrl && (
                      <div className="flex items-center gap-1 bg-[#111c33] p-1 rounded-xl border border-white/10 text-[11px]">
                        <button
                          type="button"
                          onClick={() => { setImageInputMode('FILE'); setImageUploadError(null); }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                            imageInputMode === 'FILE' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Upload Gambar
                        </button>
                        <button
                          type="button"
                          onClick={() => { setImageInputMode('URL'); setImageUploadError(null); }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                            imageInputMode === 'URL' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Link URL
                        </button>
                      </div>
                    )}
                  </div>

                  {/* If Image is attached: Show Preview & Actions */}
                  {formData.imageUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-[#0e172a] rounded-xl border border-cyan-500/30">
                      <div 
                        onClick={() => setImagePreviewModalUrl(formData.imageUrl || null)}
                        className="relative group w-32 h-24 rounded-lg overflow-hidden bg-black/60 border border-cyan-500/40 flex items-center justify-center shrink-0 cursor-pointer"
                        title="Klik untuk memperbesar gambar"
                      >
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview Soal" 
                          className="w-full h-full object-contain transition-transform group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-cyan-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-cyan-300 text-xs font-bold gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Gambar Siap Ditampilkan
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Gambar akan otomatis tampil di kartu kuis peserta dan layar proyektor Admin.
                        </p>

                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => setImagePreviewModalUrl(formData.imageUrl || null)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold border border-cyan-400/30 flex items-center gap-1"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Perbesar</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/30 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus Gambar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* If No Image: Show File Upload or URL Input */
                    <div>
                      {imageInputMode === 'FILE' ? (
                        <label
                          onDragOver={(e) => { e.preventDefault(); setIsDragOverImage(true); }}
                          onDragLeave={() => setIsDragOverImage(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOverImage(false);
                            if (e.dataTransfer.files?.[0]) handleImageFileSelected(e.dataTransfer.files[0]);
                          }}
                          className={`block border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                            isDragOverImage 
                              ? 'border-cyan-400 bg-cyan-500/10' 
                              : 'border-cyan-500/30 hover:border-cyan-400 bg-[#060a14]/60 hover:bg-[#0c1427]'
                          }`}
                        >
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleImageFileSelected(e.target.files[0]);
                            }}
                            className="hidden" 
                          />
                          {isUploadingImage ? (
                            <div className="py-2 flex flex-col items-center justify-center gap-2 text-cyan-300">
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <span className="text-xs font-bold">Memproses & mengompres gambar...</span>
                            </div>
                          ) : (
                            <div className="py-1">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2 text-cyan-300">
                                <ImagePlus className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-white block">
                                Klik untuk Memilih Gambar atau Tarik File ke Sini
                              </span>
                              <span className="text-[11px] text-slate-400 mt-0.5 block">
                                JPG, PNG, WEBP, GIF, SVG (Otomatis dioptimasi untuk kuis)
                              </span>
                            </div>
                          )}
                        </label>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="https://example.com/foto-atau-diagram.png"
                            className="flex-1 p-2.5 bg-[#060a14] border border-cyan-500/20 rounded-xl text-white text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleApplyImageUrl}
                            className="px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-cyan-400 flex items-center gap-1 shrink-0"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Pasang</span>
                          </button>
                        </div>
                      )}

                      {imageUploadError && (
                        <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{imageUploadError}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {formData.jenisSoal !== 'SHORT_ANSWER' && formData.jenisSoal !== 'TRUE_FALSE' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-rose-400 mb-1">Opsi A *</label>
                    <input
                      type="text"
                      value={formData.opsiA}
                      onChange={(e) => setFormData({ ...formData, opsiA: e.target.value })}
                      className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-cyan-400 mb-1">Opsi B *</label>
                    <input
                      type="text"
                      value={formData.opsiB}
                      onChange={(e) => setFormData({ ...formData, opsiB: e.target.value })}
                      className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 mb-1">Opsi C</label>
                    <input
                      type="text"
                      value={formData.opsiC}
                      onChange={(e) => setFormData({ ...formData, opsiC: e.target.value })}
                      className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">Opsi D</label>
                    <input
                      type="text"
                      value={formData.opsiD}
                      onChange={(e) => setFormData({ ...formData, opsiD: e.target.value })}
                      className="w-full p-2.5 bg-[#080d19] border border-cyan-500/20 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingQuestion(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:opacity-90 flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Soal</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Questions List */}
          <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white font-display">
                  Daftar Soal ({currentPackage?.questions.length || 0} Butir)
                </h3>
              </div>
            </div>

            {(!currentPackage || currentPackage.questions.length === 0) ? (
              <div className="py-12 text-center text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-400" />
                <p className="text-sm">Belum ada soal di paket kuis ini.</p>
                <p className="text-xs text-slate-400 mt-1">Import file CSV atau tambah soal manual di atas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentPackage.questions.map((q, idx) => (
                  <div 
                    key={q.id}
                    className="p-4 rounded-2xl bg-[#080d19] border border-cyan-500/10 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-[#111c33] text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/20">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-cyan-400">[{q.id}]</span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" /> {q.waktuDetik} detik
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400">{q.poin || 1000} poin</span>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-amber-400">
                            Kunci: {q.jawabanBenar}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">
                          {q.pertanyaan}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px] text-slate-400">
                          <span className={q.jawabanBenar === 'A' ? 'text-emerald-400 font-bold' : ''}>A: {q.opsiA}</span>
                          <span className={q.jawabanBenar === 'B' ? 'text-emerald-400 font-bold' : ''}>B: {q.opsiB}</span>
                          <span className={q.jawabanBenar === 'C' ? 'text-emerald-400 font-bold' : ''}>C: {q.opsiC}</span>
                          <span className={q.jawabanBenar === 'D' ? 'text-emerald-400 font-bold' : ''}>D: {q.opsiD}</span>
                        </div>

                        {q.imageUrl && (
                          <div 
                            onClick={() => setImagePreviewModalUrl(q.imageUrl || null)}
                            className="mt-2.5 inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 cursor-pointer group transition-all"
                            title="Klik untuk memperbesar gambar soal"
                          >
                            <img 
                              src={q.imageUrl} 
                              alt="Thumbnail Soal" 
                              className="w-10 h-10 rounded-lg object-contain bg-black/60 border border-cyan-500/20"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-left">
                              <span className="text-[10px] font-bold uppercase tracking-wider block text-cyan-400 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Ada Lampiran Gambar
                              </span>
                              <span className="text-[11px] text-slate-300 group-hover:text-white flex items-center gap-1">
                                <Eye className="w-3 h-3 text-cyan-400" /> Lihat Gambar
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-2 rounded-xl bg-[#111c33] text-slate-300 hover:text-white border border-white/5 transition-colors"
                        title="Edit Soal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl bg-[#111c33] text-rose-400 hover:bg-rose-500/20 border border-white/5 transition-colors"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CUSTOM TEAMS / KELOMPOK BUILDER                    */}
      {/* ========================================================= */}
      {managerTab === 'TEAMS' && currentPackage && (
        <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Kustomisasi Nama Kelompok Kuis</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Admin dapat menentukan opsi nama kelompok yang akan muncul pada dropdown registrasi mahasiswa untuk kuis ini.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {currentPackage.customTeams.length} Kelompok Terdaftar
            </span>
          </div>

          {/* Add Team Input */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newTeamInput}
              onChange={(e) => setNewTeamInput(e.target.value)}
              placeholder="Contoh: Kelompok Kraken Emas"
              className="flex-1 px-4 py-3 bg-[#080d19] border border-cyan-500/30 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTeam();
                }
              }}
            />
            <button
              onClick={handleAddCustomTeam}
              className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelompok</span>
            </button>
          </div>

          {/* List of custom teams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {currentPackage.customTeams.map((teamName, idx) => (
              <div
                key={teamName}
                className="p-4 rounded-2xl bg-[#080d19] border border-cyan-500/20 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="w-7 h-7 rounded-xl bg-cyan-950 text-cyan-300 font-black text-xs flex items-center justify-center border border-cyan-500/30 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-white truncate" title={teamName}>
                    {teamName}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTeam(teamName)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                  title="Hapus Kelompok"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {managerTab === 'LIBRARY' && (
        <div className="bg-[#0e172a]/95 border border-emerald-500/20 rounded-3xl p-6 shadow-xl space-y-5">
          <div><h3 className="text-lg font-bold text-white">Library Soal</h3><p className="text-xs text-slate-400 mt-1">Cari semua soal dari seluruh paket dengan kode library atau kata kunci yang sama.</p></div>
          <input value={libraryKeyword} onChange={event => setLibraryKeyword(event.target.value)} placeholder="Contoh: NETWORK-BASIC, DNS, algoritma" className="w-full rounded-xl bg-[#080d19] border border-emerald-400/30 px-4 py-3 text-sm text-white uppercase" />
          <div className="space-y-2">
            {quizPackages.flatMap(pkg => pkg.questions.map(question => ({ pkg, question }))).filter(({ question }) => {
              const keyword = libraryKeyword.trim().toLowerCase();
              return keyword && [question.kodeLibrary, question.id, question.pertanyaan].some(value => value?.toLowerCase().includes(keyword));
            }).map(({ pkg, question }) => (
              <div key={`${pkg.id}-${question.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#080d19] border border-white/10 p-4"><div><div className="text-xs text-emerald-300 font-bold">{question.kodeLibrary || 'TANPA-KODE'} • {question.poin || 1000} poin • {question.waktuDetik} detik</div><div className="text-sm text-white font-semibold mt-1">{question.pertanyaan}</div><div className="text-[11px] text-slate-500">Sumber: {pkg.title}</div></div><button type="button" onClick={() => currentPackage && onSaveQuizPackage({ ...currentPackage, questions: currentPackage.questions.some(item => item.id === question.id) ? currentPackage.questions : [...currentPackage.questions, { ...question, id: `${question.id}-${Date.now()}` }], updatedAt: Date.now() })} className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-slate-950">Tambahkan ke Paket</button></div>
            ))}
            {libraryKeyword && !quizPackages.some(pkg => pkg.questions.some(question => [question.kodeLibrary, question.id, question.pertanyaan].some(value => value?.toLowerCase().includes(libraryKeyword.trim().toLowerCase())))) && <p className="py-8 text-center text-sm text-slate-500">Soal dengan kata kunci tersebut belum ditemukan.</p>}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PACKAGES LIBRARY (MULTI-QUIZ)                      */}
      {/* ========================================================= */}
      {managerTab === 'PACKAGES' && (
        <div className="bg-[#0e172a]/95 border border-cyan-500/20 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                Koleksi Bank Paket Kuis
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Semua paket soal kuis yang pernah dibuat. Klik tombol "Mainkan" untuk memutar ulang kuis untuk kelas yang berbeda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`p-5 rounded-3xl border transition-all ${
                  pkg.id === selectedPackageId 
                    ? 'bg-[#101b33] border-cyan-400 shadow-xl shadow-cyan-500/10' 
                    : 'bg-[#080d19] border-cyan-500/20 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                      Kelas: {pkg.targetClass}
                    </span>
                    <h4 className="text-base font-black text-white mt-1">
                      {pkg.title}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-xl shrink-0">
                    🐙
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {pkg.description || 'Tidak ada deskripsi.'}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-white/5">
                  <span>{pkg.questions.length} Butir Soal</span>
                  <span>{pkg.customTeams.length} Kelompok</span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedPackageId(pkg.id);
                      setTargetClassInput(pkg.targetClass);
                      setCustomCodeInput(`OCTO-${Math.floor(100 + Math.random() * 900)}`);
                      setIsPlayModalOpen(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mainkan ke Kelas</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedPackageId(pkg.id);
                      setManagerTab('QUESTIONS');
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#111c33] text-cyan-300 border border-cyan-500/20 text-xs font-semibold hover:text-white"
                  >
                    Buka Soal
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPackageId(pkg.id);
                      setEditingPackageId(pkg.id);
                      setPackageTitle(pkg.title);
                      setPackageDesc(pkg.description || '');
                      setSaveAsNewPackage(false);
                      setIsEditingPackage(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#111c33] text-amber-300 border border-amber-500/20 text-xs font-semibold hover:text-white"
                  >
                    Edit Paket
                  </button>

                  {quizPackages.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus paket kuis "${pkg.title}"?`)) {
                          onDeleteQuizPackage(pkg.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-[#111c33] text-rose-400 hover:bg-rose-500/20 border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW QUIZ PACKAGE                            */}
      {/* ========================================================= */}
      {isEditingPackage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e172a] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cyan-500/20">
              <h3 className="text-xl font-black text-white font-display flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-cyan-400" />
                <span>{editingPackageId ? 'Edit Paket Kuis' : 'Buat Paket Kuis Baru'}</span>
              </h3>
              <button onClick={() => setIsEditingPackage(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-cyan-200 mb-1">
                  Nama / Judul Kuis *
                </label>
                <input
                  type="text"
                  value={packageTitle}
                  onChange={(e) => setPackageTitle(e.target.value)}
                  placeholder="Contoh: Kuis Pemrograman Web Lanjut"
                  required
                  className="w-full px-4 py-3 bg-[#080d19] border border-cyan-500/30 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-cyan-200 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={packageDesc}
                  onChange={(e) => setPackageDesc(e.target.value)}
                  placeholder="Catatan materi atau petunjuk pengerjaan..."
                  className="w-full px-4 py-3 bg-[#080d19] border border-cyan-500/30 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              {editingPackageId && (
                <label className="flex items-center gap-2 text-xs text-amber-200 cursor-pointer">
                  <input type="checkbox" checked={saveAsNewPackage} onChange={event => setSaveAsNewPackage(event.target.checked)} />
                  Simpan sebagai paket baru (paket lama tetap dipertahankan)
                </label>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingPackage(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md"
                >
                  {editingPackageId && !saveAsNewPackage ? 'Simpan Perubahan Paket' : 'Simpan Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PLAY QUIZ WITH NEW CLASS & CODE                    */}
      {/* ========================================================= */}
      {isPlayModalOpen && currentPackage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e172a] border-2 border-emerald-400/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-3 border border-emerald-400/30">
                <Play className="w-7 h-7 fill-current" />
              </div>
              <h3 className="text-xl font-black text-white font-display">
                Mulai Sesi Kuis Baru
              </h3>
              <p className="text-xs text-cyan-200/70 mt-1">
                Kuis: <strong className="text-white">{currentPackage.title}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-cyan-200 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Kode Kuis Sesi Ini</span>
                </label>
                <input
                  type="text"
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: OCTO-842"
                  className="w-full px-4 py-3 bg-[#080d19] border border-cyan-400/50 rounded-2xl text-cyan-200 font-mono font-black text-lg tracking-widest uppercase focus:outline-none focus:border-cyan-300"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Kode ini yang akan dimasukkan oleh mahasiswa saat registrasi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-cyan-200 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>Target Kelas Sesi Ini</span>
                </label>
                <input
                  type="text"
                  value={targetClassInput}
                  onChange={(e) => setTargetClassInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: TI-3B, Agribisnis 1"
                  className="w-full px-4 py-3 bg-[#080d19] border border-cyan-500/30 rounded-2xl text-white font-bold text-sm uppercase focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPlayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleStartPlay}
                  className="px-6 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 hover:scale-105 shadow-xl shadow-emerald-400/30 cursor-pointer"
                >
                  BUKA RUANG TUNGGU (LOBBY)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Full-Screen Image Lightbox Modal */}
      {imagePreviewModalUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setImagePreviewModalUrl(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-[#0c1426] border border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <ImageIcon className="w-4 h-4" />
                <span>Pratinjau Gambar Soal</span>
              </div>
              <button
                onClick={() => setImagePreviewModalUrl(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[72vh] max-w-full overflow-auto flex items-center justify-center p-2">
              <img 
                src={imagePreviewModalUrl} 
                alt="Gambar Soal Ukuran Penuh" 
                className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-lg border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-3 text-xs text-slate-400">
              Klik di luar gambar atau tekan tombol silang untuk menutup
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
