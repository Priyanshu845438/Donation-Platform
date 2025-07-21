
import React, { useState, useEffect } from 'react';
import { taskAPI } from '../../services/api.ts';
import type { Task } from '../../types.ts';
import { FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CalendarViewProps {
  onEdit: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onEdit }) => {
  const [date, setDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const response = await taskAPI.getCalendarView({ year, month });
        setCalendarData(response.calendar);
      } catch (err: any) {
        setError(err.message || 'Failed to load calendar data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [date]);

  const handlePrevMonth = () => setDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const handleNextMonth = () => setDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  
  const generateCalendarGrid = () => {
    if (!calendarData) return [];

    const year = calendarData.year;
    const month = calendarData.month - 1;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = [];
    let day = 1;
    for (let i = 0; i < 6; i++) { // Max 6 weeks in a month view
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push(<div key={`empty-start-${j}`} className="border-r border-b dark:border-gray-700 p-2 h-28"></div>);
        } else if (day > daysInMonth) {
          week.push(<div key={`empty-end-${day}`} className="border-r border-b dark:border-gray-700 p-2 h-28"></div>);
        } else {
          const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const tasksForDay = calendarData.tasksByDate[currentDateStr] || [];
          
          const today = new Date();
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

          week.push(
            <div key={day} className={`border-r border-b dark:border-gray-700 p-2 h-28 overflow-y-auto ${isToday ? 'bg-sky-blue/10' : ''}`}>
              <div className={`font-bold ${isToday ? 'text-sky-blue' : 'text-gray-700 dark:text-gray-300'}`}>{day}</div>
              <div className="mt-1 space-y-1">
                {tasksForDay.map((task: Task) => (
                  <div 
                    key={task._id} 
                    onClick={() => onEdit(task)}
                    className="text-xs p-1 rounded-md cursor-pointer bg-brand-gold/20 text-brand-gold/80 hover:bg-brand-gold/40 truncate"
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
          day++;
        }
      }
      grid.push(week);
      if (day > daysInMonth) break;
    }
    return grid;
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarGrid = generateCalendarGrid();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-brand-dark"><FiChevronLeft /></button>
        <h2 className="text-xl font-bold text-navy-blue dark:text-white">
          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-brand-dark"><FiChevronRight /></button>
      </div>

      {loading && <div className="flex justify-center items-center p-8"><FiLoader className="animate-spin mr-2"/>Loading calendar...</div>}
      {error && <div className="flex justify-center items-center p-8 text-red-500"><FiAlertCircle className="mr-2"/>{error}</div>}

      {!loading && !error && calendarData && (
        <div className="border-t border-l dark:border-gray-700">
          <div className="grid grid-cols-7">
            {weekdays.map(day => <div key={day} className="text-center font-semibold p-2 border-b border-r dark:border-gray-700 bg-gray-50 dark:bg-brand-dark">{day}</div>)}
          </div>
          {calendarGrid.map((week, i) => (
            <div key={i} className="grid grid-cols-7">{week}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
