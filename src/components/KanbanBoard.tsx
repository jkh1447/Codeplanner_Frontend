// src/components/KanbanBoard.tsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import './KanbanBoard.css';

interface Card {
  id: number;
  title: string;
  type: string;
  priority: string;
  assignee: string;
  start?: string;
  due?: string;
}

interface Column {
  id: string;
  title: string;
  sprint?: string;
  cards: Card[];
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'TODO',
    sprint: 'Sprint 1 (06.01 – 06.14)',
    cards: [
      { id: 1, title: '로그인 페이지 버그 수정', type: '버그', priority: '높음', assignee: '김기현', start: '2025-06-01', due: '2025-06-04' },
      { id: 2, title: '새 API 엔드포인트 개발', type: '기능', priority: '보통', assignee: '이학진', start: '2025-06-02', due: '2025-06-10' },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    sprint: 'Sprint 1 (06.01 – 06.14)',
    cards: [
      { id: 3, title: '대시보드 UI 개선', type: '개선', priority: '높음', assignee: '박디자인', start: '2025-06-03', due: '2025-06-12' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    sprint: 'Sprint 0 (05.15 – 05.31)',
    cards: [
      { id: 4, title: '회원가입 기능 구현', type: '기능', priority: '높음', assignee: '김기현', start: '2025-05-20', due: '2025-05-28' },
    ],
  },
];

const typeColorMap: Record<string, string> = {
  버그: 'bg-red-100 text-red-800',
  기능: 'bg-blue-100 text-blue-800',
  개선: 'bg-green-100 text-green-800',
};

const renderPeriod = (start?: string, due?: string) => {
  if (!start || !due) return null;
  const s = new Date(start).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
  const d = new Date(due).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
  return `${s} – ${d}`;
};

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState(initialColumns);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    const srcColIdx = columns.findIndex(col => col.id === source.droppableId);
    const destColIdx = columns.findIndex(col => col.id === destination.droppableId);
    const srcCol = columns[srcColIdx];
    const destCol = columns[destColIdx];
    const [moved] = srcCol.cards.splice(source.index, 1);

    if (srcCol === destCol) {
      srcCol.cards.splice(destination.index, 0, moved);
      const newCols = [...columns];
      newCols[srcColIdx] = { ...srcCol };
      setColumns(newCols);
    } else {
      destCol.cards.splice(destination.index, 0, moved);
      const newCols = [...columns];
      newCols[srcColIdx] = { ...srcCol };
      newCols[destColIdx] = { ...destCol };
      setColumns(newCols);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-container">
        <h1 className="kanban-title">칸반 보드</h1>
        <div className="kanban-columns">
          {columns.map(col => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="kanban-column"
                >
                  <div className="column-header">
                    <h2>{col.title}</h2>
                    {col.sprint && <span className="sprint-label">{col.sprint}</span>}
                  </div>
                  <div className="column-cards">
                    {col.cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="kanban-card"
                          >
                            <div className="card-header">
                              <span className="card-title">{card.title}</span>
                              <span className={`card-type ${card.type}`}>{card.type}</span>
                            </div>
                            <div className="card-period">{renderPeriod(card.start, card.due)}</div>
                            <div className="card-footer">
                              <span className={`card-priority ${card.priority === '높음' ? 'high' : 'low'}`}>{card.priority}</span>
                              <span className="card-assignee">👤 {card.assignee}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  <button className="add-card-btn">+ 새 업무 생성</button>
                </div>
              )}
            </Droppable>
          ))}
        </div>
        <nav className="kanban-nav">
          {['요약', '타임라인', '보드', '업무목록', '모든업무', 'PR'].map(it => (
            <div key={it} className="nav-item">{it}</div>
          ))}
        </nav>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;

/*
src/components/KanbanBoard.css
(기존 CSS 유지)*/
