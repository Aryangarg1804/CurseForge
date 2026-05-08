const EditCourse = ({ course }) => {
  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
        Edit Course
      </h2>
      
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Course Title
          </label>
          <input 
            type="text" 
            defaultValue={course.title} 
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card/30 border border-border/30 rounded-xl text-sm sm:text-base text-foreground focus:outline-none focus:border-primary/30" 
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Description
          </label>
          <textarea 
            defaultValue={course.description} 
            rows={3} 
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card/30 border border-border/30 rounded-xl text-sm sm:text-base text-foreground focus:outline-none focus:border-primary/30 resize-none" 
          />
        </div>
        
        {course.lessons.map((lesson, i) => (
          <div key={lesson.id} className="border border-border/30 rounded-xl p-3 sm:p-4 bg-card/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-mono text-primary shrink-0">
                {i + 1}
              </span>
              <input 
                type="text" 
                defaultValue={lesson.title} 
                className="flex-1 px-3 py-2 bg-transparent border border-border/20 rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/30" 
              />
            </div>
          </div>
        ))}
        
        <button className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>
    </>
  );
};

export default EditCourse;
