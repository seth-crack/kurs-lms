import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { useHomework } from '../../store/useHomework';
import { useUsers } from '../../store/useUsers';
import { NAV_STUDENT, NAV_TEACHER } from '../../lib/nav';

import Icon from '../../ui/Icon';
import Avatar from '../../ui/Avatar';

export default function CmdK() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const items = useHomework((s) => s.items);
  const users = useUsers((s) => s.users);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const commands = useMemo(() => {
    if (!user) return [];
    const nav = user.role === 'teacher' ? NAV_TEACHER : NAV_STUDENT;

    const navItems = nav.map((n) => ({
      id: 'nav_' + n.id,
      type: 'Раздел',
      icon: n.icon,
      label: n.label,
      action: () => navigate(n.path),
    }));

    // ученики — только у учителя, только его
    const studentItems =
      user.role === 'teacher'
        ? users
            .filter(
              (u) => u.role === 'student' && u.teacherId === user.id
            )
            .map((s) => ({
              id: 'stu_' + s.id,
              type: 'Ученик',
              avatar: {
                short: s.name
                  .split(' ')
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase(),
                color: s.color || '#4F46E5',
              },
              label: s.name,
              hint: s.group || '',
              action: () => navigate('/students'),
            }))
        : [];

    // задания пользователя
    const myHomework = items
      .filter((h) => {
        if (user.role === 'teacher') return h.teacherId === user.id;
        return h.student_ids?.includes(user.id);
      })
      .slice(0, 20)
      .map((h) => ({
        id: 'hw_' + h.id,
        type: 'Задание',
        icon: 'file-text',
        label: h.title,
        hint: h.subject,
        action: () => navigate('/homework'),
      }));

    return [...navItems, ...studentItems, ...myHomework];
  }, [user, items, users, navigate]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return commands.slice(0, 8);
    return commands
      .filter(
        (c) =>
          c.label.toLowerCase().includes(query) ||
          (c.hint || '').toLowerCase().includes(query)
      )
      .slice(0, 12);
  }, [commands, q]);

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-cmd-idx="${activeIndex}"]`
    );
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!user || !open) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) {
        item.action();
        setOpen(false);
      }
    }
  };

  const groups = {};
  filtered.forEach((c) => {
    if (!groups[c.type]) groups[c.type] = [];
    groups[c.type].push(c);
  });

  let globalIdx = -1;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,16,19,.4)',
        backdropFilter: 'blur(6px)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'fade .15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-3)',
          overflow: 'hidden',
          animation: 'pop .2s ease',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '70vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Icon name="search" size={18} style={{ color: 'var(--text-3)' }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск: разделы, ученики, задания…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 0,
              outline: 'none',
              fontSize: 15,
              color: 'var(--text)',
            }}
          />
          <span
            className="small"
            style={{
              color: 'var(--text-3)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '2px 6px',
              fontSize: 11,
            }}
          >
            ESC
          </span>
        </div>

        <div ref={listRef} style={{ overflowY: 'auto', padding: 6 }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--text-3)',
                fontSize: 13.5,
              }}
            >
              Ничего не найдено
            </div>
          ) : (
            Object.entries(groups).map(([type, group]) => (
              <div key={type}>
                <div
                  style={{
                    padding: '8px 12px 4px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                  }}
                >
                  {type}
                </div>
                {group.map((c) => {
                  globalIdx++;
                  const idx = globalIdx;
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={c.id}
                      data-cmd-idx={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        c.action();
                        setOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: isActive
                          ? 'var(--accent-soft)'
                          : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text)',
                        transition: 'background .1s',
                      }}
                    >
                      {c.avatar ? (
                        <Avatar
                          short={c.avatar.short}
                          color={c.avatar.color}
                          size="s"
                        />
                      ) : (
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            background: isActive
                              ? 'var(--accent)'
                              : 'var(--surface-2)',
                            color: isActive ? '#fff' : 'var(--text-3)',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name={c.icon} size={14} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {c.label}
                        </div>
                        {c.hint && (
                          <div
                            className="small"
                            style={{
                              color: isActive
                                ? 'var(--accent)'
                                : 'var(--text-3)',
                              opacity: isActive ? 0.75 : 1,
                            }}
                          >
                            {c.hint}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <Icon name="corner-down-left" size={14} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            padding: '8px 14px',
            borderTop: '1px solid var(--border)',
            fontSize: 11,
            color: 'var(--text-3)',
          }}
        >
          <span className="row" style={{ gap: 4 }}>
            <span className="kbd">↑</span>
            <span className="kbd">↓</span>
            навигация
          </span>
          <span className="row" style={{ gap: 4 }}>
            <span className="kbd">Enter</span>
            открыть
          </span>
          <span className="row" style={{ gap: 4 }}>
            <span className="kbd">Esc</span>
            закрыть
          </span>
        </div>
      </div>
    </div>
  );
}