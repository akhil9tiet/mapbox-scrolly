import { produce } from 'immer';
import type { Chapter } from '../../../types';

export interface ChapterState {
  chapters: Chapter[];
  activeChapterId: string | null;
  completedChapterIds: string[];
}

export const initialChapterState: ChapterState = {
  chapters: [],
  activeChapterId: null,
  completedChapterIds: [],
};

export const chapterActions = {
  setChapters: (chapters: Chapter[]) => ({
    type: 'chapter/setChapters' as const,
    payload: chapters,
  }),
  setActiveChapterId: (activeChapterId: string | null) => ({
    type: 'chapter/setActiveChapterId' as const,
    payload: activeChapterId,
  }),
  markChapterCompleted: (chapterId: string) => ({
    type: 'chapter/markChapterCompleted' as const,
    payload: chapterId,
  }),
};

export type ChapterAction = ReturnType<
  (typeof chapterActions)[keyof typeof chapterActions]
>;

export const chapterReducer = produce(
  (draft: ChapterState, action: ChapterAction) => {
    switch (action.type) {
      case 'chapter/setChapters':
        draft.chapters = action.payload;
        break;
      case 'chapter/setActiveChapterId':
        draft.activeChapterId = action.payload;
        break;
      case 'chapter/markChapterCompleted':
        if (!draft.completedChapterIds.includes(action.payload)) {
          draft.completedChapterIds.push(action.payload);
        }
        break;
    }
  },
  initialChapterState
);
