import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUsers } from '../../store/useUsers';
import { useChats } from '../../store/useChats';
import { makeChatId } from '../../lib/messages';
import { fmtTime } from '../../lib/time';
import { uploadFiles, downloadFile } from '../../lib/upload';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import Empty from '../../ui/Empty';

export default function ChatPage() {
  const user = useAuth((s) => s.user);
  const users = useUsers((s) => s.users);

  const threads = useChats((s) => s.threads);
  const loadChat = useChats((s) => s.load);
  const subscribe = useChats((s) => s.subscribe);
  const unsubscribe = useChats((s) => s.unsubscribe);
  const sendMsg = useChats((s) => s.send);
  const markRead = useChats((s) => s.markRead);

  const [activeId, setActiveId] = useState(null);
  const [mobileView, setMobileView] = useState('list');
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);

  // Список контактов
  const contacts = useMemo(() => {
    if (!user) return [];

    if (user.role === 'student') {
      const teacher = users.find((u) => u.id === user.teacher_id);
      if (!teacher) return [];
      return [
        {
          id: teacher.id,
          name: teacher.name,
          short: (teacher.name || '')
            .split(' ')
            .map((x) => x[0])
            .slice(0, 2)
            .join('')
            .toUpperCase(),
          color: teacher.color || '#4F46E5',
          subtitle: 'Преподаватель',
          chatId: makeChatId(teacher.id, user.id),
        },
      ];
    }

    const myStudents = users.filter(
      (u) => u.role === 'student' && u.teacher_id === user.id
    );
    return myStudents.map((s) => ({
      id: s.id,
      name: s.name,
      short: (s.name || '')
        .split(' ')
        .map((x) => x[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      color: s.color || '#4F46E5',
      subtitle: s.group_name || 'Ученик',
      chatId: makeChatId(user.id, s.id),
    }));
  }, [user, users]);

  const contact = contacts.find((c) => c.id === activeId) || contacts[0];
  const chatId = contact?.chatId;
  const messages = chatId ? threads[chatId] || [] : [];

  // Загрузка + подписка при выборе чата
  useEffect(() => {
    if (!chatId) return;
    loadChat(chatId);
    subscribe(chatId);
    return () => {
      // не отписываемся сразу — оставляем подписку живой при переключении
    };
  }, [chatId, loadChat, subscribe]);

  // Отмечаем прочитанным при открытии
  useEffect(() => {
    if (chatId && user) {
      markRead(chatId, user.id);
    }
  }, [chatId, user, markRead]);

  // Автоскролл
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeId]);

  const openChat = (id) => {
    setActiveId(id);
    setMobileView('chat');
  };

  const handleFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;
    setUploading(true);
    const uploaded = await uploadFiles(list, 'chat');
    setAttachments((a) => [...a, ...uploaded]);
    setUploading(false);
  };

  const removeAttachment = (i) => {
    setAttachments((a) => a.filter((_, j) => j !== i));
  };

  const send = async () => {
    if (!text.trim() && attachments.length === 0) return;
    if (!chatId || !user) return;

    setSending(true);
    await sendMsg({
      chatId,
      senderId: user.id,
      text: text.trim(),
      files: attachments,
    });
    setText('');
    setAttachments([]);
    setSending(false);
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
            Общение с{' '}
            {user.role === 'student' ? 'преподавателем' : 'учениками'}
          </div>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="message-circle"
            title="Нет собеседников"
            desc={
              user.role === 'student'
                ? 'Обратитесь к вашему учителю'
                : 'Пригласите учеников — с ними можно будет переписываться'
            }
          />
        </div>
      ) : (
        <div className="chat-layout">
          <div
            className={`chat-list ${
              mobileView === 'chat' ? 'mobile-hidden' : ''
            }`}
          >
            {contacts.map((c) => {
              const thread = threads[c.chatId] || [];
              const last = thread[thread.length - 1];
              const unread = thread.filter(
                (m) => !m.read && m.sender_id !== user.id
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
                      {last && (
                        <div className="ci-time">
                          {fmtTime(new Date(last.created_at).getTime())}
                        </div>
                      )}
                    </div>
                    <div className="ci-preview">
                      {last
                        ? `${
                            last.sender_id === user.id ? 'Вы: ' : ''
                          }${last.text || '📎 файл'}`
                        : 'Нет сообщений'}
                    </div>
                  </div>
                  {unread > 0 && <div className="ci-unread">{unread}</div>}
                </div>
              );
            })}
          </div>

          <div
            className={`chat-main ${
              mobileView === 'list' ? 'mobile-hidden' : ''
            }`}
          >
            {!contact ? (
              <Empty
                icon="message-circle"
                title="Выберите чат"
                desc="Слева — список диалогов"
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
                  <Avatar
                    short={contact.short}
                    color={contact.color}
                    size="m"
                  />
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
                      const mine = m.sender_id === user.id;
                      return (
                        <div
                          key={m.id}
                          className={`msg ${mine ? 'mine' : ''}`}
                        >
                          <Avatar
                            short={mine ? 'Вы' : contact.short}
                            color={mine ? user.color : contact.color}
                            size="s"
                          />
                          <div>
                            <div className="bubble">
                              {m.text}
                              {m.files?.map((f, i) => (
                                <div
                                  key={i}
                                  className="attach"
                                  onClick={() =>
                                    f.url && downloadFile(f.url, f.name)
                                  }
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div
                                    className="a-ic"
                                    style={
                                      mine
                                        ? {
                                            background:
                                              'rgba(255,255,255,.2)',
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
                                  <Icon name="download" size={14} />
                                </div>
                              ))}
                            </div>
                            <div className="msg-meta">
                              {fmtTime(new Date(m.created_at).getTime())}
                            </div>
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
                          <button onClick={() => removeAttachment(i)}>
                            <Icon name="x" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="chat-input-row">
                    <label
                      className="icon-btn"
                      style={{
                        cursor: uploading ? 'wait' : 'pointer',
                        opacity: uploading ? 0.6 : 1,
                      }}
                    >
                      <Icon
                        name={uploading ? 'refresh-cw' : 'paperclip'}
                        size={18}
                      />
                      <input
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFiles}
                        disabled={uploading}
                      />
                    </label>

                    <textarea
                      placeholder="Написать сообщение…"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={handleKey}
                      rows={1}
                    />

                    <Button
                      variant="primary"
                      icon="send"
                      onClick={send}
                      disabled={sending || uploading}
                    >
                      <span className="hide-mobile">Отправить</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}