import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUI } from '../../store/useUI';
import { useChats } from '../../store/useChats';
import { TEACHERS, STUDENTS } from '../../data/mock';
import { fmtTime } from '../../lib/time';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import Empty from '../../ui/Empty';

function useContacts() {
  const user = useAuth((s) => s.user);

  return useMemo(() => {
    if (!user) return [];

    if (user.role === 'student') {
      return TEACHERS.slice(0, 3).map((t, i) => ({
        id: t.id,
        name: t.name,
        short: t.short,
        color: t.color,
        subtitle: t.subject,
        chatId: ['c1', 'c2', 'c3'][i],
      }));
    }

    return STUDENTS.slice(0, 4).map((s) => ({
      id: s.id,
      name: s.name,
      short: s.short,
      color: s.color,
      subtitle: s.group,
      chatId: 'c1',
    }));
  }, [user]);
}

export default function ChatPage() {
  const user = useAuth((s) => s.user);
  const toast = useUI((s) => s.toast);
  const threads = useChats((s) => s.threads);
  const addMessage = useChats((s) => s.addMessage);
  const markRead = useChats((s) => s.markRead);

  const contacts = useContacts();
  const [activeId, setActiveId] = useState(null);
  const [mobileView, setMobileView] = useState('list');
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);

  const scrollRef = useRef(null);

  const contact = contacts.find((c) => c.id === activeId) || contacts[0];
  const chatId = contact?.chatId;
  const messages = chatId ? threads[chatId] || [] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeId]);

  useEffect(() => {
    if (chatId) markRead(chatId, user.id);
  }, [chatId, user.id, markRead]);

  const openChat = (id) => {
    setActiveId(id);
    setMobileView('chat');
  };

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || []);
    const metas = list.map((f) => ({
      name: f.name,
      size:
        f.size < 1024 * 1024
          ? Math.round(f.size / 1024) + ' КБ'
          : (f.size / 1024 / 1024).toFixed(1) + ' МБ',
      type: f.type.startsWith('image/')
        ? 'img'
        : f.name.endsWith('.pdf')
        ? 'pdf'
        : 'file',
    }));
    setAttachments((a) => [...a, ...metas]);
  };

  const send = () => {
    if (!text.trim() && attachments.length === 0) return;
    if (!chatId) return;

    const msg = {
      id: 'm' + Math.random().toString(36).slice(2),
      from: user.id,
      text: text.trim(),
      at: Date.now(),
      read: false,
      files: attachments,
    };

    addMessage(chatId, msg);
    setText('');
    setAttachments([]);

    if (contact && user.role === 'student') {
      setTimeout(() => {
        addMessage(chatId, {
          id: 'm' + Math.random().toString(36).slice(2),
          from: contact.id,
          text: 'Хорошо, посмотрю. Спасибо!',
          at: Date.now(),
          read: false,
        });
        toast('info', 'Новое сообщение', contact.name.split(' ')[0]);
      }, 1500);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: 14 }}>
        <div>
          <div className="page-title">Чаты</div>
          <div className="page-sub">
            Общение с {user.role === 'student' ? 'преподавателями' : 'учениками'}
          </div>
        </div>
      </div>

      <div className="chat-layout">
        <div
          className={`chat-list ${mobileView === 'chat' ? 'mobile-hidden' : ''}`}
        >
          {contacts.map((c) => {
            const thread = threads[c.chatId] || [];
            const last = thread[thread.length - 1];
            const unread = thread.filter(
              (m) => !m.read && m.from !== user.id
            ).length;
            const isActive = contact?.id === c.id;

            return (
              <div
                key={c.id}
                className={`chat-item ${isActive ? 'active' : ''}`}
                onClick={() => openChat(c.id)}
              >
                <Avatar short={c.short} color={c.color} size="m" />
                <div className="ci-body">
                  <div className="ci-top">
                    <div className="ci-name">{c.name}</div>
                    {last && <div className="ci-time">{fmtTime(last.at)}</div>}
                  </div>
                  <div className="ci-preview">
                    {last
                      ? `${last.from === user.id ? 'Вы: ' : ''}${last.text || '📎 файл'}`
                      : 'Нет сообщений'}
                  </div>
                </div>
                {unread > 0 && <div className="ci-unread">{unread}</div>}
              </div>
            );
          })}
        </div>

        <div
          className={`chat-main ${mobileView === 'list' ? 'mobile-hidden' : ''}`}
        >
          {!contact ? (
            <Empty
              icon="message-circle"
              title="Выберите чат"
              desc="Слева — список ваших диалогов"
            />
          ) : (
            <>
              <div className="chat-head">
                <button
                  className="icon-btn chat-back"
                  onClick={() => setMobileView('list')}
                >
                  <Icon name="arrow-left" size={18} />
                </button>
                <Avatar short={contact.short} color={contact.color} size="m" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {contact.name}
                  </div>
                  <div className="small muted">{contact.subtitle}</div>
                </div>
              </div>

              <div className="chat-messages" ref={scrollRef}>
                {messages.length === 0 ? (
                  <Empty
                    icon="message-circle"
                    title="Нет сообщений"
                    desc="Напишите первое сообщение"
                  />
                ) : (
                  messages.map((m) => {
                    const mine = m.from === user.id;
                    return (
                      <div key={m.id} className={`msg ${mine ? 'mine' : ''}`}>
                        <Avatar
                          short={mine ? user.short : contact.short}
                          color={mine ? user.color : contact.color}
                          size="s"
                        />
                        <div>
                          <div className="bubble">
                            {m.text}
                            {m.files?.map((f, i) => (
                              <div key={i} className="attach">
                                <div
                                  className="a-ic"
                                  style={
                                    mine
                                      ? {
                                          background: 'rgba(255,255,255,.2)',
                                          color: '#fff',
                                        }
                                      : undefined
                                  }
                                >
                                  <Icon
                                    name={
                                      f.type === 'pdf'
                                        ? 'file-text'
                                        : f.type === 'img'
                                        ? 'image'
                                        : 'file'
                                    }
                                    size={14}
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: 12.5,
                                      fontWeight: 500,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {f.name}
                                  </div>
                                  <div
                                    className="a-sub"
                                    style={{ fontSize: 11 }}
                                  >
                                    {f.size}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="msg-meta">{fmtTime(m.at)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="chat-input">
                {attachments.length > 0 && (
                  <div className="chat-attach-preview">
                    {attachments.map((f, i) => (
                      <div key={i} className="chat-attach-chip">
                        <Icon name="paperclip" size={12} /> {f.name}
                        <button
                          onClick={() =>
                            setAttachments((a) => a.filter((_, j) => j !== i))
                          }
                        >
                          <Icon name="x" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="chat-input-row">
                  <label className="icon-btn" style={{ cursor: 'pointer' }}>
                    <Icon name="paperclip" size={18} />
                    <input
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFiles}
                    />
                  </label>

                  <textarea
                    placeholder="Написать сообщение…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                  />

                  <Button variant="primary" icon="send" onClick={send}>
                    <span className="hide-mobile">Отправить</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}