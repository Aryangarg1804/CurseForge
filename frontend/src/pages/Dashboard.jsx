import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, HelpCircle, Code2,
  Pencil, Target, Menu, X, Lock, CheckCircle2,
} from "lucide-react";
import QuizComponent from "@/components/QuizComponent";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import WelcomeScreen from "@/components/dashboard/WelcomeScreen";
import CourseContent from "@/components/dashboard/CourseContent";
import CodeChallenges from "@/components/dashboard/CodeChallenges";
import EditCourse from "@/components/dashboard/EditCourse";
import CourseCreationModal from "@/components/dashboard/CourseCreationModal";
import CourseGenerationProgress from "@/components/dashboard/CourseGenerationProgress";
import { courseAPI } from "@/lib/api";

const actionTabs = [
  { id: "content", label: "Course Content", icon: BookOpen },
  { id: "quiz", label: "Quiz Questions", icon: HelpCircle },
  { id: "objective", label: "Subjective Ques", icon: Target },
  { id: "code", label: "Code Questions", icon: Code2 },
  { id: "edit", label: "Edit Course", icon: Pencil },
];

const QUIZ_CACHE_KEY = "lessonQuizCache";
const SUBJECTIVE_CACHE_KEY = "lessonSubjectiveCache";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("welcome");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [activeLesson, setActiveLesson] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [createQuery, setCreateQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generationStage, setGenerationStage] = useState("analyzing");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [completedMap, setCompletedMap] = useState({});
  const [quizMode, setQuizMode] = useState("lesson");
  const [quizCount, setQuizCount] = useState(5);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [quizSessionId, setQuizSessionId] = useState(0);
  const [showLessonQuizPlayer, setShowLessonQuizPlayer] = useState(true);
  const [subjectiveCount, setSubjectiveCount] = useState(5);
  const [subjectiveLoading, setSubjectiveLoading] = useState(false);
  const [subjectiveError, setSubjectiveError] = useState("");
  const [quizCache, setQuizCache] = useState(() => {
    try {
      const stored = localStorage.getItem(QUIZ_CACHE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  });
  const [subjectiveCache, setSubjectiveCache] = useState(() => {
    try {
      const stored = localStorage.getItem(SUBJECTIVE_CACHE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  });

  // Load courses from API on mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const fetchedCourses = await courseAPI.getAllCourses();
        const storedMap = JSON.parse(localStorage.getItem("courseCompletions") || "{}");
        setCompletedMap(storedMap);
        // Transform backend data to match frontend format
        const transformedCourses = fetchedCourses.map((course) => ({
          id: course._id || course.courseId,
          title: course.courseTitle || course.title,
          description: `Learn ${course.topic} with ${course.lessons?.length || 0} comprehensive modules`,
          progress: 0,
          totalLessons: course.lessons?.length || 0,
          completedLessons: storedMap[course._id || course.courseId]?.length || 0,
          completedLessonIds: storedMap[course._id || course.courseId] || [],
          lessons: course.lessons?.map((lesson, index) => ({
            id: index + 1,
            title: lesson.title,
            content: lesson.content,
            quiz: lesson.quiz || [],
            keyPoints: lesson.keyPoints || [],
            quizProgress: lesson.quizProgress || { completed: false, score: 0, total: 0, weakPoints: [], incorrect: [] },
          })) || [],
        }));
        setCourses(transformedCourses);
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]); // Set empty array on error
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setViewMode("course");
    setActiveTab("content");
    setActiveLesson(0);
    setQuizMode("lesson");
    setQuizError("");
    setSubjectiveError("");
    setMobileMenuOpen(false);
  };

  const persistQuizCache = (nextCache) => {
    setQuizCache(nextCache);
    localStorage.setItem(QUIZ_CACHE_KEY, JSON.stringify(nextCache));
  };

  const persistSubjectiveCache = (nextCache) => {
    setSubjectiveCache(nextCache);
    localStorage.setItem(SUBJECTIVE_CACHE_KEY, JSON.stringify(nextCache));
  };

  const normalizeQuestions = (questions = []) => {
    if (!Array.isArray(questions)) return [];
    return questions.map((q) => {
      const options = Array.isArray(q.options) ? q.options : [];
      let correctAnswer = Number.isInteger(q.correctAnswer) ? q.correctAnswer : -1;
      if (correctAnswer < 0 && typeof q.answer === "string") {
        correctAnswer = options.findIndex((opt) => opt === q.answer);
      }
      if (correctAnswer < 0) correctAnswer = 0;
      return {
        ...q,
        options,
        correctAnswer,
        explanation: q.explanation || "No explanation provided."
      };
    });
  };

  const handleGenerateQuiz = async (mode) => {
    if (!selectedCourse) return;
    if (mode === "lesson") {
      const unlocked = activeLesson === 0 || selectedCourse?.lessons?.[activeLesson - 1]?.quizProgress?.completed;
      if (!unlocked) {
        setQuizError("Complete the previous lesson quiz to unlock this one.");
        return;
      }
    }
    if (mode === "extra") {
      const lessonDone = selectedCourse?.completedLessonIds?.includes(activeLesson + 1);
      const quizDone = selectedCourse?.lessons?.[activeLesson]?.quizProgress?.completed;
      if (!lessonDone || !quizDone) {
        setQuizError("Complete the lesson and its quiz first.");
        return;
      }
    }
    setQuizLoading(true);
    setQuizError("");
    try {
      const response = await courseAPI.generateLessonQuiz(
        selectedCourse.id,
        activeLesson,
        mode === "extra" ? quizCount : 5,
        mode
      );
      const questions = response?.questions || [];
      const courseId = selectedCourse.id;
      const lessonId = activeLesson + 1;
      const nextCache = {
        ...quizCache,
        [courseId]: {
          ...(quizCache[courseId] || {}),
          [lessonId]: {
            ...(quizCache[courseId]?.[lessonId] || {}),
            [mode]: questions
          }
        }
      };
      persistQuizCache(nextCache);
      if (mode === "lesson") {
        setShowLessonQuizPlayer(true);
      }
      setQuizSessionId((s) => s + 1);
    } catch (error) {
      setQuizError(error.message || "Failed to generate quiz. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizComplete = async (payload) => {
    if (!selectedCourse) return;
    try {
      const response = await courseAPI.submitLessonQuiz(
        selectedCourse.id,
        activeLesson,
        payload
      );
      const updated = response?.quizProgress;
      if (!updated) return;

      setCourses((prev) =>
        prev.map((course) => {
          if (course.id !== selectedCourse.id) return course;
          const nextLessons = course.lessons.map((lesson, idx) =>
            idx === activeLesson ? { ...lesson, quizProgress: updated } : lesson
          );
          return { ...course, lessons: nextLessons };
        })
      );

      setSelectedCourse((prev) => {
        if (!prev) return prev;
        const nextLessons = prev.lessons.map((lesson, idx) =>
          idx === activeLesson ? { ...lesson, quizProgress: updated } : lesson
        );
        return { ...prev, lessons: nextLessons };
      });

      // Do not auto-restart a completed quiz unless user explicitly retries.
      setShowLessonQuizPlayer(false);
    } catch (error) {
      setQuizError(error.message || "Failed to save quiz results.");
    }
  };

  useEffect(() => {
    setQuizError("");
  }, [selectedCourse?.id, activeLesson, quizMode]);

  useEffect(() => {
    setSubjectiveError("");
  }, [selectedCourse?.id, activeLesson]);

  useEffect(() => {
    if (quizMode !== "lesson") return;
    const completed = Boolean(selectedCourse?.lessons?.[activeLesson]?.quizProgress?.completed);
    setShowLessonQuizPlayer(!completed);
  }, [selectedCourse, activeLesson, quizMode]);

  useEffect(() => {
    setQuizSessionId((s) => s + 1);
  }, [selectedCourse?.id, activeLesson, quizMode]);

  const normalizeSubjectiveQuestions = (questions = []) => {
    if (!Array.isArray(questions)) return [];
    return questions
      .filter((q) => q && typeof q.question === "string")
      .map((q) => ({
        question: q.question.trim(),
        expectedAnswer: typeof q.expectedAnswer === "string" && q.expectedAnswer.trim()
          ? q.expectedAnswer.trim()
          : "No expected answer provided.",
        keyPoints: Array.isArray(q.keyPoints)
          ? q.keyPoints.filter((point) => typeof point === "string")
          : [],
      }));
  };

  const handleGenerateSubjective = async () => {
    if (!selectedCourse) return;
    const lessonDone = selectedCourse?.completedLessonIds?.includes(activeLesson + 1);
    if (!lessonDone) {
      setSubjectiveError("Complete this lesson first to unlock subjective questions.");
      return;
    }
    setSubjectiveLoading(true);
    setSubjectiveError("");
    try {
      const response = await courseAPI.generateLessonSubjective(
        selectedCourse.id,
        activeLesson,
        subjectiveCount
      );
      const questions = response?.questions || [];
      const courseId = selectedCourse.id;
      const lessonId = activeLesson + 1;
      const nextCache = {
        ...subjectiveCache,
        [courseId]: {
          ...(subjectiveCache[courseId] || {}),
          [lessonId]: questions,
        },
      };
      persistSubjectiveCache(nextCache);
    } catch (error) {
      setSubjectiveError(error.message || "Failed to generate subjective questions.");
    } finally {
      setSubjectiveLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (!createQuery.trim()) return;
    setShowModal(true);
  };

  const handleCreate = async (options) => {
    try {
      setCreating(true);
      setGenerationProgress(0);
      
      // Stage 1: Analyzing
      setGenerationStage("analyzing");
      setGenerationProgress(25);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage 2: Generating
      setGenerationStage("generating");
      setGenerationProgress(50);
      
      // Call backend API
      const course = await courseAPI.generateCourse(options);
      
      // Stage 3: Complete
      setGenerationStage("complete");
      setGenerationProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Transform course data to match expected format
      const transformedCourse = {
        id: course.courseId || course._id || Date.now().toString(),
        title: course.courseTitle,
        description: `Learn ${options.topic} with ${options.modules} comprehensive modules`,
        progress: 0,
        totalLessons: course.lessons?.length || 0,
        completedLessons: 0,
        completedLessonIds: [],
        lessons: course.lessons.map((lesson, index) => ({
          id: index + 1,
          title: lesson.title,
          content: lesson.content,
          quiz: lesson.quiz || [],
          quizProgress: lesson.quizProgress || { completed: false, score: 0, total: 0, weakPoints: [], incorrect: [] },
        })),
      };
      
      // Add new course to the courses list
      setCourses((prevCourses) => [transformedCourse, ...prevCourses]);
      persistCompletions({ ...completedMap, [transformedCourse.id]: [] });
      
      setCreating(false);
      selectCourse(transformedCourse);
    } catch (error) {
      console.error('Error generating course:', error);
      setCreating(false);
      alert(error.message || 'Failed to generate course. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const target = courses.find((c) => c.id === courseId);
    const name = target?.title || "this course";
    const confirmed = window.confirm(`Delete ${name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await courseAPI.deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      if (selectedCourse?.id === courseId) {
        handleNewCourse();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(error.message || 'Failed to delete course. Please try again.');
    }
  };

  const handleNewCourse = () => { 
    setViewMode("welcome"); 
    setSelectedCourse(null); 
    setCreateQuery(""); 
    setMobileMenuOpen(false); 
  };

  function persistCompletions(nextMap) {
    setCompletedMap(nextMap);
    localStorage.setItem("courseCompletions", JSON.stringify(nextMap));
  }

  function toggleLessonComplete(courseId, lessonId) {
    const current = completedMap[courseId] || [];
    const exists = current.includes(lessonId);
    const nextIds = exists ? current.filter((id) => id !== lessonId) : [...current, lessonId];
    const nextMap = { ...completedMap, [courseId]: nextIds };
    persistCompletions(nextMap);

    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              completedLessonIds: nextIds,
              completedLessons: nextIds.length,
            }
          : course
      )
    );

    if (selectedCourse?.id === courseId) {
      setSelectedCourse((prev) =>
        prev
          ? {
              ...prev,
              completedLessonIds: nextIds,
              completedLessons: nextIds.length,
            }
          : prev
      );
    }
  }

  const currentLesson = selectedCourse?.lessons?.[activeLesson];
  const currentCourseId = selectedCourse?.id;
  const currentLessonId = activeLesson + 1;
  const courseQuizCache = currentCourseId ? quizCache[currentCourseId] || {} : {};
  const cachedLessonQuiz = courseQuizCache?.[currentLessonId]?.lesson || currentLesson?.quiz || [];
  const cachedExtraQuiz = courseQuizCache?.[currentLessonId]?.extra || [];
  const lessonQuestions = normalizeQuestions(cachedLessonQuiz);
  const extraQuestions = normalizeQuestions(cachedExtraQuiz);
  const courseSubjectiveCache = currentCourseId ? subjectiveCache[currentCourseId] || {} : {};
  const cachedSubjectiveQuestions = courseSubjectiveCache?.[currentLessonId] || [];
  const subjectiveQuestions = normalizeSubjectiveQuestions(cachedSubjectiveQuestions);
  const isLessonComplete = selectedCourse?.completedLessonIds?.includes(currentLessonId);
  const isQuizUnlocked = activeLesson === 0 || selectedCourse?.lessons?.[activeLesson - 1]?.quizProgress?.completed;
  const currentQuizProgress = currentLesson?.quizProgress;
  const lessonQuizStates = (selectedCourse?.lessons || []).map((lesson, idx) => {
    const unlocked = idx === 0 || selectedCourse?.lessons?.[idx - 1]?.quizProgress?.completed;
    const completed = Boolean(lesson?.quizProgress?.completed);
    return { idx, lesson, unlocked, completed };
  });
  const quizProgressList = selectedCourse?.lessons?.map((lesson) => lesson.quizProgress) || [];
  const allQuizzesCompleted = quizProgressList.length > 0 && quizProgressList.every((qp) => qp?.completed);
  const totalQuizScore = quizProgressList.reduce((acc, qp) => acc + (qp?.score || 0), 0);
  const totalQuizQuestions = quizProgressList.reduce((acc, qp) => acc + (qp?.total || 0), 0);
  const overallWeakPoints = quizProgressList
    .flatMap((qp) => qp?.weakPoints || [])
    .filter(Boolean);

  return (
    <div className="min-h-screen flex relative">
      {/* Course Creation Modal */}
      <CourseCreationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        topic={createQuery}
        onGenerate={handleCreate}
      />

      {/* Generation Progress */}
      {creating && (
        <CourseGenerationProgress
          stage={generationStage}
          progress={generationProgress}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black/90 border border-white/10 text-white hover:bg-white/5 transition-colors"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`h-screen border-r border-white/10 bg-black flex flex-col z-40 shrink-0 transition-transform duration-300 fixed left-0 lg:sticky lg:top-0 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
        animate={{
          width: sidebarCollapsed ? 60 : 280
        }}
        transition={{ duration: 0.3 }}
      >
        <DashboardSidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          courses={courses}
          selectedCourse={selectedCourse}
          onSelectCourse={selectCourse}
          onNewCourse={handleNewCourse}
          onDeleteCourse={handleDeleteCourse}
        />
      </motion.aside>

      {/* Main */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-black w-full">
        <AnimatePresence mode="wait">
          {viewMode === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <WelcomeScreen
                createQuery={createQuery}
                setCreateQuery={setCreateQuery}
                creating={creating}
                onGenerate={handleOpenModal}
              />
            </motion.div>
          )}

          {viewMode === "course" && selectedCourse && (
            <motion.div key="course" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col">
              {/* Action Tabs */}
              <div className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-xl">
                <div className="flex overflow-x-auto px-3 sm:px-4 scrollbar-hide">
                  {actionTabs.map((tab) => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); }} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? "border-white text-white" : "border-transparent text-white/50 hover:text-white hover:border-white/30"}`}>
                      <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 pt-6 sm:pt-10 pb-8 px-4 sm:px-6 lg:pt-20 lg:pb-12 lg:px-10 max-w-4xl mx-auto w-full">
                <AnimatePresence mode="wait">
                  {/* Content */}
                  {activeTab === "content" && (
                    <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <CourseContent
                        course={selectedCourse}
                        activeLesson={activeLesson}
                        setActiveLesson={setActiveLesson}
                        onToggleComplete={() => toggleLessonComplete(selectedCourse.id, activeLesson + 1)}
                        isLessonComplete={selectedCourse.completedLessonIds?.includes(activeLesson + 1)}
                      />
                    </motion.div>
                  )}

                  {/* Quiz */}
                  {activeTab === "quiz" && (
                    <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                          Quiz Questions
                        </h2>
                        <p className="text-white/60">
                          Choose how you want to practice for this lesson.
                        </p>
                      </div>

                      {allQuizzesCompleted && (
                        <div className="mb-8 glass-card rounded-2xl p-5 border border-white/10">
                          <div className="text-white font-semibold mb-2">Course Quiz Summary</div>
                          <div className="text-white/60 text-sm mb-3">
                            Total score: <span className="text-white">{totalQuizScore}</span> / {totalQuizQuestions}
                          </div>
                          {overallWeakPoints.length > 0 && (
                            <div className="text-sm text-white/60 space-y-2">
                              {overallWeakPoints.slice(0, 6).map((point, idx) => (
                                <div key={idx} className="p-2 rounded-lg border border-white/10 bg-white/5">
                                  {point}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mb-6">
                        <button
                          onClick={() => setQuizMode("lesson")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            quizMode === "lesson"
                              ? "border-white text-white bg-white/10"
                              : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                          }`}
                        >
                          Lesson Wise Quiz
                        </button>
                        <button
                          onClick={() => setQuizMode("extra")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            quizMode === "extra"
                              ? "border-white text-white bg-white/10"
                              : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                          }`}
                        >
                          Generate More Questions
                        </button>
                      </div>

                      {quizMode === "lesson" && (
                        <div className="glass-card rounded-2xl p-6 border border-white/10">
                          <div className="mb-6">
                            <div className="text-white/70 text-xs uppercase tracking-wider mb-3">Select Lesson</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {lessonQuizStates.map(({ idx, lesson, unlocked, completed }) => {
                                const isActive = idx === activeLesson;
                                return (
                                  <button
                                    key={`lesson-quiz-${idx}`}
                                    type="button"
                                    onClick={() => {
                                      if (!unlocked) {
                                        setQuizError("Complete the previous lesson quiz to unlock this one.");
                                        return;
                                      }
                                      setActiveLesson(idx);
                                      setQuizError("");
                                    }}
                                    className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                                      isActive
                                        ? "border-white bg-white/10"
                                        : unlocked
                                          ? "border-white/15 bg-white/5 hover:border-white/30"
                                          : "border-white/10 bg-white/0 opacity-70"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="text-[11px] text-white/50 font-mono">Lesson {idx + 1}</div>
                                        <div className="text-sm text-white line-clamp-2">{lesson?.title || `Lesson ${idx + 1}`}</div>
                                      </div>
                                      <div className="shrink-0 mt-0.5">
                                        {!unlocked ? (
                                          <Lock className="w-4 h-4 text-white/50" />
                                        ) : completed ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <span className="text-[10px] px-2 py-1 rounded-md border border-white/20 text-white/60">Open</span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white">Lesson Wise Quiz</h3>
                              <p className="text-white/50 text-sm">
                                {currentLesson?.title || "Select a lesson to get started."}
                              </p>
                            </div>
                            <button
                              onClick={() => handleGenerateQuiz("lesson")}
                              disabled={quizLoading || !currentLesson || !isQuizUnlocked}
                              className="glow-button px-4 py-2 rounded-lg text-xs font-medium text-primary-foreground disabled:opacity-50 disabled:pointer-events-none"
                            >
                              {quizLoading
                                ? "Generating..."
                                : currentQuizProgress?.completed
                                  ? "Retry Quiz"
                                  : "Generate Quiz"}
                            </button>
                          </div>

                          {!isQuizUnlocked && (
                            <div className="mb-4 text-sm text-white/60">
                              Complete the previous lesson quiz to unlock this one.
                            </div>
                          )}

                          {quizError && (
                            <div className="mb-4 text-sm text-red-400">{quizError}</div>
                          )}

                          {currentQuizProgress?.completed && !showLessonQuizPlayer ? (
                            <div className="mb-4 rounded-xl border border-white/15 bg-white/5 p-4">
                              <div className="text-white/60 text-sm mb-2">Last score</div>
                              <div className="text-white text-lg font-semibold mb-3">
                                {currentQuizProgress.score} / {currentQuizProgress.total}
                              </div>
                              {Array.isArray(currentQuizProgress?.weakPoints) && currentQuizProgress.weakPoints.length > 0 && (
                                <div className="text-xs text-white/60 space-y-1">
                                  <div className="text-white/70">Focus areas:</div>
                                  {currentQuizProgress.weakPoints.slice(0, 3).map((point, idx) => (
                                    <div key={`weak-${idx}`} className="truncate">• {point}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : lessonQuestions.length > 0 ? (
                            <QuizComponent
                              key={`lesson-${currentLessonId}-${quizSessionId}`}
                              questions={lessonQuestions}
                              onComplete={handleQuizComplete}
                            />
                          ) : (
                            <div className="text-white/60 text-sm">
                              No quiz generated for this lesson yet. Click "Generate Quiz" to begin.
                            </div>
                          )}
                        </div>
                      )}

                      {quizMode === "extra" && (
                        <div className="glass-card rounded-2xl p-6 border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white">Generate More Questions</h3>
                              <p className="text-white/50 text-sm">
                                Unlock extra practice after completing the lesson.
                              </p>
                            </div>
                          </div>

                          {(!isLessonComplete || !currentQuizProgress?.completed) && (
                            <div className="text-white/60 text-sm mb-4">
                              Complete the lesson and its quiz to generate more questions.
                            </div>
                          )}

                          {isLessonComplete && currentQuizProgress?.completed && (
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                              <label className="text-white/60 text-sm">Number of Questions</label>
                              <select
                                value={quizCount}
                                onChange={(e) => setQuizCount(Number(e.target.value))}
                                className="bg-black/60 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
                              >
                                <option value={3}>3</option>
                                <option value={5}>5</option>
                                <option value={8}>8</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                              </select>
                              <button
                                onClick={() => handleGenerateQuiz("extra")}
                                disabled={quizLoading}
                                className="glow-button px-4 py-2 rounded-lg text-xs font-medium text-primary-foreground disabled:opacity-50 disabled:pointer-events-none"
                              >
                                {quizLoading ? "Generating..." : "Generate More"}
                              </button>
                            </div>
                          )}

                          {quizError && (
                            <div className="mb-4 text-sm text-red-400">{quizError}</div>
                          )}

                          {extraQuestions.length > 0 ? (
                            <QuizComponent
                              key={`extra-${currentLessonId}-${quizSessionId}`}
                              questions={extraQuestions}
                              onComplete={() => {}}
                            />
                          ) : (
                            <div className="text-white/60 text-sm">
                              Generate extra questions to keep practicing this lesson.
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Subjective */}
                  {activeTab === "objective" && (
                    <motion.div key="objective" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                          Subjective Questions
                        </h2>
                        <p className="text-white/60">
                          Generate open-ended questions for deeper understanding of each completed lesson.
                        </p>
                      </div>

                      <div className="glass-card rounded-2xl p-6 border border-white/10">
                        <div className="mb-5">
                          <div className="text-white/70 text-xs uppercase tracking-wider mb-3">Select Lesson</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(selectedCourse?.lessons || []).map((lesson, idx) => {
                              const lessonDone = selectedCourse?.completedLessonIds?.includes(idx + 1);
                              const isActive = idx === activeLesson;
                              return (
                                <button
                                  key={`subjective-lesson-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setActiveLesson(idx);
                                    setSubjectiveError("");
                                  }}
                                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                                    isActive
                                      ? "border-white bg-white/10"
                                      : lessonDone
                                        ? "border-white/15 bg-white/5 hover:border-white/30"
                                        : "border-white/10 bg-white/0 opacity-70"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="text-[11px] text-white/50 font-mono">Lesson {idx + 1}</div>
                                      <div className="text-sm text-white line-clamp-2">{lesson?.title || `Lesson ${idx + 1}`}</div>
                                    </div>
                                    <div className="shrink-0 mt-0.5">
                                      {lessonDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Lock className="w-4 h-4 text-white/50" />
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <label className="text-white/60 text-sm">Number of Questions</label>
                          <select
                            value={subjectiveCount}
                            onChange={(e) => setSubjectiveCount(Number(e.target.value))}
                            className="bg-black/60 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
                          >
                            <option value={3}>3</option>
                            <option value={5}>5</option>
                            <option value={8}>8</option>
                            <option value={10}>10</option>
                          </select>
                          <button
                            onClick={handleGenerateSubjective}
                            disabled={subjectiveLoading || !currentLesson}
                            className="glow-button px-4 py-2 rounded-lg text-xs font-medium text-primary-foreground disabled:opacity-50 disabled:pointer-events-none"
                          >
                            {subjectiveLoading ? "Generating..." : "Generate Subjective Questions"}
                          </button>
                        </div>

                        {!isLessonComplete && (
                          <div className="mb-4 text-sm text-white/60">
                            Complete this lesson in Course Content to unlock subjective questions.
                          </div>
                        )}

                        {subjectiveError && (
                          <div className="mb-4 text-sm text-red-400">{subjectiveError}</div>
                        )}

                        {subjectiveQuestions.length > 0 ? (
                          <div className="space-y-3">
                            {subjectiveQuestions.map((item, idx) => (
                              <details key={`sq-${idx}`} className="rounded-xl border border-white/15 bg-white/5 p-4">
                                <summary className="cursor-pointer text-white font-medium">
                                  Q{idx + 1}. {item.question}
                                </summary>
                                <div className="mt-3 text-sm text-white/70 whitespace-pre-wrap">
                                  <div className="text-white/90 font-medium mb-1">Expected Answer</div>
                                  {item.expectedAnswer}
                                </div>
                                {item.keyPoints.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-xs text-white/60 mb-1">Key Points</div>
                                    <div className="text-sm text-white/75 space-y-1">
                                      {item.keyPoints.map((point, pointIdx) => (
                                        <div key={`kp-${idx}-${pointIdx}`}>• {point}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </details>
                            ))}
                          </div>
                        ) : (
                          <div className="text-white/60 text-sm">
                            No subjective questions yet. Choose a completed lesson and click Generate Subjective Questions.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Code */}
                  {activeTab === "code" && (
                    <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                          <Code2 className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
                          Coming Soon
                        </h3>
                        <p className="text-white/60 max-w-md mx-auto">
                          Coding challenges with real-world problems will be added to help you practice.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Edit */}
                  {activeTab === "edit" && (
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <EditCourse course={selectedCourse} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
