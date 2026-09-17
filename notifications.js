/**
 * FreeBuddy - 알림 공통 모듈 (notifications.js)
 * 사용법: <script src="notifications.js"></script>
 * initNotifications(sb, userId) 호출 시 벨 아이콘 + 드롭다운 자동 생성
 */

(function () {
  /* ── 스타일 주입 ── */
  var style = document.createElement('style');
  style.textContent = `
    /* 알림 벨 래퍼 */
    .notif-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    /* 벨 버튼 */
    .notif-bell {
      width: 36px;
      height: 36px;
      border: 1px solid #e0e3e7;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      position: relative;
      transition: border-color 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .notif-bell:hover { border-color: #1D9E75; background: #f0faf6; }

    /* 읽지 않은 배지 */
    .notif-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      min-width: 17px;
      height: 17px;
      background: #e53935;
      color: #fff;
      border-radius: 9px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 2px solid #fff;
      pointer-events: none;
    }
    .notif-badge.hidden { display: none; }

    /* 드롭다운 패널 */
    .notif-panel {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 320px;
      background: #fff;
      border: 1px solid #e0e3e7;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      z-index: 9999;
      overflow: hidden;
      display: none;
      animation: notifFadeIn 0.15s ease;
    }
    .notif-panel.open { display: block; }

    @keyframes notifFadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* 패널 헤더 */
    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid #f1f3f5;
    }
    .notif-header-title {
      font-size: 14px;
      font-weight: 700;
      color: #111;
    }
    .notif-read-all {
      font-size: 12px;
      color: #1D9E75;
      cursor: pointer;
      border: none;
      background: none;
      font-weight: 600;
      padding: 0;
    }
    .notif-read-all:hover { text-decoration: underline; }

    /* 알림 목록 */
    .notif-list {
      max-height: 340px;
      overflow-y: auto;
    }
    .notif-list::-webkit-scrollbar { width: 4px; }
    .notif-list::-webkit-scrollbar-thumb { background: #e0e3e7; border-radius: 2px; }

    /* 개별 알림 항목 */
    .notif-item {
      display: flex;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid #f8f9fa;
      cursor: pointer;
      transition: background 0.1s;
      text-decoration: none;
    }
    .notif-item:hover { background: #f8f9fa; }
    .notif-item.unread { background: #f0faf6; }
    .notif-item.unread:hover { background: #e8f8f2; }
    .notif-item:last-child { border-bottom: none; }

    /* 알림 아이콘 */
    .notif-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #e8f8f2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }
    .notif-icon.type-lesson_booking { background: #fff3e0; }
    .notif-icon.type-buddy_comment  { background: #e8f8f2; }
    .notif-icon.type-comment_reply  { background: #EEEDFE; }

    /* 알림 텍스트 */
    .notif-text { flex: 1; min-width: 0; }
    .notif-title {
      font-size: 13px;
      font-weight: 600;
      color: #111;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-msg {
      font-size: 12px;
      color: #666;
      line-height: 1.5;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-time {
      font-size: 11px;
      color: #bbb;
      margin-top: 3px;
    }

    /* 읽지 않음 점 */
    .notif-dot {
      width: 7px;
      height: 7px;
      background: #1D9E75;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }

    /* 빈 상태 */
    .notif-empty {
      text-align: center;
      padding: 36px 16px;
      color: #bbb;
      font-size: 13px;
    }
    .notif-empty-icon { font-size: 32px; margin-bottom: 8px; }

    /* 패널 푸터 */
    .notif-footer {
      padding: 10px 16px;
      border-top: 1px solid #f1f3f5;
      text-align: center;
    }
    .notif-footer a {
      font-size: 12px;
      color: #888;
      text-decoration: none;
    }
    .notif-footer a:hover { color: #1D9E75; }

    /* 모바일 대응 */
    @media (max-width: 480px) {
      .notif-panel {
        width: calc(100vw - 32px);
        right: -16px;
      }
    }
  `;
  document.head.appendChild(style);

  /* ── 시간 포맷 ── */
  function timeAgo(dateStr) {
    var diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)   return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    return Math.floor(diff / 86400) + '일 전';
  }

  /* ── 타입별 아이콘/라벨 ── */
  function typeInfo(type) {
    switch (type) {
      case 'buddy_comment':  return { icon: '💬', label: '버디 댓글' };
      case 'lesson_booking': return { icon: '🎓', label: '강습 신청' };
      case 'comment_reply':  return { icon: '↩️', label: '대댓글' };
      default:               return { icon: '🔔', label: '알림' };
    }
  }

  /* ── 알림 패널 HTML 렌더 ── */
  function renderPanel(notifications) {
    var list = document.getElementById('notifList');
    if (!list) return;

    if (!notifications || notifications.length === 0) {
      list.innerHTML = `
        <div class="notif-empty">
          <div class="notif-empty-icon">🔔</div>
          새로운 알림이 없습니다
        </div>
      `;
      return;
    }

    list.innerHTML = notifications.map(function(n) {
      var info = typeInfo(n.type);
      var unreadClass = n.is_read ? '' : 'unread';
      var link = n.link || '#';
      return `
        <a class="notif-item ${unreadClass}" href="${link}" onclick="markRead(event, '${n.id}', '${link}')">
          <div class="notif-icon type-${n.type}">${info.icon}</div>
          <div class="notif-text">
            <div class="notif-title">${n.title}</div>
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">${timeAgo(n.created_at)}</div>
          </div>
          ${n.is_read ? '' : '<div class="notif-dot"></div>'}
        </a>
      `;
    }).join('');
  }

  /* ── 배지 업데이트 ── */
  function updateBadge(unreadCount) {
    var badge = document.getElementById('notifBadge');
    if (!badge) return;
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  /* ── 공개 API ── */
  window.initNotifications = function (sb, userId) {
    if (!sb || !userId) return;

    /* 1. 벨 버튼 + 패널 DOM 삽입 */
    var navUser = document.getElementById('navUser');
    if (!navUser) return;

    /* 이미 삽입된 경우 중복 방지 */
    if (document.getElementById('notifWrap')) return;

    var wrap = document.createElement('div');
    wrap.className = 'notif-wrap';
    wrap.id = 'notifWrap';
    wrap.innerHTML = `
      <button class="notif-bell" id="notifBell" aria-label="알림" onclick="toggleNotifPanel()">
        🔔
        <span class="notif-badge hidden" id="notifBadge"></span>
      </button>
      <div class="notif-panel" id="notifPanel">
        <div class="notif-header">
          <span class="notif-header-title">알림</span>
          <button class="notif-read-all" onclick="markAllRead()">모두 읽음</button>
        </div>
        <div class="notif-list" id="notifList">
          <div class="notif-empty"><div class="notif-empty-icon">🔔</div>불러오는 중...</div>
        </div>
        <div class="notif-footer"><a href="my-page.html">마이페이지에서 전체 보기 →</a></div>
      </div>
    `;

    /* 로그인 버튼 앞에 삽입 */
    navUser.insertBefore(wrap, navUser.firstChild);

    /* 2. 알림 목록 로드 */
    async function loadNotifs() {
      var res = await sb.from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      var data = res.data || [];
      var unread = data.filter(function(n) { return !n.is_read; }).length;
      updateBadge(unread);
      renderPanel(data);
    }

    loadNotifs();

    /* 3. 실시간 구독 */
    sb.channel('notif-' + userId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: 'user_id=eq.' + userId
      }, function (payload) {
        loadNotifs();
        /* 잠깐 벨 흔들기 */
        var bell = document.getElementById('notifBell');
        if (bell) {
          bell.style.animation = 'none';
          bell.style.transform = 'rotate(-20deg)';
          setTimeout(function() {
            bell.style.transition = 'transform 0.4s';
            bell.style.transform = 'rotate(0deg)';
          }, 100);
        }
      })
      .subscribe();

    /* 4. 토글 */
    window.toggleNotifPanel = function () {
      var panel = document.getElementById('notifPanel');
      if (!panel) return;
      var isOpen = panel.classList.toggle('open');
      if (isOpen) loadNotifs();
    };

    /* 5. 패널 외부 클릭 시 닫기 */
    document.addEventListener('click', function (e) {
      var wrap = document.getElementById('notifWrap');
      if (wrap && !wrap.contains(e.target)) {
        var panel = document.getElementById('notifPanel');
        if (panel) panel.classList.remove('open');
      }
    });

    /* 6. 읽음 처리 (개별) */
    window.markRead = async function (e, notifId, link) {
      e.preventDefault();
      await sb.from('notifications')
        .update({ is_read: true })
        .eq('id', notifId)
        .eq('user_id', userId);
      if (link && link !== '#') location.href = link;
    };

    /* 7. 모두 읽음 처리 */
    window.markAllRead = async function () {
      await sb.from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      updateBadge(0);
      /* 점 제거 */
      document.querySelectorAll('.notif-item .notif-dot').forEach(function(d) { d.remove(); });
      document.querySelectorAll('.notif-item.unread').forEach(function(el) {
        el.classList.remove('unread');
      });
    };
  };

})();
