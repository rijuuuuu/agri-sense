import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, Filter, Calendar, Info } from 'lucide-react';
import type { FarmTask, ActionCategory } from '@agrisense/shared';
import type { Language, Translations } from '../../i18n/translations.js';
import { 
  getLocalizedTask, 
  getLocalizedPriority, 
  getLocalizedCategory 
} from '../../i18n/localizedEntities.js';

interface ActionsViewProps {
  tasks: FarmTask[];
  onToggleTask: (taskId: string) => void;
  language: Language;
  t: Translations;
}

export const ActionsView: React.FC<ActionsViewProps> = ({ 
  tasks, 
  onToggleTask, 
  language, 
  t 
}) => {
  const [filter, setFilter] = useState<'all' | 'irrigation' | 'monitoring' | 'weather'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'irrigation') return task.category === 'irrigation';
    if (filter === 'monitoring') return task.category === 'pest_monitoring';
    if (filter === 'weather') return task.category === 'weather_alert';
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="card card-elevated" style={{ borderLeft: '4px solid var(--primary-600)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <CheckCircle2 size={24} color="var(--primary-600)" />
              {t.actions.title}
            </h2>
            <p style={{ fontSize: '0.9rem' }}>
              {t.actions.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {completedCount} / {tasks.length} {t.actions.completedOf}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: t.actions.allTasks },
          { key: 'irrigation', label: t.actions.irrigation },
          { key: 'monitoring', label: t.actions.scouting },
          { key: 'weather', label: t.actions.weatherDefense }
        ].map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key as any)}
            className={`btn ${filter === item.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)' }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="card">
        {filteredTasks.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t.actions.noTasksCategory}
          </div>
        ) : (
          filteredTasks.map(task => {
            const locTask = getLocalizedTask(task, language);
            const locPriority = getLocalizedPriority(task.priority, language);
            const locCategory = getLocalizedCategory(task.category, language);

            return (
              <div 
                key={task.id} 
                className="task-item"
                style={{
                  opacity: task.completed ? 0.6 : 1,
                  borderLeft: task.priority === 'high' ? '4px solid var(--status-urgent)' : '4px solid var(--primary-600)'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => onToggleTask(task.id)}
                  className="task-checkbox" 
                  id={`task-detail-${task.id}`}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}>
                      {locTask.title}
                    </span>
                    <span className={`badge ${task.priority === 'high' ? 'badge-demo' : 'badge-not-configured'}`} style={{ fontSize: '0.7rem' }}>
                      {locPriority}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.actions.categoryLabel}: {locCategory}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    {locTask.description}
                  </p>

                  <div style={{ 
                    fontSize: '0.78rem', 
                    color: 'var(--text-secondary)', 
                    background: 'var(--bg-app)', 
                    padding: '0.4rem 0.65rem', 
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <Info size={14} color="var(--primary-600)" />
                    <span><strong>{t.actions.rationaleLabel}:</strong> {locTask.rationale}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
