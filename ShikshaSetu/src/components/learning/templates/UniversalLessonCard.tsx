import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { NormalizedLesson } from '../../../types/connectivity';
import { BookOpen, HardDriveDownload, Video, Volume2, ArrowRight } from 'lucide-react';

interface UniversalLessonCardProps {
  lesson: NormalizedLesson;
  onOpenLesson?: (lessonId: string) => void;
  onSaveOffline?: (lessonId: string) => void;
}

export const UniversalLessonCard: React.FC<UniversalLessonCardProps> = ({
  lesson,
  onOpenLesson,
  onSaveOffline,
}) => {
  return (
    <Card variant="elevated" className="border-slate-200 hover:border-brand-300 transition-all flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="brand" size="sm">
            {lesson.subject} • Gr {lesson.grade}
          </Badge>
          <span className="text-[10px] text-slate-400 font-semibold">
            {Math.round(lesson.byteSize / 1024)} KB payload
          </span>
        </div>
        <CardTitle className="text-base font-extrabold text-slate-900 leading-snug">
          {lesson.title}
        </CardTitle>
        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
          {lesson.shortExplanation}
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Key Concepts Pills */}
        <div className="flex flex-wrap gap-1.5">
          {lesson.keyConcepts.map((c, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[10px] text-slate-700 font-medium"
            >
              {c}
            </span>
          ))}
        </div>

        {/* Media indicator */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            {lesson.videoUrl && (
              <span className="flex items-center gap-1 text-[11px]">
                <Video className="w-3.5 h-3.5 text-brand-600" /> Video
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px]">
              <Volume2 className="w-3.5 h-3.5 text-saffron-600" /> Audio
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Text
            </span>
          </div>

          <Button
            size="sm"
            variant="saffron"
            onClick={() => onOpenLesson && onOpenLesson(lesson.id)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Open Lesson
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
